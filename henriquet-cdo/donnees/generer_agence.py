"""Génère les données de l'Agence Belvédère (FICTIVE) pour la démo Ghost.

Usage (depuis la racine du dépôt) :
    python henriquet-cdo/donnees/generer_agence.py

Produit, dans henriquet-cdo/donnees/ :
    agence-belvedere.json         agence, 10 collaborateurs (désignés par leur poste), 10 mandats
    prospects-fictifs.json        20 prospects inventés (JAMAIS chargés en base : contrainte du contexte §7)
    stats-portails-semaine.json   vues et contacts par bien, par portail, semaines 46 et 47
et henriquet-cdo/supabase/agence_belvedere.sql (tables mandats et stats_portails + données).

Tout est inventé. Les prix suivent des ordres de grandeur plausibles pour l'Essonne fin 2026 [H].
Le tirage est figé (graine 14) : relancer le script redonne exactement les mêmes chiffres.
"""
import json
import random
from pathlib import Path

ICI = Path(__file__).resolve().parent
SQL = ICI.parent / "supabase" / "agence_belvedere.sql"
rng = random.Random(14)

AGENCE = {
    "id": "org_belvedere",
    "nom": "Agence Belvédère (fictive)",
    "adresse": "12 rue de l'Exemple, 91300 Massy (adresse fictive)",
    "activite": "Transaction et gestion locative, Massy et environs",
    "effectif": 10,
    "logiciel_agence": "ImmoGest (fictif) avec passerelle de multidiffusion",
    "portails": ["Portail A", "Portail B", "Portail C"],
}

# 10 collaborateurs, désignés par leur poste (aucun vrai nom)
COLLABORATEURS = (
    [{"id": "usr_gerante", "poste_id": "poste_gerante", "nom": "Gérante", "role": "gerant", "mode_analyse": None}]
    + [
        {"id": "usr_negociateur" if i == 1 else f"usr_negociateur_{i}", "poste_id": "poste_negociateur",
         "nom": f"Négociateur {i}", "role": "collaborateur", "mode_analyse": "vocal" if i == 1 else None}
        for i in range(1, 7)
    ]
    + [
        {"id": "usr_assistante" if i == 1 else f"usr_assistante_{i}", "poste_id": "poste_assistante",
         "nom": f"Assistante {i}", "role": "collaborateur", "mode_analyse": "ecran" if i == 1 else None}
        for i in range(1, 3)
    ]
    + [{"id": "usr_gestionnaire", "poste_id": "poste_gestionnaire", "nom": "Gestionnaire locatif", "role": "collaborateur", "mode_analyse": None}]
)

POSTE_GESTIONNAIRE = {
    "id": "poste_gestionnaire",
    "organisation_id": "org_belvedere",
    "intitule": "Gestionnaire locatif",
    "missions": ["Suivre les baux et les locataires", "Encaisser et reverser les loyers", "Organiser les états des lieux"],
    "outils": ["Logiciel de gestion locative", "Messagerie", "Banque en ligne"],
    "peut_decider": ["Planning des états des lieux"],
    "ne_peut_pas": ["Signer un bail sans la gérante", "Modifier un loyer"],
}

# 10 mandats de vente. Les 3 premiers reprennent les exemples du kit et servent à la démo.
# (ref, type, titre, ville, cp, surface, pieces, prix, dpe, negociateur, demo, description)
MANDATS = [
    ("M-0142", "Appartement", "Appartement T3 lumineux proche RER", "Massy", "91300", 68, 3, 329000, "C", 1, True,
     "T3 au 2e étage avec ascenseur, séjour sur balcon exposé sud. Deux chambres, cuisine séparée, cave. À 6 minutes à pied du RER B Massy-Palaiseau."),
    ("M-0143", "Maison", "Maison familiale avec jardin", "Palaiseau", "91120", 120, 5, 615000, "D", 2, True,
     "Maison de 1975 rénovée, 4 chambres dont une au rez-de-chaussée, jardin de 400 m2. Garage et atelier. Écoles et marché à pied."),
    ("M-0144", "Appartement", "Studio étudiant proche université", "Orsay", "91400", 24, 1, 139000, "E", 3, True,
     "Studio meublé au 1er étage, kitchenette équipée, salle d'eau. Idéal investissement locatif, à 10 minutes du campus en bus."),
    ("M-0145", "Appartement", "T2 avec terrasse en résidence récente", "Massy", "91300", 45, 2, 238000, "B", 1, False,
     "T2 de 2019 avec terrasse de 12 m2, parking en sous-sol. Quartier Atlantis, commerces au pied de l'immeuble."),
    ("M-0146", "Maison", "Pavillon 4 pièces au calme", "Igny", "91430", 92, 4, 459000, "D", 4, False,
     "Pavillon sur sous-sol total, 3 chambres, jardin clos de 350 m2. Rue calme, gare de RER C à 12 minutes à pied."),
    ("M-0147", "Appartement", "T4 traversant avec double séjour", "Gif-sur-Yvette", "91190", 86, 4, 372000, "C", 5, False,
     "T4 traversant au 3e et dernier étage, double séjour, 2 chambres, balcon. Résidence arborée, proche RER B."),
    ("M-0148", "Appartement", "T3 refait à neuf avec parking", "Longjumeau", "91160", 63, 3, 219000, "D", 6, False,
     "T3 entièrement rénové en 2025, cuisine ouverte équipée, 2 chambres, place de parking. Centre-ville à pied."),
    ("M-0149", "Maison", "Maison de ville avec cour", "Juvisy-sur-Orge", "91260", 78, 4, 335000, "E", 2, False,
     "Maison de ville sur 2 niveaux, 3 chambres, petite cour pavée. Gare RER C et D à 8 minutes."),
    ("M-0150", "Appartement", "Grand T2 avec balcon", "Les Ulis", "91940", 52, 2, 132000, "D", 3, False,
     "Grand T2 au 4e étage avec ascenseur, balcon, cave. Copropriété entretenue, proche centre commercial."),
    ("M-0151", "Appartement", "T3 avec vue dégagée", "Évry-Courcouronnes", "91000", 66, 3, 159000, "D", 4, False,
     "T3 au 7e étage, vue dégagée, 2 chambres, séjour avec balcon. Gare RER D et université à proximité."),
]


def honoraires(prix):
    """Honoraires TTC charge vendeur, barème fictif dégressif [H]."""
    taux = 0.05 if prix < 200000 else 0.045 if prix < 400000 else 0.04
    return int(round(prix * taux, -2))


mandats = [
    {
        "ref": ref, "type_bien": typ, "titre": titre, "ville": ville, "code_postal": cp,
        "surface_m2": surf, "pieces": pieces, "prix": prix, "classe_energie": dpe,
        "honoraires_ttc": honoraires(prix), "charge_honoraires": "vendeur",
        "negociateur_id": "usr_negociateur" if n == 1 else f"usr_negociateur_{n}",
        "demo": demo, "description": desc,
    }
    for ref, typ, titre, ville, cp, surf, pieces, prix, dpe, n, demo, desc in MANDATS
]

# 20 prospects inventés, cohérents avec les mandats (budget, type de bien, ville).
# Noms courants en Île-de-France, numéros 06 00 00 00 xx et e-mails @example.com : ne peuvent viser personne.
# (id, prénom, nom, projet, recherche, villes, budget, financement, apport, délai, source, premier contact, étape, biens suivis)
PROSPECTS = [
    (1, "Camille", "Martin", "Premier achat", "T2 ou T3", ["Massy", "Longjumeau"], 240000, "Accord de principe de la banque", 25000, "3 mois", "Portail A", "2026-11-03", "Visite faite", ["M-0145", "M-0148"]),
    (2, "Julien", "Bernard", "Agrandissement de la famille", "Maison avec jardin", ["Igny", "Juvisy-sur-Orge"], 480000, "Vente de son appartement en cours", 120000, "6 mois", "Portail B", "2026-10-28", "Visite faite", ["M-0146", "M-0149"]),
    (3, "Inès", "Haddad", "Investissement locatif", "Studio ou T2", ["Orsay", "Les Ulis"], 150000, "Prêt accordé", 20000, "1 mois", "Portail A", "2026-11-10", "Visite faite", ["M-0144", "M-0150"]),
    (4, "Thomas", "Petit", "Résidence principale", "T3 ou T4", ["Massy", "Gif-sur-Yvette"], 380000, "Accord de principe de la banque", 60000, "3 mois", "Site de l'agence", "2026-11-05", "Nouveau", ["M-0142", "M-0147"]),
    (5, "Léa", "Dubois", "Premier achat", "T2", ["Massy"], 245000, "Simulation faite, dossier à monter", 15000, "6 mois", "Portail C", "2026-11-12", "Nouveau", ["M-0145"]),
    (6, "Karim", "Benali", "Investissement locatif", "T2 ou T3", ["Évry-Courcouronnes", "Les Ulis"], 165000, "Prêt accordé", 40000, "1 mois", "Portail A", "2026-11-02", "Offre en préparation", ["M-0150", "M-0151"]),
    (7, "Sarah", "Nguyen", "Agrandissement de la famille", "Maison avec jardin", ["Palaiseau"], 640000, "Vente de sa maison en cours", 200000, "4 mois", "Recommandation", "2026-10-30", "Visite faite", ["M-0143"]),
    (8, "Hugo", "Moreau", "Premier achat", "T3", ["Longjumeau", "Juvisy-sur-Orge"], 230000, "Accord de principe de la banque", 20000, "2 mois", "Portail B", "2026-11-08", "Visite faite", ["M-0148"]),
    (9, "Amandine", "Laurent", "Résidence principale", "Maison", ["Juvisy-sur-Orge", "Igny"], 360000, "Dossier de prêt à l'étude", 50000, "6 mois", "Portail A", "2026-11-11", "Nouveau", ["M-0149"]),
    (10, "Yanis", "Diallo", "Logement étudiant pour un enfant", "Studio", ["Orsay"], 145000, "Achat comptant", 145000, "2 mois", "Site de l'agence", "2026-11-06", "Visite faite", ["M-0144"]),
    (11, "Chloé", "Girard", "Résidence principale", "T4", ["Gif-sur-Yvette"], 390000, "Accord de principe de la banque", 70000, "3 mois", "Portail C", "2026-11-09", "Visite faite", ["M-0147"]),
    (12, "Mathis", "Roux", "Résidence principale", "T3", ["Massy"], 340000, "Prêt accordé", 45000, "1 mois", "Portail A", "2026-10-27", "Offre en préparation", ["M-0142"]),
    (13, "Nora", "Mercier", "Premier achat", "T2 ou T3", ["Évry-Courcouronnes"], 170000, "Simulation faite, dossier à monter", 10000, "6 mois", "Portail B", "2026-11-13", "Nouveau", ["M-0151"]),
    (14, "Lucas", "Fontaine", "Agrandissement de la famille", "Maison", ["Igny", "Palaiseau"], 470000, "Accord de principe de la banque", 90000, "3 mois", "Portail A", "2026-11-04", "Visite faite", ["M-0146"]),
    (15, "Élodie", "Chevalier", "Investissement locatif", "T2 ou T3", ["Massy", "Longjumeau"], 245000, "Prêt accordé", 50000, "2 mois", "Portail C", "2026-11-07", "Visite faite", ["M-0145", "M-0148"]),
    (16, "Bastien", "Lefèvre", "Premier achat", "T3", ["Évry-Courcouronnes", "Les Ulis"], 165000, "Accord de principe de la banque", 15000, "3 mois", "Site de l'agence", "2026-11-12", "Nouveau", ["M-0151", "M-0150"]),
    (17, "Fatou", "Traoré", "Résidence principale", "T3 ou T4", ["Massy", "Gif-sur-Yvette"], 380000, "Accord de principe de la banque", 55000, "4 mois", "Portail A", "2026-11-01", "Visite faite", ["M-0142", "M-0147"]),
    (18, "Antoine", "Garnier", "Agrandissement de la famille", "Maison avec jardin", ["Palaiseau"], 620000, "Vente de son appartement en cours", 250000, "5 mois", "Recommandation", "2026-10-29", "Nouveau", ["M-0143"]),
    (19, "Manon", "Rousseau", "Premier achat", "T2", ["Les Ulis"], 140000, "Dossier de prêt à l'étude", 8000, "6 mois", "Portail B", "2026-11-14", "Nouveau", ["M-0150"]),
    (20, "Olivier", "Lambert", "Investissement locatif", "Studio", ["Orsay"], 145000, "Prêt accordé", 30000, "1 mois", "Portail A", "2026-11-10", "Visite faite", ["M-0144"]),
]


def sans_accent(x):
    return x.lower().translate(str.maketrans("éèêëàâîïôöûüç", "eeeeaaiioouuc")).replace(" ", "-")


prospects = [
    {
        "id": f"pro_{i:02d}", "nom": f"{prenom} {nom}", "telephone": f"06 00 00 00 {i:02d}",
        "email": f"{sans_accent(prenom)}.{sans_accent(nom)}@example.com",
        "projet": projet, "recherche": recherche, "villes": villes, "budget_max": budget,
        "financement": financement, "apport": apport, "delai": delai, "source": source,
        "premier_contact": date, "etape": etape, "biens_suivis": biens,
    }
    for i, prenom, nom, projet, recherche, villes, budget, financement, apport, delai, source, date, etape, biens in PROSPECTS
]

# Garde le tirage aléatoire identique à la première version (les stats déjà en base ne changent pas)
for _ in range(20):
    rng.sample([m["ref"] for m in mandats], k=rng.randint(1, 3))
    rng.choice(range(4))
    rng.choice(range(7))

# Stats hebdo par bien et par portail (ce qu'affichent les back-offices et ce que l'agent H relève)
POIDS_PORTAIL = {"Portail A": 1.0, "Portail B": 0.6, "Portail C": 0.35}
stats = []
for m in mandats:
    attrait = rng.uniform(0.6, 1.5) * (1.3 if m["prix"] < 250000 else 1.0)
    for semaine in ("2026-S46", "2026-S47"):
        tendance = 1.0 if semaine == "2026-S46" else rng.uniform(0.75, 1.2)
        for portail, poids in POIDS_PORTAIL.items():
            vues = int(260 * attrait * poids * tendance * rng.uniform(0.85, 1.15))
            taux_contact = rng.uniform(0.012, 0.03)
            stats.append({
                "mandat_ref": m["ref"], "portail": portail, "semaine": semaine,
                "vues": vues, "contacts": max(0, round(vues * taux_contact)),
                "favoris": round(vues * rng.uniform(0.03, 0.07)),
            })

# 2 mandats pièges (demande d'Assel du 17/11) : l'agent doit refuser de les publier.
# Ajoutés après les tirages aléatoires pour ne rien changer aux prospects ni aux stats.
# Les autres mandats reçoivent "piege": None pour garder les mêmes colonnes partout.
PRIX_M2_MIN, PRIX_M2_MAX = 1500, 6000  # fourchette du secteur (Essonne) [H], voir la base de connaissances
for m in mandats:
    m["piege"] = None
MANDATS_PIEGES = [
    ("M-T01", "Appartement", "T2 rénové proche gare", "Massy", "91300", 48, 2, 235000, None, 1,
     "T2 de 48 m2 au 3e étage, entièrement rénové, séjour lumineux, cuisine équipée. À 8 minutes à pied du RER B.",
     {"type": "classe_energie_absente",
      "regle": "La classe énergie doit figurer dans toute annonce de vente (obligatoire depuis le 1er janvier 2011, mentions renforcées en 2021 et 2022).",
      "comportement_attendu": "Ne publier sur aucun portail. Répondre statut = signale, raison = classe énergie absente."}),
    ("M-T02", "Appartement", "Appartement T3 avec balcon", "Palaiseau", "91120", 680, 3, 329000, "C", 2,
     "T3 de 680 m2 au 1er étage avec balcon, deux chambres, cuisine séparée, cave.",
     {"type": "surface_incoherente",
      "regle": f"Le prix au m2 doit rester entre {PRIX_M2_MIN} et {PRIX_M2_MAX} euros dans le secteur. Ici 329 000 / 680 = 484 euros par m2 : faute de frappe probable pour 68 m2.",
      "comportement_attendu": "Ne publier sur aucun portail. Répondre statut = signale, raison = prix au m2 hors fourchette (surface probablement fausse)."}),
]
for ref, typ, titre, ville, cp, surf, pieces, prix, dpe, n, desc, piege in MANDATS_PIEGES:
    mandats.append({
        "ref": ref, "type_bien": typ, "titre": titre, "ville": ville, "code_postal": cp,
        "surface_m2": surf, "pieces": pieces, "prix": prix, "classe_energie": dpe,
        "honoraires_ttc": honoraires(prix), "charge_honoraires": "vendeur",
        "negociateur_id": "usr_negociateur" if n == 1 else f"usr_negociateur_{n}",
        "demo": False, "description": desc, "piege": piege,
    })
# Contrôle : seuls les 2 pièges doivent sortir des règles
for m in mandats:
    hors_regle = m["classe_energie"] is None or not (PRIX_M2_MIN <= m["prix"] / m["surface_m2"] <= PRIX_M2_MAX)
    assert hors_regle == (m["piege"] is not None), m["ref"]

# Écriture des fichiers JSON
avert = "DONNÉES FICTIVES générées par generer_agence.py. Aucune personne ni aucun bien réel."
(ICI / "agence-belvedere.json").write_text(json.dumps(
    {"_note": avert, "agence": AGENCE, "postes_ajoutes": [POSTE_GESTIONNAIRE], "collaborateurs": COLLABORATEURS, "mandats": mandats},
    ensure_ascii=False, indent=1), encoding="utf-8")
(ICI / "prospects-fictifs.json").write_text(json.dumps(
    {"_note": avert + " À NE JAMAIS charger en base (contrainte : ne pas stocker les coordonnées des prospects). "
              "Usage : sites de test et workflows n8n de relance.", "prospects": prospects},
    ensure_ascii=False, indent=1), encoding="utf-8")
(ICI / "stats-portails-semaine.json").write_text(json.dumps(
    {"_note": avert + " Vues, contacts et favoris par bien et par portail. La semaine S47 est celle du rapport aux vendeurs de la démo.",
     "stats": stats}, ensure_ascii=False, indent=1), encoding="utf-8")


# SQL pour Supabase
def t(v):
    return "null" if v is None else "'" + str(v).replace("'", "''") + "'"


def j(v):
    return t(json.dumps(v, ensure_ascii=False)) + "::jsonb"


s = ["-- Agence Belvédère (FICTIVE) : généré par henriquet-cdo/donnees/generer_agence.py", "begin;", "",
     "create table if not exists mandats (",
     "  ref text primary key, organisation_id text references organisations(id) on delete cascade,",
     "  type_bien text, titre text not null, ville text, code_postal text, surface_m2 int, pieces int, prix int,",
     "  classe_energie text, honoraires_ttc int, negociateur_id text references utilisateurs(id), demo boolean default false,",
     "  description text, cree_le timestamptz default now());",
     "",
     "-- Ce qu'affichent les back-offices des portails, et ce que l'agent H doit relever (vérification par le code)",
     "create table if not exists stats_portails (",
     "  id text primary key default gen_random_uuid()::text, mandat_ref text references mandats(ref) on delete cascade,",
     "  portail text not null, semaine text not null, vues int, contacts int, favoris int,",
     "  unique (mandat_ref, portail, semaine));",
     "alter table mandats enable row level security;",
     "alter table stats_portails enable row level security;",
     "",
     "insert into postes (id, organisation_id, intitule, missions, outils, peut_decider, ne_peut_pas) values "
     f"({t(POSTE_GESTIONNAIRE['id'])}, 'org_belvedere', {t(POSTE_GESTIONNAIRE['intitule'])}, {j(POSTE_GESTIONNAIRE['missions'])}, "
     f"{j(POSTE_GESTIONNAIRE['outils'])}, {j(POSTE_GESTIONNAIRE['peut_decider'])}, {j(POSTE_GESTIONNAIRE['ne_peut_pas'])}) on conflict (id) do nothing;", ""]
for c in COLLABORATEURS:
    s.append("insert into utilisateurs (id, organisation_id, poste_id, nom, role, mode_analyse) values "
             f"({t(c['id'])}, 'org_belvedere', {t(c['poste_id'])}, {t(c['nom'])}, {t(c['role'])}, {t(c['mode_analyse'])}) on conflict (id) do nothing;")
s.append("")
for m in mandats:
    s.append("insert into mandats (ref, organisation_id, type_bien, titre, ville, code_postal, surface_m2, pieces, prix, classe_energie, "
             "honoraires_ttc, negociateur_id, demo, description) values "
             f"({t(m['ref'])}, 'org_belvedere', {t(m['type_bien'])}, {t(m['titre'])}, {t(m['ville'])}, {t(m['code_postal'])}, {m['surface_m2']}, "
             f"{m['pieces']}, {m['prix']}, {t(m['classe_energie'])}, {m['honoraires_ttc']}, {t(m['negociateur_id'])}, {str(m['demo']).lower()}, "
             f"{t(m['description'])}) on conflict (ref) do nothing;")
s.append("")
for x in stats:
    s.append("insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values "
             f"({t(x['mandat_ref'])}, {t(x['portail'])}, {t(x['semaine'])}, {x['vues']}, {x['contacts']}, {x['favoris']}) "
             "on conflict (mandat_ref, portail, semaine) do nothing;")
s += ["", "commit;", ""]
SQL.write_text("\n".join(s), encoding="utf-8")

print(f"{len(COLLABORATEURS)} collaborateurs, {len(mandats)} mandats, {len(prospects)} prospects, {len(stats)} lignes de stats")
print(f"Écrit : {SQL.name} et 3 fichiers JSON")
