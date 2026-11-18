"""Bilan des formulaires observés dans une session de démo délimitée.

Le passage A/B/C est un ordre de visites. Il peut contenir des interruptions
et ne prouve ni la source du mandat, ni une soumission, ni un temps complet.
"""
from collections import Counter
from itertools import groupby

from detection.detection import _clean_events, action_portail_url

FORMULAIRES = {f'Portail {site} / formulaire': site for site in 'ABC'}
FICHES = {f'Portail {site} / fiche annonce' for site in 'ABC'}


def diagnostic_portails(evenements):
    lignes = _clean_events(evenements)
    formulaires = Counter()
    interruptions = 0
    passages = []
    for _, groupe in groupby(lignes, key=lambda e: (e.get('audit_id'), e.get('utilisateur_id'))):
        # Conserver seulement des noms de site, des nombres et les bornes des visites.
        visites = []
        nb_interruptions = 0
        for evt in groupe:
            if evt.get('type') == 'hors_perimetre':
                nb_interruptions += 1
                continue
            action = action_portail_url(evt.get('url'))
            if action in FICHES:
                continue
            site = FORMULAIRES.get(action)
            if site is None:
                # Une autre activité visible sépare les parcours.
                visites.append(None)
                continue
            formulaires[site] += 1
            if visites and visites[-1] and visites[-1][0] == site:
                visites[-1] = (site, visites[-1][1], nb_interruptions)
            else:
                visites.append((site, nb_interruptions, nb_interruptions))

        for a, b, c in zip(visites, visites[1:], visites[2:]):
            if a and b and c and (a[0], b[0], c[0]) == ('A', 'B', 'C'):
                passages.append({'hors_perimetre_entre_formulaires': c[2] - a[1]})
        interruptions += nb_interruptions

    return {
        'evenements': len(lignes),
        'hors_perimetre': interruptions,
        'captures_formulaire': {site: formulaires[site] for site in 'ABC'},
        'passages_formulaires_A_B_C': len(passages),
        'passages': passages,
    }
