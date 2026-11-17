"""Couche propre au système : seule partie du Recorder qui change entre Windows et Mac.

Chaque module expose :
    fenetre_active() -> Fenetre | None
    url_navigateur(fenetre) -> (url | None, navigation_privee: bool)
    capturer(fenetre, mode) -> PIL.Image | None      mode = "fenetre" ou "ecran" (plan B)
    ocr(image) -> str                                 lecture du texte, en local
"""

import sys
from dataclasses import dataclass


@dataclass(frozen=True)
class Fenetre:
    appli: str
    titre: str
    ident: int      # hwnd sur Windows, numéro de fenêtre sur Mac
    pid: int
    prive: bool = False


if sys.platform == "win32":
    from plateforme.windows import capturer, fenetre_active, ocr, url_navigateur
elif sys.platform == "darwin":
    from plateforme.mac import capturer, fenetre_active, ocr, url_navigateur
else:
    raise RuntimeError("Ghost Recorder tourne sur Windows ou macOS.")

__all__ = ["Fenetre", "capturer", "fenetre_active", "ocr", "url_navigateur"]
