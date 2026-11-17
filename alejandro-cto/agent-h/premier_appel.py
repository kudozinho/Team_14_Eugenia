"""Premier appel à l'agent H : valide la clé API et mesure une session.

Lancer :
    pip install -r requirements.txt
    set HAI_API_KEY=hk-...        (Windows)   |   export HAI_API_KEY=hk-...   (Mac)
    python premier_appel.py

Option : --start-url https://portail-a.example/deposer  (quand les sites de Vladimir sont en ligne)
"""

import argparse
import json
import time

from hai_agents import Client
from pydantic import BaseModel

AGENT = "h/web-surfer-flash"
MAX_STEPS = 20
MAX_TIME_S = 120

TACHE_PAR_DEFAUT = (
    "Va sur https://news.ycombinator.com et donne le titre exact "
    "de la première histoire de la page d'accueil."
)


class Reponse(BaseModel):
    titre: str
    resume: str


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--tache", default=TACHE_PAR_DEFAUT)
    parser.add_argument("--start-url", default=None)
    args = parser.parse_args()

    client = Client()  # lit HAI_API_KEY

    params = {
        "agent": AGENT,
        "messages": args.tache,
        "max_steps": MAX_STEPS,
        "max_time_s": MAX_TIME_S,
        "timezone": "Europe/Paris",
    }
    if args.start_url:
        params["overrides"] = {"agent.environments[kind=web].start_url": args.start_url}

    debut = time.monotonic()  # la durée est mesurée par notre code (contrat §4)
    session = client.start_session(answer_schema=Reponse, **params)
    print(f"Session lancée : {session.id}")

    resultat = session.wait_for_completion()
    duree_s = round(time.monotonic() - debut)
    etat = session.status()

    print(json.dumps(
        {
            "session_id": session.id,
            "statut": resultat.status,
            "duree_s": duree_s,
            "etapes": etat.steps,
            "erreur": etat.error,
            "reponse": resultat.answer.model_dump() if isinstance(resultat.answer, BaseModel) else resultat.answer,
        },
        ensure_ascii=False,
        indent=2,
        default=str,
    ))


if __name__ == "__main__":
    main()
