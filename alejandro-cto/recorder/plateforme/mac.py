"""Couche macOS : fenêtre de premier plan (liste des fenêtres Quartz), adresse Chrome (AppleScript),
capture d'une seule fenêtre (screencapture -l), OCR local (Apple Vision via ocrmac).

Permissions à accorder dans Réglages Système > Confidentialité et sécurité, au Terminal
(ou à l'appli qui lance Python) :
- Enregistrement de l'écran : sans elle, pas de titres de fenêtre ni de capture.
- Accessibilité.
- Automatisation > Google Chrome : demandée à la première lecture d'adresse.
"""

import logging
import subprocess
import tempfile
from pathlib import Path

import Quartz
from ocrmac import ocrmac
from PIL import Image

from plateforme import Fenetre

log = logging.getLogger("recorder")

SCRIPT_URL = '''
tell application "Google Chrome"
    if (count of windows) = 0 then return ""
    return (mode of front window) & "|" & (URL of active tab of front window)
end tell
'''


def _pid_premier_plan() -> int | None:
    """PID de l'application active selon macOS (celle qui a le focus)."""
    try:
        from AppKit import NSWorkspace  # fourni avec pyobjc (dépendance de pyobjc-framework-Quartz)
        app = NSWorkspace.sharedWorkspace().frontmostApplication()
        return int(app.processIdentifier()) if app else None
    except Exception:  # noqa: BLE001 : en cas de souci, on retombe sur l'ordre des fenêtres
        return None


def fenetre_active() -> Fenetre | None:
    """Première fenêtre de niveau 0 (liste rangée de l'avant vers l'arrière) appartenant à l'appli active.

    Le filtre par appli active évite de prendre une fenêtre flottante d'une autre appli
    (lecteur vidéo, visio) pour la fenêtre de travail. Sans PID, on garde la première fenêtre.
    """
    pid_actif = _pid_premier_plan()
    options = Quartz.kCGWindowListOptionOnScreenOnly | Quartz.kCGWindowListExcludeDesktopElements
    for w in Quartz.CGWindowListCopyWindowInfo(options, Quartz.kCGNullWindowID) or []:
        if w.get("kCGWindowLayer") != 0:
            continue
        if pid_actif is not None and int(w.get("kCGWindowOwnerPID", 0)) != pid_actif:
            continue
        return Fenetre(
            appli=str(w.get("kCGWindowOwnerName", "")),
            titre=str(w.get("kCGWindowName", "") or ""),
            ident=int(w["kCGWindowNumber"]),
            pid=int(w.get("kCGWindowOwnerPID", 0)),
        )
    return None


def url_navigateur(fen: Fenetre) -> tuple[str | None, bool]:
    try:
        sortie = subprocess.run(["osascript", "-e", SCRIPT_URL], capture_output=True,
                                text=True, timeout=2).stdout.strip()
    except subprocess.TimeoutExpired:
        return None, False
    if "|" not in sortie:
        return None, False
    mode, url = sortie.split("|", 1)
    return (url or None), mode == "incognito"


def capturer(fen: Fenetre, mode: str = "fenetre") -> Image.Image | None:
    with tempfile.TemporaryDirectory() as dossier:
        fichier = Path(dossier) / "capture.png"
        if mode == "ecran":  # plan B : écran entier, seulement quand l'appli autorisée est devant
            commande = ["screencapture", "-x", str(fichier)]
        else:  # -o : sans l'ombre de la fenêtre
            commande = ["screencapture", "-x", "-o", f"-l{fen.ident}", str(fichier)]
        subprocess.run(commande, check=False, timeout=5)
        if not fichier.exists():
            log.warning("Capture impossible : vérifier la permission « Enregistrement de l'écran ».")
            return None
        with Image.open(fichier) as image:
            return image.copy()


def ocr(image: Image.Image) -> str:
    resultats = ocrmac.OCR(image, language_preference=["fr-FR", "en-US"]).recognize()
    return "\n".join(texte for texte, _confiance, _cadre in resultats)
