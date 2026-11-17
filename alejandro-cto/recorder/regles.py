"""Règles de périmètre : qu'a-t-on le droit de capturer ?

- Appli non cochée : rien (événement hors_perimetre).
- Navigateur coché sans site choisi : rien.
- Navigateur : seulement les domaines de la liste blanche, jamais la navigation privée.
"""

from urllib.parse import urlparse, urlsplit, urlunsplit

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


def url_sans_parametres(url: str | None) -> str | None:
    """Adresse stockée sans paramètres ni ancre : ils peuvent contenir un e-mail ou un identifiant client."""
    if not url:
        return None
    p = urlsplit(url)
    return urlunsplit((p.scheme, p.netloc.split("@")[-1], p.path, "", ""))


def _titre_normalise(titre: str | None) -> str:
    t = " ".join((titre or "").lower().split())
    # Sur Windows (et parfois Mac), la fenêtre ajoute " - Google Chrome" (+ nom de profil).
    i = t.find(" - google chrome")
    return t[:i] if i >= 0 else t


def titres_concordent(titre_fenetre: str | None, titre_onglet: str | None) -> bool:
    """La fenêtre capturée montre-t-elle bien l'onglet dont on a lu l'adresse ?

    Sans cette vérification, l'image peut venir d'une page (ex. Google) et l'adresse
    d'une autre (un site autorisé) : on capterait une page non cochée. Titre vide = refus.
    """
    a, b = _titre_normalise(titre_fenetre), _titre_normalise(titre_onglet)
    if not a or not b:
        return False
    return a == b or a.startswith(b) or b.startswith(a)
