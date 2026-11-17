"""Lance l'agent H sur une tâche détectée (§2) et écrit son résultat (§4).

    python lancer_agent.py                          # tache_001, les 3 portails
    python lancer_agent.py --portails A             # un seul site (niveau 1)
    python lancer_agent.py --tache tache_001 --agent h/web-surfer-pro

Étapes : tâche §2 → demande §3 → session H (navigateur hébergé, réponse structurée,
limites d'étapes et de temps) → durée mesurée par notre code → vérification des annonces
en base → résultat §4 dans executions_agent (Supabase) et dans resultats/.
"""

import argparse
import base64
import json
import logging
import os
import time
from datetime import datetime, timezone
from pathlib import Path

import requests
from dotenv import load_dotenv
from hai_agents import Client
from hai_agents.core.api_error import ApiError
from pydantic import BaseModel

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent.parent
load_dotenv(ICI / ".env")
load_dotenv(RACINE / ".env")  # SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY partagés (README d'Henriquet)

import portails  # noqa: E402  (lit les adresses des portails dans l'environnement)

log = logging.getLogger("agent-h")

# web-surfer-flash reformule les valeurs (titre changé, session 8f893be4) : pro par défaut.
AGENT_PAR_DEFAUT = "h/web-surfer-pro"
ETAPES_PAR_PORTAIL = 35
SECONDES_PAR_PORTAIL = 150

# Mandat M-0142 de la démo (contrat §3, même entrée que le script de Vladimir).
MANDAT_DEMO = {
    "titre": "Appartement T3 lumineux",
    "prix": 289000,
    "surface_m2": 68,
    "ville": "Massy",
    "description": "T3 au 2e étage, proche RER, balcon.",
}


class ReponseAgent(BaseModel):
    """answer_format du contrat §4."""
    portails_publies: list[str]
    resume: str


def charger_tache(tache_id: str) -> dict:
    """La tâche vient de Supabase si la base est configurée, sinon des données d'exemple."""
    url, cle = os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if url and cle:
        r = requests.get(f"{url}/rest/v1/taches_detectees", params={"id": f"eq.{tache_id}"},
                         headers={"apikey": cle, "Authorization": f"Bearer {cle}"}, timeout=10)
        if r.ok and r.json():
            return r.json()[0]
        log.warning("Tâche %s absente de la base : on prend les données d'exemple.", tache_id)
    exemples = json.loads((RACINE / "commun/donnees/tache-detectee-exemple.json").read_text(encoding="utf-8"))
    return next(t for t in exemples if t["id"] == tache_id)


def construire_demande(tache: dict, noms: list[str], mandat: dict, agent: str) -> dict:
    """Demande d'exécution, contrat §3."""
    adresses = [portails.PORTAILS[n] for n in noms]
    return {
        "tache_id": tache["id"],
        "agent": agent,
        "start_url": adresses[0],
        "consignes": tache["instructions_agent"],
        "donnees": mandat,
        "portails": adresses,
    }


def consigne_texte(demande: dict) -> str:
    sites = "\n".join(f"- {u}" for u in demande["portails"])
    champs = "\n".join(f"- {cle} : {valeur}" for cle, valeur in demande["donnees"].items())
    return (
        f"{demande['consignes']}\n\n"
        f"Portails, dans cet ordre :\n{sites}\n\n"
        f"Valeurs à saisir :\n{champs}\n\n"
        "RÈGLE ABSOLUE : copie chaque valeur caractère par caractère, exactement comme ci-dessus. "
        "Ne reformule rien, n'ajoute aucun mot, ne change aucun adjectif. "
        "Avant de valider chaque formulaire, relis chaque champ et corrige-le s'il diffère. "
        "Les libellés des champs changent d'un site à l'autre : associe-les par leur sens "
        "(titre/intitulé/accroche, prix/montant, surface/superficie, ville/commune/localisation, "
        "description/texte/descriptif). "
        "Si un menu déroulant propose la ville avec son code postal, choisis l'option de cette ville. "
        "Si une case de certification est obligatoire, coche-la. "
        "Ne réponds qu'une fois chaque annonce publiée (page de confirmation affichée). "
        "Dans portails_publies, mets seulement les portails où tu as vu la confirmation, "
        "avec leur nom affiché (« Portail A », « Portail B », « Portail C »)."
    )


def deposer_photo(client: Client, session_id: str, attente_max_s: int = 60) -> str | None:
    """Met la photo du bien dans l'espace de fichiers de la session (site C).

    Le navigateur de la session met quelques secondes à démarrer : avant, l'API répond 404.
    """
    contenu = base64.b64encode((ICI / "photo-annonce.png").read_bytes()).decode()
    limite = time.monotonic() + attente_max_s
    while True:
        try:
            return client.session_files.write_file(
                session_id, path="photo-annonce.png", content_base64=contenu).path
        except ApiError as e:
            if e.status_code != 404 or time.monotonic() > limite:
                log.error("Photo non déposée (%s) : le Portail C échouera.", e.status_code)
                return None
            time.sleep(2)


def resume_verifie(verifie: dict[str, bool]) -> str:
    ok = [p for p, v in verifie.items() if v]
    ko = [p for p, v in verifie.items() if not v]
    if not ko:
        return f"Annonce publiée et vérifiée en base sur {len(ok)} portail(s) : {', '.join(ok)}."
    return f"Vérifiée sur : {', '.join(ok) or 'aucun'}. Absente ou fausse sur : {', '.join(ko)}."


def ecrire_resultat(resultat: dict) -> None:
    dossier = ICI / "resultats"
    dossier.mkdir(exist_ok=True)
    (dossier / f"{resultat['session_id']}.json").write_text(
        json.dumps(resultat, ensure_ascii=False, indent=2), encoding="utf-8")
    url, cle = os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not (url and cle):
        log.info("Supabase non configuré : résultat gardé dans resultats/ seulement.")
        return
    ligne = {k: resultat[k] for k in ("tache_id", "session_id", "statut", "duree_s",
                                      "duree_humaine_s", "portails_publies", "resume")}
    r = requests.post(f"{url}/rest/v1/executions_agent", json=ligne, timeout=10, headers={
        "apikey": cle, "Authorization": f"Bearer {cle}",
        "Content-Type": "application/json", "Prefer": "return=minimal"})
    if r.ok:
        log.info("Résultat écrit dans executions_agent.")
    else:
        log.error("executions_agent a refusé l'écriture (%s) : %s", r.status_code, r.text[:300])


def lancer(tache_id: str, noms: list[str], agent: str, mandat: dict) -> dict:
    tache = charger_tache(tache_id)
    demande = construire_demande(tache, noms, mandat, agent)
    portails.vider(noms)
    client = Client()

    depuis = datetime.now(timezone.utc)
    debut = time.monotonic()  # durée mesurée par notre code, pas par l'agent (§4)
    session = client.start_session(
        agent=agent,
        messages=consigne_texte(demande),
        answer_schema=ReponseAgent,
        max_steps=ETAPES_PAR_PORTAIL * len(noms),
        max_time_s=SECONDES_PAR_PORTAIL * len(noms),
        timezone="Europe/Paris",
        overrides={"agent.environments[kind=web].start_url": demande["start_url"]},
    )
    log.info("Session %s lancée sur %s", session.id, ", ".join(noms))
    if "Portail C" in noms:
        chemin = deposer_photo(client, session.id)
        if chemin:
            session.send_message({"type": "user_message", "message":
                                  f"Pour la photo demandée par le Portail C, envoie le fichier {chemin}."})
            log.info("Photo déposée pour l'agent : %s", chemin)

    fin = session.wait_for_completion()
    duree_s = round(time.monotonic() - debut)
    etat = session.status()
    reponse = fin.answer if isinstance(fin.answer, ReponseAgent) else None
    verifie = portails.verifier(noms, mandat, depuis)

    resultat = {
        "tache_id": tache["id"],
        "session_id": session.id,
        # idle = l'agent a répondu et la session se ferme seule ensuite (completed chez H)
        "statut": "completed" if fin.status == "idle" else str(fin.status),
        "duree_s": duree_s,
        "duree_humaine_s": tache.get("duree_moyenne_s"),
        "portails_publies": reponse.portails_publies if reponse else [],
        # Le résumé affiché vient de notre vérification : le texte de l'agent peut être faux
        # même quand la base est juste (session 969ac9f2 : « Apartamento T3 lumineuse »).
        "resume": resume_verifie(verifie),
        # en plus du §4, pour le script de test (§12)
        "resume_agent": reponse.resume if reponse else str(fin.answer or etat.error or ""),
        "agent": agent,
        "etapes": etat.steps,
        "verification_base": verifie,
        "reussi": all(verifie.values()),
        "faux_succes": bool(reponse) and any(
            p in reponse.portails_publies and not ok for p, ok in verifie.items()),
    }
    ecrire_resultat(resultat)
    return resultat


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s", datefmt="%H:%M:%S")
    logging.getLogger("httpx").setLevel(logging.WARNING)
    parser = argparse.ArgumentParser()
    parser.add_argument("--tache", default="tache_001")
    parser.add_argument("--portails", default="A,B,C", help="lettres des sites, ex. A ou A,B,C")
    parser.add_argument("--agent", default=AGENT_PAR_DEFAUT)
    parser.add_argument("--mandat", type=Path, help="fichier JSON des données de l'annonce (§3)")
    args = parser.parse_args()

    noms = [f"Portail {x.strip().upper()}" for x in args.portails.split(",")]
    mandat = json.loads(args.mandat.read_text(encoding="utf-8")) if args.mandat else MANDAT_DEMO
    resultat = lancer(args.tache, noms, args.agent, mandat)
    print(json.dumps(resultat, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
