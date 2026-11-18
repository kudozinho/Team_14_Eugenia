"""Lire les événements d'un audit depuis Supabase, triés par horodatage.

Pour Omar (analyser_audit.py) : plus besoin de copier un export du Recorder à la main.

    from lire_evenements import lire_evenements
    evenements = lire_evenements("aud_demo")           # liste de dicts, même format que l'export du Recorder

En ligne de commande (écrit un JSON utilisable tel quel par analyser_audit.py) :

    python henriquet-cdo/supabase/lire_evenements.py aud_demo > evenements_aud_demo.json
    python henriquet-cdo/supabase/lire_evenements.py aud_demo --depuis 2026-11-18T08:55:00+01:00

La requête équivalente en SQL (Supabase, SQL Editor) :

    select id, audit_id, utilisateur_id, horodatage, appli, titre_fenetre, url,
           type, texte_nettoye, miniature_url, empreinte, duree_s
    from evenements
    where audit_id = 'aud_demo'
    order by horodatage, id;

Clés lues dans le .env à la racine du dépôt, comme le Recorder : SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY
(ancien nom SUPABASE_SERVICE_KEY accepté). Lecture seule : ce script ne modifie rien en base.
"""
import argparse
import json
import os
import sys
from pathlib import Path

import requests

try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).resolve().parents[2] / ".env")
except ImportError:  # python-dotenv absent : on lit seulement les variables d'environnement
    pass

COLONNES = ("id,audit_id,utilisateur_id,horodatage,appli,titre_fenetre,url,"
            "type,texte_nettoye,miniature_url,empreinte,duree_s")
PAGE = 1000  # Supabase renvoie 1000 lignes au plus par appel : on pagine


def _connexion():
    url = os.getenv("SUPABASE_URL")
    cle = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY")
    if not url or not cle:
        raise SystemExit("SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY manquante dans le .env à la racine du dépôt")
    return url.rstrip("/") + "/rest/v1/evenements", {"apikey": cle, "Authorization": f"Bearer {cle}"}


def lire_evenements(audit_id="aud_demo", depuis=None, session=requests):
    """Tous les événements de l'audit, du plus ancien au plus récent.

    depuis : horodatage ISO optionnel (ex. "2026-11-18T08:55:00+01:00") pour ne garder que les sessions du jour.
    """
    adresse, entetes = _connexion()
    params = [("select", COLONNES), ("audit_id", f"eq.{audit_id}"), ("order", "horodatage.asc,id.asc")]
    if depuis:
        params.append(("horodatage", f"gte.{depuis}"))
    evenements, debut = [], 0
    while True:
        r = session.get(adresse, params=params + [("limit", PAGE), ("offset", debut)], headers=entetes, timeout=30)
        r.raise_for_status()
        lot = r.json()
        evenements.extend(lot)
        if len(lot) < PAGE:
            return evenements
        debut += PAGE


def main():
    parser = argparse.ArgumentParser(description="Événements d'un audit, triés par horodatage (JSON sur la sortie standard)")
    parser.add_argument("audit_id", nargs="?", default="aud_demo")
    parser.add_argument("--depuis", help="horodatage ISO minimum, ex. 2026-11-18T08:55:00+01:00")
    args = parser.parse_args()
    evenements = lire_evenements(args.audit_id, args.depuis)
    print(f"{len(evenements)} événements pour {args.audit_id}", file=sys.stderr)
    json.dump(evenements, sys.stdout, ensure_ascii=False, indent=1)


if __name__ == "__main__":
    main()
