"""Écrit le score (contrat §10) d'une tâche détectée dans Supabase. Pour le bout en bout de mercredi 14h.

Par défaut, le script AFFICHE seulement ce qu'il écrirait (rien n'est modifié).
Ajouter --ecrire pour écrire vraiment dans la table taches_detectees.

Exemples (depuis la racine du dépôt) :
    python henriquet-cdo/scoring/ecrire_score_en_base.py --tache-id <id en base>
    python henriquet-cdo/scoring/ecrire_score_en_base.py --tache-id <id en base> --minutes-gagnees 9 --ecrire

--source : id de la tâche dans commun/donnees/taches-semaine-agence.json (t03 = recopie sur 3 sites, la démo)
--minutes-gagnees : remplace l'hypothèse par la valeur mesurée pendant les sessions jouées (facultatif)

Clés lues dans .env : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
"""
import argparse
import json
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from calcul_gain import NOTES, SOURCE, VERIFIER, hypotheses  # noqa: E402
from score import heures_nettes, scorer  # noqa: E402


def construire_score(source_id, minutes_gagnees=None):
    taches = {t["id"]: t for t in json.loads(SOURCE.read_text(encoding="utf-8"))["taches"]}
    t = dict(taches[source_id])
    n = json.loads(NOTES.read_text(encoding="utf-8"))[source_id]
    hyp = None
    if minutes_gagnees is not None:
        t["minutes_gagnees"] = minutes_gagnees
        hyp = hypotheses(t)
        hyp[2] = f"{minutes_gagnees:g} min gagnées, mesurées pendant les sessions jouées (à confirmer : {VERIFIER['minutes']})"
    h = heures_nettes(t["personnes"], t["par_an_par_personne"], t["minutes_gagnees"], t["adoption"], t["part_recuperee"])
    return scorer(h, n["facilite"], n["effort"], n["risque"], n["confiance"], hyp or hypotheses(t))


def main():
    p = argparse.ArgumentParser(description="Écrit le score d'une tâche détectée dans Supabase")
    p.add_argument("--tache-id", required=True, help="id de la ligne dans taches_detectees")
    p.add_argument("--source", default="t03", help="id dans taches-semaine-agence.json (défaut : t03, la démo)")
    p.add_argument("--minutes-gagnees", type=float, default=None, help="valeur mesurée, remplace l'hypothèse")
    p.add_argument("--ecrire", action="store_true", help="écrit vraiment en base (sinon : affichage seulement)")
    a = p.parse_args()

    score = construire_score(a.source, a.minutes_gagnees)
    print(json.dumps(score, ensure_ascii=False, indent=1))
    if not a.ecrire:
        print("\nAffichage seulement. Ajoute --ecrire pour l'écrire dans taches_detectees.")
        return

    from dotenv import load_dotenv
    from supabase import create_client

    load_dotenv()
    url = os.getenv("SUPABASE_URL")
    cle = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not cle:
        raise SystemExit("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante dans .env")
    sb = create_client(url, cle)
    lignes = sb.table("taches_detectees").update({"score": score}).eq("id", a.tache_id).execute().data
    if not lignes:
        raise SystemExit(f"Aucune tâche avec l'id {a.tache_id} dans taches_detectees : rien n'a été écrit.")
    print(f"\nScore écrit pour la tâche {a.tache_id} : {score['total']}/100, {score['heures_an']} h/an, {score['quadrant']}.")


if __name__ == "__main__":
    main()
