"""Les 3 sites de test de Vladimir : adresses, remise à zéro, vérification en base.

La réussite est vérifiée par notre code (roadmap 06, règle 2) : on relit les annonces
publiées par chaque site et on compare chaque champ au mandat donné à l'agent.
"""

import os
from datetime import datetime

import requests

PORTAILS = {
    "Portail A": os.getenv("PORTAIL_A_URL", "https://ghost-portail-a.vercel.app") + "/deposer",
    "Portail B": os.getenv("PORTAIL_B_URL", "https://ghost-portail-b.vercel.app") + "/nouvelle",
    "Portail C": os.getenv("PORTAIL_C_URL", "https://ghost-portail-c.vercel.app") + "/publier",
}
CHAMPS = ("titre", "prix", "surface_m2", "ville", "description")


def racine(url_formulaire: str) -> str:
    return url_formulaire.rsplit("/", 1)[0]


def vider(noms: list[str]) -> None:
    """Vide les sites avant un essai (règle 3). Sans RESET_TOKEN, on ne vide rien."""
    jeton = os.getenv("RESET_TOKEN")
    if not jeton:
        return
    for nom in noms:
        r = requests.post(racine(PORTAILS[nom]) + "/api/reset", headers={"x-reset-token": jeton}, timeout=15)
        r.raise_for_status()


def verifier(noms: list[str], mandat: dict, depuis: datetime) -> dict[str, str]:
    """Pour chaque portail, parmi les annonces créées après `depuis` :
    "ok" (tous les champs exacts, et la photo sur le site C), "sans_photo" (site C, champs justes
    mais pas de fichier dans photos-annonces/<id>/), "faux" (un champ diffère) ou "absent"."""
    resultat = {}
    for nom in noms:
        r = requests.get(racine(PORTAILS[nom]) + "/api/annonces", timeout=15)
        r.raise_for_status()
        recentes = [a for a in r.json().get("annonces", [])
                    if datetime.fromisoformat(a["cree_le"]) >= depuis]
        justes = [a for a in recentes if all(_egal(a.get(c), mandat[c]) for c in CHAMPS)]
        # Le site C donne photo: true/false (README de Vladimir) ; les sites A et B n'ont pas ce champ.
        if any(a.get("photo", True) is not False for a in justes):
            resultat[nom] = "ok"
        elif justes:
            resultat[nom] = "sans_photo"
        else:
            resultat[nom] = "faux" if recentes else "absent"
    return resultat


def _egal(lu, attendu) -> bool:
    if isinstance(attendu, str):
        return " ".join(str(lu or "").split()) == " ".join(attendu.split())
    return lu == attendu
