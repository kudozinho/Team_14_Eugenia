"""Série de tests de l'agent H (roadmap 06), résultats au format §12 dans tests_agent.

    python serie_tests.py --niveau 6                     # cas de la démo, 10 essais
    python serie_tests.py --niveau 1 --essais 5
    python serie_tests.py --niveau 6 --agent h/web-surfer-flash --essais 10
    python serie_tests.py --niveau 6 --contournement "consigne en étapes numérotées"

`reussi` est vérifié par notre code (annonces relues dans annonces_portails via chaque site),
jamais par la réponse de l'agent. Une seule variable change par série (règle 4).
"""

import argparse
import json
import logging
import os
import statistics
import uuid
from datetime import datetime
from pathlib import Path

import requests

from lancer_agent import AGENT_PAR_DEFAUT, ICI, MANDAT_DEMO, lancer

log = logging.getLogger("agent-h")

# Niveaux de la roadmap 06 que les 3 sites actuels permettent de jouer.
NIVEAUX = {
    1: ("1 annonce sur le site A", ["A"]),
    2: ("1 annonce sur A puis B", ["A", "B"]),
    3: ("Site C : 2 étapes, menu déroulant, case à cocher", ["C"]),
    4: ("Site C avec envoi d'une photo", ["C"]),
    6: ("Les 3 sites à la suite (cas de la démo)", ["A", "B", "C"]),
}
ESSAIS_MIN = 10  # moins de 10 essais : résultat « indicatif » (règle 1)


def code_erreur(r: dict) -> str | None:
    """Codes E1 à E8 de la roadmap 06, du plus grave au moins grave."""
    if r["statut"] == "erreur_infra":
        return "E8"
    if r["faux_succes"]:
        return "E6"
    if r["statut"] == "timed_out":
        return "E4"
    if r["reussi"] and not r.get("corrections"):
        return None
    if r["statut"] == "completed" and not r["reponse_structuree"]:
        return "E5"
    if "sans_photo" in r["verification_base"].values():
        return "E7"  # blocage sur l'envoi du fichier
    if "faux" in r["verification_base"].values():
        return "E2"
    return "E1"


def essai(niveau: int, numero: int, agent: str, contournement: str | None) -> dict:
    cas, lettres = NIVEAUX[niveau]
    noms = [f"Portail {x}" for x in lettres]
    try:
        r = lancer("tache_001", noms, agent, MANDAT_DEMO)
    except Exception as e:  # API indisponible, session non démarrée...
        log.error("Essai %s : erreur d'infrastructure : %s", numero, e)
        r = {"statut": "erreur_infra", "session_id": None, "duree_s": None, "etapes": None,
             "cout_usd": None, "modele": None, "reussi": False, "faux_succes": False,
             "reponse_structuree": False, "verification_base": {}, "erreur_h": str(e)[:300],
             "corrections": 0}
    erreur = code_erreur(r)
    if erreur and r["corrections"] and r["reussi"]:
        erreur += " (corrigé par la vérification)"  # l'erreur brute de l'agent reste comptée
    if r["corrections"]:
        contournement = ", ".join(x for x in (contournement, "correction automatique") if x)
    return {
        "id": "tst_" + uuid.uuid4().hex[:8],
        "niveau": niveau,
        "cas": cas,
        "modele": r["modele"] or agent,
        "essai": numero,
        "statut": "failed" if r["statut"] == "erreur_infra" else r["statut"],
        "reussi": r["reussi"],
        "duree_s": r["duree_s"],
        "etapes": r["etapes"],
        "cout_usd": r["cout_usd"],
        "erreur": f"{erreur} {r['erreur_h'] or ''}".strip() if erreur else None,
        "contournement": contournement,
        "session_id": r["session_id"],
    }


def enregistrer(ligne: dict, fichier: Path) -> None:
    with fichier.open("a", encoding="utf-8") as f:
        f.write(json.dumps(ligne, ensure_ascii=False) + "\n")
    url, cle = os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not (url and cle):
        return
    r = requests.post(f"{url}/rest/v1/tests_agent", json=ligne, timeout=10, headers={
        "apikey": cle, "Authorization": f"Bearer {cle}",
        "Content-Type": "application/json", "Prefer": "return=minimal"})
    if not r.ok:
        log.error("tests_agent a refusé l'écriture (%s) : %s", r.status_code, r.text[:300])


def bilan(lignes: list[dict]) -> str:
    n = len(lignes)
    reussis = sum(l["reussi"] for l in lignes)
    durees = [l["duree_s"] for l in lignes if l["duree_s"] is not None]
    couts = [l["cout_usd"] for l in lignes if l["cout_usd"] is not None]
    erreurs = [l["erreur"].split()[0] for l in lignes if l["erreur"]]
    texte = [
        f"Niveau {lignes[0]['niveau']} : {lignes[0]['cas']} ({lignes[0]['modele']})"
        + ("" if n >= ESSAIS_MIN else f"  [INDICATIF : {n} essais sur {ESSAIS_MIN}]"),
        f"Réussite vérifiée : {reussis}/{n}",
        f"Faux succès (E6) : {erreurs.count('E6')}",
        f"Corrigés par la vérification : {sum('corrigé' in (l['erreur'] or '') for l in lignes)}",
    ]
    if durees:
        texte.append(f"Durée : médiane {statistics.median(durees):.0f} s, pire {max(durees)} s")
    if couts:
        texte.append(f"Coût moyen : {statistics.mean(couts):.3f} $ par session")
    if erreurs:
        texte.append("Erreurs : " + ", ".join(f"{c} x{erreurs.count(c)}" for c in sorted(set(erreurs))))
    return "\n".join(texte)


def main() -> None:
    logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s", datefmt="%H:%M:%S")
    logging.getLogger("httpx").setLevel(logging.WARNING)
    parser = argparse.ArgumentParser()
    parser.add_argument("--niveau", type=int, choices=sorted(NIVEAUX), default=6)
    parser.add_argument("--essais", type=int, default=ESSAIS_MIN)
    parser.add_argument("--agent", default=AGENT_PAR_DEFAUT)
    parser.add_argument("--contournement", default=None, help="ce qui a été changé pour cette série")
    args = parser.parse_args()

    if not os.getenv("RESET_TOKEN"):
        log.warning("Pas de RESET_TOKEN : les sites ne sont pas vidés entre deux essais (règle 3). "
                    "La vérification ne compte que les annonces créées pendant chaque essai.")
    dossier = ICI / "resultats"
    dossier.mkdir(exist_ok=True)
    fichier = dossier / f"tests-{datetime.now():%Y-%m-%d}.jsonl"

    lignes = []
    for numero in range(1, args.essais + 1):
        ligne = essai(args.niveau, numero, args.agent, args.contournement)
        enregistrer(ligne, fichier)
        lignes.append(ligne)
        log.info("Essai %s/%s : %s, %s s, %s", numero, args.essais,
                 "réussi" if ligne["reussi"] else "ÉCHEC", ligne["duree_s"], ligne["erreur"] or "")
    print("\n" + bilan(lignes))


if __name__ == "__main__":
    main()
