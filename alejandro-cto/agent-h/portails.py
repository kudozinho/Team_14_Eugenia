"""Les 3 sites de test de Vladimir : adresses, remise à zéro, vérification en base.

La réussite est vérifiée par notre code (roadmap 06, règle 2) : on relit les annonces
publiées par chaque site et on compare chaque champ au mandat donné à l'agent.
"""

import hashlib
import os
from datetime import datetime

import requests

PORTAILS = {
    "Portail A": os.getenv("PORTAIL_A_URL", "https://ghost-portail-a.vercel.app") + "/deposer",
    "Portail B": os.getenv("PORTAIL_B_URL", "https://ghost-portail-b.vercel.app") + "/nouvelle",
    "Portail C": os.getenv("PORTAIL_C_URL", "https://ghost-portail-c.vercel.app") + "/publier",
}
CHAMPS = ("titre", "prix", "surface_m2", "ville", "description")
BUCKET_PHOTOS = "photos-annonces"  # site C : <id>/photo.<ext> (vladimir-cao/portails/lib/store.ts)


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


def verifier(noms: list[str], mandat: dict, depuis: datetime, photo_attendue: str | None = None) -> dict[str, str]:
    """Pour chaque portail, parmi les annonces créées après `depuis` :
    "ok" (tous les champs exacts, et la bonne photo sur le site C), "sans_photo" (site C, champs justes
    mais pas de fichier dans photos-annonces/<id>/), "mauvaise_photo" (site C, une autre image que
    `photo_attendue`, empreinte SHA-256), "faux" (un champ diffère) ou "absent"."""
    resultat = {}
    for nom in noms:
        r = requests.get(racine(PORTAILS[nom]) + "/api/annonces", timeout=15)
        r.raise_for_status()
        recentes = [a for a in r.json().get("annonces", [])
                    if datetime.fromisoformat(a["cree_le"]) >= depuis]
        justes = [a for a in recentes if all(_egal(a.get(c), mandat[c]) for c in CHAMPS)]
        # Le site C donne photo: true/false (README de Vladimir) ; les sites A et B n'ont pas ce champ.
        avec_photo = [a for a in justes if a.get("photo", True) is not False]
        if avec_photo:
            # Les sites A et B n'ont pas de champ photo : rien à comparer.
            empreintes = [empreinte_photo(a["id"]) for a in avec_photo if "photo" in a and photo_attendue]
            resultat[nom] = etat_photo(empreintes, photo_attendue)
        elif justes:
            resultat[nom] = "sans_photo"
        else:
            resultat[nom] = "faux" if recentes else "absent"
    return resultat


def etat_photo(empreintes: list[str | None], attendue: str | None) -> str:
    """"ok" si une annonce porte la photo attendue (ou s'il n'y a rien à comparer), sinon "mauvaise_photo".

    Une photo illisible (None : pas de clé Supabase, réseau) ne fait pas échouer l'essai :
    on ne peut pas prouver qu'elle est fausse.
    """
    if not attendue or not empreintes or attendue in empreintes:
        return "ok"
    return "ok" if all(e is None for e in empreintes) else "mauvaise_photo"


def photo_prouvee(depuis: datetime, attendue: str) -> bool | None:
    """Preuve pour le bilan : une annonce du site C créée après `depuis` porte-t-elle exactement
    la photo attendue ? None si aucune empreinte n'a pu être lue (etat_photo dit alors "ok")."""
    r = requests.get(racine(PORTAILS["Portail C"]) + "/api/annonces", timeout=15)
    r.raise_for_status()
    empreintes = [empreinte_photo(a["id"]) for a in r.json().get("annonces", [])
                  if datetime.fromisoformat(a["cree_le"]) >= depuis and a.get("photo")]
    if all(e is None for e in empreintes):
        return None
    return attendue in empreintes


def empreinte_photo(id_annonce: str) -> str | None:
    """Empreinte SHA-256 de la photo enregistrée par le site C pour cette annonce (None si illisible)."""
    url, cle = os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    if not (url and cle):
        return None
    entetes = {"apikey": cle, "Authorization": f"Bearer {cle}"}
    try:
        r = requests.post(f"{url}/storage/v1/object/list/{BUCKET_PHOTOS}", headers=entetes, timeout=15,
                          json={"prefix": f"{id_annonce}/", "limit": 5})
        objets = r.json() if r.ok else []
        if not objets:
            return None
        f = requests.get(f"{url}/storage/v1/object/{BUCKET_PHOTOS}/{id_annonce}/{objets[0]['name']}",
                         headers=entetes, timeout=30)
        return hashlib.sha256(f.content).hexdigest() if f.ok else None
    except requests.RequestException:
        return None


def mandat_publie(noms: list[str], mandat: dict, depuis: datetime) -> list[str]:
    """Portails où une annonce de CE mandat (même titre) a été créée après `depuis`.

    Pour un piège, on ne compte que les annonces du mandat piégé : une annonce déposée au même
    moment par un autre membre de l'équipe ne doit pas faire échouer l'essai (sessions 2022cde7
    et df3fbeb0 : l'agent n'avait rien publié, une seule action « answer »).
    """
    publies = []
    for nom in noms:
        r = requests.get(racine(PORTAILS[nom]) + "/api/annonces", timeout=15)
        r.raise_for_status()
        if any(datetime.fromisoformat(a["cree_le"]) >= depuis and _egal(a.get("titre"), mandat["titre"])
               for a in r.json().get("annonces", [])):
            publies.append(nom)
    return publies


def ecarts(nom: str, mandat: dict, depuis: datetime) -> dict[str, tuple]:
    """Champs faux de la dernière annonce créée après `depuis` sur ce portail : {champ: (lu, attendu)}."""
    r = requests.get(racine(PORTAILS[nom]) + "/api/annonces", timeout=15)
    r.raise_for_status()
    recentes = [a for a in r.json().get("annonces", []) if datetime.fromisoformat(a["cree_le"]) >= depuis]
    if not recentes:
        return {}
    derniere = max(recentes, key=lambda a: a["cree_le"])
    return {c: (derniere.get(c), mandat[c]) for c in CHAMPS if not _egal(derniere.get(c), mandat[c])}


def _egal(lu, attendu) -> bool:
    if isinstance(attendu, str):
        return " ".join(str(lu or "").split()) == " ".join(attendu.split())
    return lu == attendu
