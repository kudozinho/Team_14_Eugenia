"""Règles de périmètre : qu'a-t-on le droit de capturer ?

- Appli non cochée : rien (événement hors_perimetre).
- Navigateur coché sans site choisi : rien.
- Navigateur : seulement les domaines de la liste blanche, jamais la navigation privée.
"""

from urllib.parse import urlparse

from config import NAVIGATEURS

MOTS_PRIVE = ("incognito", "navigation privée", "inprivate")


def normaliser_url(url: str | None) -> str | None:
    if not url:
        return None
    url = url.strip()
    if "://" not in url:
        url = "https://" + url
    return url


def domaine(url: str | None) -> str | None:
    if not url:
        return None
    return (urlparse(url).hostname or "").lower() or None


def site_autorise(url: str | None, sites: tuple[str, ...]) -> bool:
    hote = domaine(url)
    if not hote:
        return False
    for site in sites:
        site = site.lower().strip()
        if hote == site or hote.endswith("." + site):
            return True
    return False


def est_autorise(
    appli: str | None,
    titre: str | None,
    url: str | None,
    applis: tuple[str, ...],
    sites: tuple[str, ...],
    prive: bool = False,
) -> bool:
    if not appli or appli not in applis:
        return False
    if appli in NAVIGATEURS:
        if prive or any(m in (titre or "").lower() for m in MOTS_PRIVE):
            return False
        return site_autorise(url, sites)
    return True
