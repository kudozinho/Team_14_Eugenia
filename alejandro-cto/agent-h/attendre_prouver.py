"""Lance l'agent H tout seul quand quelqu'un clique sur « Prouver avec l'agent ».

    python attendre_prouver.py                 # tourne sur le PC de démo, Ctrl+C pour arrêter
    python attendre_prouver.py --mandat M-0143

Le bouton crée une ligne dans executions_agent : {"tache_id": "...", "statut": "en_cours"}.
Ce script regarde la table toutes les 2 s, prend la ligne (resume rempli = prise), lance
l'agent sur les 3 sites et remplace la ligne par le résultat (§4). L'interface relit la même
ligne jusqu'à ce que statut ne soit plus "en_cours".
"""

import argparse
import logging
import os
import time

import requests

from lancer_agent import AGENT_PAR_DEFAUT, MANDATS_PIEGES, REF_DEMO, charger_mandat, ecrire_resultat, lancer

log = logging.getLogger("agent-h")

ATTENTE_S = 2
EN_COURS = "Agent H lancé, publication en cours sur les 3 sites…"
PORTAILS_DEMO = ["Portail A", "Portail B", "Portail C"]


def _base() -> tuple[str, dict]:
    url, cle = os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not (url and cle):
        raise SystemExit("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY manquent (.env à la racine).")
    return f"{url}/rest/v1/executions_agent", {
        "apikey": cle, "Authorization": f"Bearer {cle}", "Content-Type": "application/json"}


def demandes_en_attente() -> list[dict]:
    """Lignes créées par le bouton et pas encore prises, la plus ancienne d'abord."""
    table, entetes = _base()
    r = requests.get(table, headers=entetes, timeout=10, params={
        "statut": "eq.en_cours", "resume": "is.null", "select": "id,tache_id", "order": "cree_le"})
    r.raise_for_status()
    return r.json()


def prendre(ligne_id: str) -> bool:
    """Marque la ligne comme prise. Faux si un autre lancement l'a déjà prise."""
    table, entetes = _base()
    r = requests.patch(table, json={"resume": EN_COURS}, timeout=10,
                       headers=entetes | {"Prefer": "return=representation"},
                       params={"id": f"eq.{ligne_id}", "statut": "eq.en_cours", "resume": "is.null"})
    r.raise_for_status()
    return bool(r.json())


def echouer(ligne_id: str, erreur: Exception) -> None:
    """L'interface ne doit jamais rester bloquée sur « en cours »."""
    table, entetes = _base()
    requests.patch(table, params={"id": f"eq.{ligne_id}"}, timeout=10, headers=entetes,
                   json={"statut": "failed", "resume": f"Lancement impossible : {erreur}"[:300]})


def traiter(demande: dict, mandat: dict, attendu: str, agent: str) -> None:
    if not prendre(demande["id"]):
        return
    log.info("Clic sur « Prouver » (tâche %s) : lancement de l'agent", demande["tache_id"])
    try:
        resultat = lancer(demande["tache_id"], PORTAILS_DEMO, agent, mandat, attendu)
    except Exception as e:  # API H indisponible, tâche inconnue...
        log.error("Lancement impossible : %s", e)
        echouer(demande["id"], e)
        return
    ecrire_resultat(resultat, demande["id"])
    log.info("Terminé en %s s : %s", resultat["duree_s"], resultat["resume"])


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s", datefmt="%H:%M:%S")
    logging.getLogger("httpx").setLevel(logging.WARNING)
    parser = argparse.ArgumentParser()
    parser.add_argument("--mandat", default=REF_DEMO, help="mandat publié au clic (M-0142 par défaut)")
    parser.add_argument("--agent", default=AGENT_PAR_DEFAUT)
    args = parser.parse_args()

    mandat = charger_mandat(args.mandat)
    attendu = "signale" if mandat["ref"] in {m["ref"] for m in MANDATS_PIEGES.values()} else "publie"
    _base()  # s'arrête tout de suite si la base n'est pas configurée
    log.info("En attente d'un clic sur « Prouver » (mandat %s). Ctrl+C pour arrêter.", mandat["ref"])
    while True:
        try:
            for demande in demandes_en_attente():
                traiter(demande, mandat, attendu, args.agent)
        except requests.RequestException as e:  # coupure réseau : on réessaie au tour suivant
            log.warning("Supabase injoignable : %s", e)
        time.sleep(ATTENTE_S)


if __name__ == "__main__":
    main()
