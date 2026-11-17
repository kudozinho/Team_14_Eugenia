"""Appel à nettoyer(texte, profil).

La vraie fonction est celle d'Omar (omar-caio/filtres/). Tant qu'elle n'est pas livrée,
on applique seulement les motifs du profil métier (regex), sans reconnaissance de noms.
"""

import importlib
import os
import re
import sys

from config import RACINE_REPO

sys.path.insert(0, str(RACINE_REPO / "omar-caio" / "filtres"))

try:
    _module = importlib.import_module(os.getenv("NETTOYER_MODULE", "filtres"))
    _nettoyer_omar = _module.nettoyer
    SOURCE = "omar"
except (ImportError, AttributeError):
    _nettoyer_omar = None
    SOURCE = "motifs du profil (secours)"


def _nettoyer_secours(texte: str, profil: dict) -> str:
    for motif in profil.get("motifs_a_flouter", []):
        texte = re.sub(motif["regex"], motif["remplacement"], texte)
    return texte


def nettoyer(texte: str, profil: dict) -> str:
    if _nettoyer_omar:
        return _nettoyer_omar(texte, profil)
    return _nettoyer_secours(texte, profil)


def compacter(texte: str) -> str:
    """Le texte OCR en une ligne, segments séparés par ' | ' comme dans le contrat §1."""
    lignes = [l.strip() for l in texte.splitlines() if l.strip()]
    return " | ".join(lignes)
