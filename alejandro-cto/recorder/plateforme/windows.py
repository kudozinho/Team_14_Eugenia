"""Couche Windows : fenêtre active (Win32), adresse Chrome (UI Automation),
capture d'une seule fenêtre (PrintWindow), OCR local (Windows.Media.Ocr via winocr)."""

import ctypes
import logging
import threading

import psutil
import uiautomation as auto
import win32gui
import win32process
import win32ui
import winocr
from PIL import Image, ImageGrab

from plateforme import Fenetre

log = logging.getLogger("recorder")

ctypes.windll.shcore.SetProcessDpiAwareness(2)  # vraies dimensions sur écran mis à l'échelle
PW_RENDERFULLCONTENT = 2

NOMS_APPLIS = {
    "chrome.exe": "Google Chrome",
    "excel.exe": "Microsoft Excel",
    "winword.exe": "Microsoft Word",
    "outlook.exe": "Microsoft Outlook",
    "olk.exe": "Microsoft Outlook",
    "msedge.exe": "Microsoft Edge",
}
SUFFIXES_TITRE = (" - Google Chrome", " - Excel", " - Word", " - Outlook")

_local = threading.local()
_langue_ocr = ["fr", "en"]


def fenetre_active() -> Fenetre | None:
    hwnd = win32gui.GetForegroundWindow()
    if not hwnd:
        return None
    _, pid = win32process.GetWindowThreadProcessId(hwnd)
    try:
        exe = psutil.Process(pid).name()
    except psutil.Error:
        return None
    appli = NOMS_APPLIS.get(exe.lower(), exe.removesuffix(".exe").removesuffix(".EXE"))
    titre = win32gui.GetWindowText(hwnd)
    for s in SUFFIXES_TITRE:
        titre = titre.removesuffix(s)
    return Fenetre(appli=appli, titre=titre, ident=hwnd, pid=pid)


def url_navigateur(fen: Fenetre) -> tuple[str | None, bool]:
    """Lit la barre d'adresse de Chrome. La navigation privée se repère au titre (règles)."""
    if not hasattr(_local, "uia"):
        _local.uia = auto.UIAutomationInitializerInThread()  # COM pour ce fil
        _local.barres = {}
    barre = _local.barres.get(fen.ident)
    try:
        if barre is None or not barre.Exists(0, 0):
            barre = auto.ControlFromHandle(fen.ident).EditControl(searchDepth=12)
            if not barre.Exists(0.5, 0.1):
                return None, False
            _local.barres[fen.ident] = barre
        valeur = barre.GetValuePattern().Value
    except Exception as e:  # UI Automation peut échouer pendant un changement d'onglet
        log.debug("Adresse illisible : %s", e)
        return None, False
    from regles import normaliser_url
    return normaliser_url(valeur), False


def capturer(fen: Fenetre, mode: str = "fenetre") -> Image.Image | None:
    if mode == "ecran":  # plan B : écran entier, seulement quand l'appli autorisée est devant
        return ImageGrab.grab(all_screens=True)
    gauche, haut, droite, bas = win32gui.GetWindowRect(fen.ident)
    largeur, hauteur = droite - gauche, bas - haut
    if largeur <= 0 or hauteur <= 0 or gauche <= -30000:  # fenêtre réduite
        return None

    hdc_fenetre = win32gui.GetWindowDC(fen.ident)
    dc = win32ui.CreateDCFromHandle(hdc_fenetre)
    dc_memoire = dc.CreateCompatibleDC()
    bitmap = win32ui.CreateBitmap()
    try:
        bitmap.CreateCompatibleBitmap(dc, largeur, hauteur)
        dc_memoire.SelectObject(bitmap)
        ok = ctypes.windll.user32.PrintWindow(fen.ident, dc_memoire.GetSafeHdc(), PW_RENDERFULLCONTENT)
        image = Image.frombuffer("RGB", (largeur, hauteur), bitmap.GetBitmapBits(True), "raw", "BGRX", 0, 1)
    finally:
        win32gui.DeleteObject(bitmap.GetHandle())
        dc_memoire.DeleteDC()
        dc.DeleteDC()
        win32gui.ReleaseDC(fen.ident, hdc_fenetre)

    if not ok or image.getbbox() is None:  # image noire : on lit la zone de la fenêtre à l'écran
        image = ImageGrab.grab(bbox=(gauche, haut, droite, bas), all_screens=True)
    return image


def ocr(image: Image.Image) -> str:
    """OCR intégré à Windows. Le français demande le pack de langue « Français » installé."""
    while _langue_ocr:
        try:
            resultat = winocr.recognize_pil_sync(image.convert("RGB"), _langue_ocr[0])
            return "\n".join(ligne["text"] for ligne in resultat["lines"])
        except Exception as e:
            log.warning("OCR en '%s' indisponible (%s)", _langue_ocr[0], e)
            _langue_ocr.pop(0)
    return ""
