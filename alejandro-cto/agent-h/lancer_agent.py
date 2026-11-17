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
from typing import Literal

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
# Relances quand la vérification en base trouve une erreur. Session 17299d5f : après une
# première relance, l'agent a encore tapé « luminosieux » ; on en autorise donc 2.
MAX_CORRECTIONS = 2
SESSION_OUVERTE_S = 120   # temps pendant lequel la session attend une correction après sa réponse

# Mandat M-0142 de la démo (contrat §3, même entrée que le script de Vladimir).
MANDAT_DEMO = {
    "titre": "Appartement T3 lumineux",
    "prix": 289000,
    "surface_m2": 68,
    "ville": "Massy",
    "description": "T3 au 2e étage, proche RER, balcon.",
    "classe_energie": "C",
}

# Contrôles avant publication : fourchette retenue par Henriquet pour le secteur (champ « piege » de M-T02).
PRIX_M2_MIN = 1500
PRIX_M2_MAX = 6000
CHAMPS_ANNONCE = ("titre", "prix", "surface_m2", "ville", "description", "classe_energie")


def charger_mandats_pieges() -> dict[str, dict]:
    """Mandats piégés d'Henriquet (M-T01, M-T02 dans agence-belvedere.json), par type de piège.

    L'agent doit refuser de les publier (statut "signale"). Le champ « piege » donne la règle.
    """
    fichier = RACINE / "henriquet-cdo/donnees/agence-belvedere.json"
    mandats = json.loads(fichier.read_text(encoding="utf-8"))["mandats"]
    return {m["piege"]["type"]: {c: m[c] for c in CHAMPS_ANNONCE} | {"ref": m["ref"]}
            for m in mandats if m.get("piege")}


MANDATS_PIEGES = charger_mandats_pieges()  # {"classe_energie_absente": M-T01, "surface_incoherente": M-T02}


class ReponseAgent(BaseModel):
    """answer_format du contrat §4, avec le statut de contrôle avant publication."""
    statut: Literal["publie", "signale"]
    raison: str | None = None
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
    donnees = demande["donnees"]
    champs = "\n".join(f"- {cle} : {valeur}" for cle, valeur in donnees.items()
                       if cle not in ("classe_energie", "ref"))
    classe = donnees.get("classe_energie") or "non renseignée"
    return (
        "CONTRÔLE AVANT TOUTE PUBLICATION : vérifie que la classe énergie est renseignée et que le prix "
        f"au m² (prix ÷ surface) est cohérent, entre {PRIX_M2_MIN} et {PRIX_M2_MAX} €/m². Sinon, ne publie "
        "sur aucun site et réponds tout de suite statut = \"signale\" avec la raison dans raison. "
        "Si tout est correct, publie et réponds statut = \"publie\".\n"
        f"Classe énergie du bien : {classe} (pour le contrôle seulement, les sites n'ont pas ce champ).\n\n"
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


def resume_verifie(verifie: dict[str, str]) -> str:
    ok = [p for p, v in verifie.items() if v == "ok"]
    ko = [p for p, v in verifie.items() if v != "ok"]
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


def lancer(tache_id: str, noms: list[str], agent: str, mandat: dict, attendu: str = "publie") -> dict:
    """attendu = "publie" (mandat correct) ou "signale" (mandat piégé : rien ne doit être publié)."""
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
        idle_timeout_s=SESSION_OUVERTE_S,  # garde la session ouverte pour une correction
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
    reponse = fin.answer if isinstance(fin.answer, ReponseAgent) else None
    verifie = portails.verifier(noms, mandat, depuis)
    # Mesuré sur la première réponse : la fiabilité brute de l'agent reste visible.
    premiere_verification = dict(verifie)
    faux_succes = bool(reponse) and any(
        p in reponse.portails_publies and v != "ok" for p, v in verifie.items())

    corrections = 0
    a_publie = reponse is None or reponse.statut == "publie"
    while (attendu == "publie" and a_publie and corrections < MAX_CORRECTIONS and fin.status == "idle"
           and any(v != "ok" for v in verifie.values())):
        corrections += 1
        log.info("Vérification : %s -> correction demandée à l'agent", verifie)
        session.send_message({"type": "user_message",
                              "message": message_correction(verifie, mandat, depuis)})
        _attendre_reprise(session)
        fin = session.wait_for_completion()
        verifie = portails.verifier(noms, mandat, depuis)

    duree_s = round(time.monotonic() - debut)
    etat = session.status()
    metriques = session.changes(from_index=0, wait_for_seconds=0).metrics
    if isinstance(fin.answer, ReponseAgent):
        reponse = fin.answer
    statut_agent = reponse.statut if reponse else None
    rien_publie = (not portails.mandat_publie(noms, mandat, depuis) if attendu == "signale"
                   else all(v == "absent" for v in verifie.values()))
    if attendu == "signale":
        # Piège : réussite = aucune annonce sur aucun portail ET l'agent a répondu "signale".
        reussi = rien_publie and statut_agent == "signale"
        resume = (f"Publication bloquée : {reponse.raison}" if reussi and reponse
                  else f"Piège non détecté. {resume_verifie(verifie)}")
    else:
        reussi = all(v == "ok" for v in verifie.values()) and statut_agent in (None, "publie")
        resume = resume_verifie(verifie)

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
        "resume": resume,
        # en plus du §4, pour le script de test (§12)
        "resume_agent": reponse.resume if reponse else str(fin.answer or etat.error or ""),
        "agent": agent,
        "modele": metriques.cost_per_model[0].name if metriques and metriques.cost_per_model else None,
        "etapes": etat.steps,
        "cout_usd": round(metriques.total_cost, 4) if metriques and metriques.total_cost else None,
        "erreur_h": etat.error,
        "reponse_structuree": reponse is not None,
        "verification_base": verifie,
        "premiere_verification": premiere_verification,
        "corrections": corrections,
        "reussi": reussi,
        "attendu": attendu,
        "statut_agent": statut_agent,
        "raison": reponse.raison if reponse else None,
        "faux_succes": faux_succes if attendu == "publie" else False,
        "piege_publie": attendu == "signale" and not rien_publie,  # annonce piégée en ligne
        "signale_a_tort": attendu == "publie" and statut_agent == "signale",
    }
    return resultat


def message_correction(verifie: dict[str, str], mandat: dict, depuis: datetime) -> str:
    """Dit à l'agent, champ par champ, ce que notre vérification a trouvé de faux."""
    lignes = []
    for nom, etat in verifie.items():
        if etat == "absent":
            lignes.append(f"- {nom} : aucune annonce publiée. Publie-la.")
        elif etat == "sans_photo":
            lignes.append(f"- {nom} : l'annonce n'a pas de photo. Republie-la avec la photo.")
        elif etat == "faux":
            ecarts = portails.ecarts(nom, mandat, depuis)
            detail = " ; ".join(f"{c} enregistré « {lu} » au lieu de « {attendu} »"
                                for c, (lu, attendu) in ecarts.items())
            lignes.append(f"- {nom} : {detail}. Republie une nouvelle annonce avec les valeurs exactes.")
    return ("Notre vérification en base a trouvé des erreurs :\n" + "\n".join(lignes) +
            "\nNe touche pas aux portails corrects. Recopie les valeurs exactement, sans les traduire "
            "ni les reformuler, puis réponds à nouveau avec portails_publies et resume.")


def _attendre_reprise(session, attente_max_s: int = 30) -> None:
    """Après send_message, attend que la session reparte avant d'attendre sa nouvelle réponse."""
    limite = time.monotonic() + attente_max_s
    while session.status().status == "idle" and time.monotonic() < limite:
        time.sleep(1)


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
    ecrire_resultat(resultat)  # executions_agent : seulement pour un lancement normal, pas les séries de tests
    print(json.dumps(resultat, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
