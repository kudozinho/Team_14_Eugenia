"""Génère seed_mardi.sql à partir des fausses données de commun/donnees/.

Usage (depuis la racine du dépôt) :
    python henriquet-cdo/supabase/generer_seed.py

Le fichier produit se colle dans l'éditeur SQL de Supabase, après schema-supabase.sql.
Il peut être relancé : chaque insertion ignore les lignes déjà présentes.
"""
import json
from pathlib import Path

RACINE = Path(__file__).resolve().parents[2]
DONNEES = RACINE / "commun" / "donnees"
SORTIE = Path(__file__).resolve().parent / "seed_mardi.sql"


def charger(nom):
    return json.loads((DONNEES / nom).read_text(encoding="utf-8"))


def txt(v):
    """Littéral SQL texte (ou null)."""
    if v is None:
        return "null"
    return "'" + str(v).replace("'", "''") + "'"


def js(v):
    """Littéral SQL jsonb (ou null)."""
    if v is None:
        return "null"
    return txt(json.dumps(v, ensure_ascii=False)) + "::jsonb"


def num(v):
    return "null" if v is None else str(v)


def bool_(v):
    return "null" if v is None else ("true" if v else "false")


lignes = ["-- Données de départ de Ghost (générées par generer_seed.py, ne pas modifier à la main)", "begin;", ""]

# 1. Profils métier : tout sauf id et nom va dans config
lignes.append("-- Profils métier (immobilier, comptable, avocat)")
for p in charger("profils-metier.json"):
    config = {k: v for k, v in p.items() if k not in ("id", "nom")}
    lignes.append(
        f"insert into profils_metier (id, nom, config) values ({txt(p['id'])}, {txt(p['nom'])}, {js(config)}) on conflict (id) do nothing;"
    )

# 2. Organisation fictive et contexte (contrat §7)
ctx = charger("contexte-entreprise-exemple.json")
org = ctx["organisation_id"]
lignes += [
    "",
    "-- Agence fictive",
    f"insert into organisations (id, nom, profil_metier_id) values ({txt(org)}, 'Agence Belvédère (fictive)', {txt(ctx['profil_metier_id'])}) on conflict (id) do nothing;",
    f"insert into contextes_entreprise (id, organisation_id, reponses, resume) values ('ctx_belvedere', {txt(org)}, {js({'source': 'exemple du kit, à remplacer par la vraie réponse au formulaire'})}, {js(ctx['resume'])}) on conflict (id) do nothing;",
]

# 3. Postes (contrat §8)
lignes += ["", "-- Postes"]
for p in charger("postes-exemple.json"):
    lignes.append(
        "insert into postes (id, organisation_id, intitule, missions, outils, peut_decider, ne_peut_pas) values "
        f"({txt(p['id'])}, {txt(p['organisation_id'])}, {txt(p['intitule'])}, {js(p['missions'])}, {js(p['outils'])}, "
        f"{js(p['peut_decider'])}, {js(p['ne_peut_pas'])}) on conflict (id) do nothing;"
    )

# 4. Utilisateurs désignés par leur poste (pas de vrais noms)
lignes += ["", "-- Utilisateurs (désignés par leur poste)"]
for uid, poste, nom, role, mode in [
    ("usr_gerante", "poste_gerante", "Gérante", "gerant", None),
    ("usr_negociateur", "poste_negociateur", "Négociateur 1", "collaborateur", "vocal"),
    ("usr_assistante", "poste_assistante", "Assistante 1", "collaborateur", "ecran"),
]:
    lignes.append(
        "insert into utilisateurs (id, organisation_id, poste_id, nom, role, mode_analyse, consentement_le) values "
        f"({txt(uid)}, {txt(org)}, {txt(poste)}, {txt(nom)}, {txt(role)}, {txt(mode)}, now()) on conflict (id) do nothing;"
    )

# 5. Ce que l'assistante autorise (application et liste blanche de sites)
lignes += ["", "-- Autorisations de l'assistante"]
for i, appli in enumerate(["Google Chrome"], 1):  # tableur = Google Sheets, dans Chrome (décision du 17/11)
    lignes.append(f"insert into applis_autorisees (id, utilisateur_id, appli) values ('app_assist_{i}', 'usr_assistante', {txt(appli)}) on conflict (id) do nothing;")
for i, dom in enumerate(["immogest.example", "ghost-portail-a.vercel.app", "ghost-portail-b.vercel.app", "ghost-portail-c.vercel.app", "docs.google.com"], 1):
    lignes.append(f"insert into sites_autorises (id, utilisateur_id, domaine) values ('site_assist_{i}', 'usr_assistante', {txt(dom)}) on conflict (id) do nothing;")

# 6. Audit de démo
lignes += ["", "-- Audit de démo", f"insert into audits (id, organisation_id, statut) values ('aud_demo', {txt(org)}, 'en_cours') on conflict (id) do nothing;"]

# 7. Exemples pour que chacun puisse développer (à purger avant les vraies sessions de mercredi)
lignes += ["", "-- EXEMPLES DU KIT (purge : voir purger_exemples.sql)"]
for e in charger("evenements-exemple.json"):
    lignes.append(
        "insert into evenements (id, audit_id, utilisateur_id, horodatage, appli, titre_fenetre, url, type, texte_nettoye, miniature_url, empreinte, duree_s) values "
        f"({txt(e['id'])}, {txt(e['audit_id'])}, {txt(e['utilisateur_id'])}, {txt(e['horodatage'])}, {txt(e.get('appli'))}, {txt(e.get('titre_fenetre'))}, "
        f"{txt(e.get('url'))}, {txt(e['type'])}, {txt(e.get('texte_nettoye'))}, {txt(e.get('miniature_url'))}, {txt(e.get('empreinte'))}, {num(e.get('duree_s'))}) on conflict (id) do nothing;"
    )
for t in charger("tache-detectee-exemple.json"):
    lignes.append(
        "insert into taches_detectees (id, audit_id, nom, sequence, occurrences, duree_moyenne_s, temps_perdu_semaine_min, automatisable, methode, "
        "gain_estime_h_semaine, instructions_agent, workflow_n8n_modele, confiance, score, fiche, prompt_empreinte) values "
        f"({txt(t['id'])}, {txt(t['audit_id'])}, {txt(t['nom'])}, {js(t.get('sequence'))}, {num(t.get('occurrences'))}, {num(t.get('duree_moyenne_s'))}, "
        f"{num(t.get('temps_perdu_semaine_min'))}, {bool_(t.get('automatisable'))}, {txt(t.get('methode'))}, {num(t.get('gain_estime_h_semaine'))}, "
        f"{txt(t.get('instructions_agent'))}, {txt(t.get('workflow_n8n_modele'))}, {num(t.get('confiance'))}, {js(t.get('score'))}, {js(t.get('fiche'))}, "
        f"{txt(t.get('prompt_empreinte'))}) on conflict (id) do nothing;"
    )
for t in charger("tests-agent-exemple.json"):
    lignes.append(
        "insert into tests_agent (id, niveau, cas, modele, essai, statut, reussi, duree_s, etapes, cout_usd, erreur, contournement, session_id) values "
        f"({txt(t['id'])}, {num(t['niveau'])}, {txt(t['cas'])}, {txt(t['modele'])}, {num(t['essai'])}, {txt(t['statut'])}, {bool_(t['reussi'])}, "
        f"{num(t['duree_s'])}, {num(t['etapes'])}, {num(t['cout_usd'])}, {txt(t.get('erreur'))}, {txt(t.get('contournement'))}, {txt(t.get('session_id'))}) on conflict (id) do nothing;"
    )

lignes += ["", "commit;", ""]
SORTIE.write_text("\n".join(lignes), encoding="utf-8")
print(f"{SORTIE} écrit ({len(lignes)} lignes)")
