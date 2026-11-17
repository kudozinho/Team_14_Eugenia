"""Calcule le score et le gain des tâches de l'Agence Belvédère (FICTIVE).

Usage (depuis la racine du dépôt) :
    python henriquet-cdo/scoring/calcul_gain.py

Source unique des chiffres : commun/donnees/taches-semaine-agence.json (décision d'Assel du 17/11).
Seules les tâches au statut « justifie » sont scorées et additionnées : c'est le chiffre des slides.
Les tâches « a_confirmer » sont listées à part et ne s'ajoutent JAMAIS au total.

Écrit henriquet-cdo/scoring/resultats_scores.json (pour Binta et Assel).
"""
import json
from pathlib import Path

from score import heures_nettes, scorer

RACINE = Path(__file__).resolve().parents[2]
SOURCE = RACINE / "commun" / "donnees" / "taches-semaine-agence.json"
NOTES = Path(__file__).resolve().parent / "notes_criteres.json"
SORTIE = Path(__file__).resolve().parent / "resultats_scores.json"

# À qui vérifier chaque hypothèse en premier (méthode du professeur)
VERIFIER = {
    "personnes": "la gérante, sur l'organigramme réel",
    "frequence": "la gérante et les personnes concernées, sur un mois de volume réel",
    "minutes": "chronomètre pendant l'audit, avec les sessions jouées de mercredi pour la tâche de démo",
    "adoption": "la gérante et les personnes concernées : qui s'en servira vraiment",
    "part_recuperee": "la gérante : à quoi sert le temps libéré, sans supprimer de poste",
}


def hypotheses(t):
    qui = t["qui"]
    return [
        f"{t['personnes']} {qui} (à vérifier : {VERIFIER['personnes']})",
        f"{t['par_an_par_personne']} opérations par an et par personne (à vérifier : {VERIFIER['frequence']})",
        f"{t['minutes_gagnees']} min gagnées sur {t['minutes_avant']} min aujourd'hui (à vérifier : {VERIFIER['minutes']})",
        f"adoption {round(t['adoption'] * 100)} % (à vérifier : {VERIFIER['adoption']})",
        f"part récupérée {round(t['part_recuperee'] * 100)} % (à vérifier : {VERIFIER['part_recuperee']})",
    ]


def calculer():
    source = json.loads(SOURCE.read_text(encoding="utf-8"))
    notes = json.loads(NOTES.read_text(encoding="utf-8"))
    justifiees, a_confirmer = [], []
    for t in source["taches"]:
        if t["statut"] == "justifie":
            h = heures_nettes(t["personnes"], t["par_an_par_personne"], t["minutes_gagnees"], t["adoption"], t["part_recuperee"])
            n = notes[t["id"]]
            s = scorer(h, n["facilite"], n["effort"], n["risque"], n["confiance"], hypotheses(t))
            justifiees.append({"id": t["id"], "nom": t["nom"], "methode": t["methode"], "outil": n["outil"],
                               "vigilance": n["vigilance"], "score": s})
        elif t["statut"] == "a_confirmer":
            h = heures_nettes(t["personnes"], t["par_an_par_personne"], t["minutes_gagnees"], t["adoption"], t["part_recuperee"])
            a_confirmer.append({"id": t["id"], "nom": t["nom"], "heures_an_exactes": h, "gain_heures_an": round(h)})
    total_h = sum(x["score"]["heures_an"] for x in justifiees)
    return {
        "_note": "Données FICTIVES (Agence Belvédère). Calculé par henriquet-cdo/scoring/calcul_gain.py depuis commun/donnees/taches-semaine-agence.json.",
        "taches_justifiees": justifiees,
        "total_heures_an": total_h,
        "pistes_a_confirmer": a_confirmer,
        # somme des valeurs exactes, arrondie une seule fois (155 h, comme le fichier d'Assel)
        "pistes_a_confirmer_heures_an": round(sum(x["heures_an_exactes"] for x in a_confirmer)),
        "phrase_type": (f"Le projet fait gagner {total_h} heures par an à l'Agence Belvédère, si 50 à 70 % des personnes "
                        "concernées l'adoptent selon la tâche. Les pistes à confirmer pendant l'audit ne sont pas comptées."),
    }


if __name__ == "__main__":
    r = calculer()
    SORTIE.write_text(json.dumps(r, ensure_ascii=False, indent=1), encoding="utf-8")
    for x in r["taches_justifiees"]:
        s = x["score"]
        print(f"{x['id']}  {s['total']:>3}/100  {s['heures_an']:>3} h/an  {s['quadrant']:<12} {x['nom']}")
    print(f"TOTAL slides : {r['total_heures_an']} h/an  (pistes à confirmer, non additionnées : {r['pistes_a_confirmer_heures_an']} h/an)")
    print(f"Écrit : {SORTIE.name}")
