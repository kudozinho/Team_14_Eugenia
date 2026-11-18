"""Détection sans IA sur événements §1/§1bis de Ghost.

Le code ne prétend PAS déduire une fréquence hebdomadaire de 3 observations de démo.
Les durées nulles sont exclues de la moyenne, jamais transformées arbitrairement en 0.
"""
from __future__ import annotations
from collections import defaultdict
from datetime import datetime
import hashlib
import json
import math
import re
from typing import Any, Iterable, Mapping
from urllib.parse import urlsplit

WINDOW_PORTAL = re.compile(r'^portail\s+([ABC])$', re.I)
WINDOW_MANDAT = re.compile(r'(?:ImmoGest|Mandat\s+M[-\d]+)', re.I)
WINDOW_FOLLOWUP = re.compile(r'suivi[_\s-]*prospects', re.I)
PORTAILS = {
    'A': ('/deposer', 'déposer une annonce'),
    'B': ('/nouvelle', 'nouvelle annonce'),
    'C': ('/publier', 'publier un bien'),
}
HOTES_PORTAILS = {
    host: code
    for code in PORTAILS
    for host in (f'ghost-portail-{code.lower()}.vercel.app', f'portail-{code.lower()}.example')
}
FORMULAIRES = {f'Portail {code} / formulaire' for code in PORTAILS}


def action_portail_url(url: str | None) -> str | None:
    """Retourne un libellé fixe pour une URL reconnue des portails de démonstration."""
    if not isinstance(url, str) or not url:
        return None
    try:
        adresse = urlsplit(url)
        code = HOTES_PORTAILS.get(adresse.hostname)
    except ValueError:
        return None
    if code is None or adresse.scheme not in ('http', 'https'):
        return None
    chemin = adresse.path.rstrip('/')
    if chemin == PORTAILS[code][0]:
        page = 'formulaire'
    elif not chemin:
        page = 'accueil'
    elif chemin == '/annonces':
        page = 'liste des annonces'
    elif re.fullmatch(r'/annonces/[^/]+', chemin):
        page = 'fiche annonce'
    else:
        page = 'autre page'
    return f'Portail {code} / {page}'


def evenement_vers_action(e: Mapping[str, Any]) -> str | None:
    """Ne lit jamais les événements hors périmètre, dont le contenu doit être nul."""
    if e.get('type') == 'hors_perimetre':
        return None
    title = str(e.get('titre_fenetre') or '')
    app = str(e.get('appli') or '')
    url = e.get('url')
    if url:
        action = action_portail_url(url)
        if action:
            return action
    else:
        # Les anciens exports peuvent ne contenir que le titre de la fenêtre.
        parties = re.split(r'\s+[-–—|]\s+', title.strip(), maxsplit=2)
        portail = WINDOW_PORTAL.fullmatch(parties[0])
        if portail:
            code = portail.group(1).upper()
            libelle = parties[1].casefold() if len(parties) > 1 else ''
            page = {
                PORTAILS[code][1]: 'formulaire', 'annonce': 'fiche annonce',
                'annonces publiées': 'liste des annonces', '': 'accueil',
            }.get(libelle, 'autre page')
            return f'Portail {code} / {page}'
    if WINDOW_MANDAT.search(title):
        return 'ImmoGest / fiche mandat'
    if WINDOW_FOLLOWUP.search(title):
        return f'{app} / suivi_prospects'  # tableur : Google Sheets depuis le 17/11, plus Excel
    if not title and not app:
        return None
    # Normalise les références de mandats et les chiffres des titres.
    title = re.sub(r'\bM-\d+\b', 'M-[ID]', title)
    title = re.sub(r'\s+', ' ', title).strip()
    return f'{app} / {title}' if title else app


def _clean_events(evenements: Iterable[Mapping[str, Any]]) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for item in evenements:
        if not item.get('horodatage'):
            continue
        row = dict(item)
        # Le tri et le regroupement sont limités au même audit et utilisateur.
        row['_dt'] = datetime.fromisoformat(str(item['horodatage']).replace('Z', '+00:00'))
        rows.append(row)
    rows.sort(key=lambda x: (str(x.get('audit_id')), str(x.get('utilisateur_id')), x['_dt']))
    return rows


def _sessions(evenements: Iterable[Mapping[str, Any]]) -> list[list[dict[str, Any]]]:
    groups: list[list[dict[str, Any]]] = []
    current: list[dict[str, Any]] = []
    prev = None
    for e in _clean_events(evenements):
        identity = (e.get('audit_id'), e.get('utilisateur_id'))
        if prev is not None and identity != prev:
            if current:
                groups.append(current)
            current = []
        prev = identity
        if e.get('type') == 'hors_perimetre':
            # Stoppe une chaîne : une pause inconnue ne lie pas deux séquences.
            if current:
                groups.append(current)
            current = []
            continue
        action = evenement_vers_action(e)
        if not action:
            continue
        duree = e.get('duree_s')
        if type(duree) not in (int, float) or not math.isfinite(duree) or duree < 0:
            duree = None
        # Plusieurs captures pendant la saisie sur une même page forment une étape.
        if current and current[-1]['action'] == action:
            etape = current[-1]
            etape['ids'].append(e['id'])
            ancien = etape['duree_s']
            etape['duree_s'] = ancien + duree if ancien is not None and duree is not None else None
        else:
            current.append({'action': action, 'duree_s': duree, 'ids': [e['id']]})
    if current:
        groups.append(current)
    return groups


def _key_score(key: tuple[str, ...]) -> tuple[int, int, int]:
    """Privilégie une boucle opératoire entre outil source et plusieurs portails."""
    portals = len(FORMULAIRES.intersection(key))
    has_source = 'ImmoGest / fiche mandat' in key
    # Les feuilles de suivi terminales sont traitées comme suivi, pas publication.
    followup = sum('suivi_prospects' in a for a in key)
    return (int(has_source and portals >= 2), portals, len(key) - followup)


def detecter_sequences(evenements: Iterable[Mapping[str, Any]], *, min_occurrences: int = 3,
                       min_etapes: int = 1, max_etapes: int = 5) -> list[dict[str, Any]]:
    """Extrait des séquences observées (niveau code), sans inventer le nom métier."""
    sessions = _sessions(evenements)
    found: dict[tuple[str, ...], list[list[dict[str, Any]]]] = defaultdict(list)
    for sess in sessions:
        for length in range(min_etapes, min(max_etapes, len(sess)) + 1):
            for index in range(len(sess)-length+1):
                sub = sess[index:index+length]
                key = tuple(e['action'] for e in sub)
                found[key].append(sub)
    results: list[dict[str, Any]] = []
    for key, windows in found.items():
        if len(windows) < min_occurrences:
            continue
        # Élimine les chevauchements éventuels ; délimite par audit + utilisateur + horodatage.
        selected: list[list[dict[str, Any]]] = []
        ids_evenements: list[list[str]] = []
        used: set[str] = set()
        for window in windows:
            ids = [ident for step in window for ident in step['ids']]
            if not used.isdisjoint(ids):
                continue
            selected.append(window)
            ids_evenements.append(ids)
            used.update(ids)
        if len(selected) < min_occurrences:
            continue
        durations: list[int] = []
        for window in selected:
            vals = [e.get('duree_s') for e in window]
            # Une durée manquante rend le total incertain, on exclut cette occurrence.
            if all(isinstance(v, (float, int)) and v >= 0 for v in vals):
                durations.append(round(sum(vals)))
        results.append({
            'sequence': list(key),
            'occurrences': len(selected),
            'duree_moyenne_s': round(sum(durations)/len(durations)) if durations else None,
            'occurrences_duree_connue': len(durations),
            'ids_evenements': ids_evenements,
        })
    results.sort(key=lambda r: (_key_score(tuple(r['sequence'])), r['occurrences']), reverse=True)
    return results


def _candidate_to_tache(candidate: Mapping[str, Any], *, identifiant: str,
                         audit_id: str, prompt_empreinte: str | None,
                         frequence_semaine: float | None = None) -> dict[str, Any]:
    seq = candidate['sequence']
    source = 'ImmoGest / fiche mandat' in seq
    portals = FORMULAIRES.intersection(seq)
    publication = source and len(portals) >= 2
    if publication:
        nom = f'Recopier une annonce sur {len(portals)} sites sans passerelle'
        methode = 'agent_h'  # Seulement pour le cas de démo déclaré sans passerelle par l'équipe.
        instructions = ('Sur les portails de test autorisés : consulte le mandat et prépare une annonce sur chaque site. '
                        'Renseigne titre, prix, surface, ville et description à partir des données explicitement fournies. '
                        'Ne modifie pas le prix. Vérifie les mentions obligatoires et fais valider la publication. '
                        'Retourne les portails réellement traités et les erreurs éventuelles.')
    else:
        nom = 'Enchaînement répétitif : ' + ' → '.join(seq)
        methode = 'rien'  # En l'absence d'une preuve sur les APIs, ne pas prétendre choisir n8n.
        instructions = None
    duration = candidate.get('duree_moyenne_s')
    weekly = round(duration*frequence_semaine/60) if duration is not None and frequence_semaine is not None else None
    digest = hashlib.sha256(json.dumps(seq,ensure_ascii=False).encode()).hexdigest()[:8]
    return {
        'id': f'tache_{identifiant}_{digest}', 'audit_id': audit_id,
        'nom': nom, 'sequence': seq, 'occurrences': candidate['occurrences'],
        'duree_moyenne_s': duration, 'temps_perdu_semaine_min': weekly,
        'automatisable': publication,
        'methode': methode,
        'gain_estime_h_semaine': None,  # Nécessite un gain mesuré avec l'agent H et la fréquence réelle.
        'instructions_agent': instructions,
        'workflow_n8n_modele': 'multidiffusion_annonce' if publication else None,
        'confiance': round(min(0.9, 0.5 + 0.1 * candidate['occurrences']),2),
        'score': None, 'fiche': None, 'prompt_empreinte': prompt_empreinte,
    }


def detecter_taches(evenements: Iterable[Mapping[str, Any]], *,
                     prompt_empreinte: str | None = None,
                     frequence_semaine: float | None = None,
                     max_candidates: int = 5) -> list[dict[str, Any]]:
    rows = list(evenements)
    audit_ids = {e.get('audit_id') for e in rows if e.get('audit_id')}
    if len(audit_ids) != 1:
        raise ValueError('Une seule valeur audit_id par lot ; séparer les audits')
    audit_id = next(iter(audit_ids))
    candidates = detecter_sequences(rows)
    # Privilégie un processus complet (source et portails), et ne remonte pas
    # ses sous-séquences comme autant de tâches distinctes. Les actions de
    # suivi réellement distinctes (ex. Excel) sont conservées.
    candidates.sort(key=lambda c: (_key_score(tuple(c['sequence'])), -len(c['sequence'])), reverse=True)
    chosen = []
    already_assigned: set[str] = set()
    for candidate in candidates:
        ids = {ident for window in candidate['ids_evenements'] for ident in window}
        if ids & already_assigned:
            continue  # Une action observée ne doit pas être comptée dans 2 tâches.
        chosen.append(candidate)
        already_assigned |= ids
        if len(chosen) >= max_candidates:
            break
    return [_candidate_to_tache(c, identifiant=f'{i+1:03}', audit_id=audit_id,
             prompt_empreinte=prompt_empreinte, frequence_semaine=frequence_semaine)
            for i,c in enumerate(chosen)]
