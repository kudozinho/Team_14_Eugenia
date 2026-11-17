"""Ghost Recorder : suit la fenêtre active et écrit les événements du contrat §1.

Lancer (Windows ou Mac) :
    pip install -r requirements.txt
    copier .env.example en .env et remplir
    python recorder.py              # avec l'icône (pause, journal, quitter)
    python recorder.py --console    # sans icône, Ctrl+C pour arrêter

Déclencheurs : changement d'appli, de titre ou d'adresse, puis au plus une vérification
toutes les 5 s qui ne garde l'image que si l'empreinte a changé. Jamais d'intervalle fixe d'envoi.
"""

import argparse
import logging
import os
import subprocess
import sys
import threading
import time

import imagehash
import requests
from PIL import Image, ImageDraw, ImageFilter

import plateforme
from config import (
    ECART_MIN_CAPTURES_S, INTERVALLE_BOUCLE_S, NAVIGATEURS, PLAFOND_CAPTURES_JOUR,
    SEUIL_EMPREINTE, VERIF_ECRAN_S, Config, charger_config, charger_profil,
)
from nettoyage import SOURCE as SOURCE_NETTOYAGE
from nettoyage import compacter, nettoyer
from regles import est_autorise
from stockage import Stockage, nouvel_evenement

log = logging.getLogger("recorder")


def listes_autorisees(cfg: Config) -> tuple[tuple[str, ...], tuple[str, ...]]:
    """Listes lues dans Supabase (applis_autorisees, sites_autorises), sinon dans le .env."""
    if not (cfg.supabase_url and cfg.supabase_cle):
        return cfg.applis_autorisees, cfg.sites_autorises
    base = cfg.supabase_url.rstrip("/") + "/rest/v1/"
    entetes = {"apikey": cfg.supabase_cle, "Authorization": f"Bearer {cfg.supabase_cle}"}
    filtre = {"utilisateur_id": f"eq.{cfg.utilisateur_id}"}
    try:
        applis = requests.get(base + "applis_autorisees", headers=entetes,
                              params={**filtre, "select": "appli"}, timeout=10)
        sites = requests.get(base + "sites_autorises", headers=entetes,
                             params={**filtre, "select": "domaine"}, timeout=10)
        applis.raise_for_status()
        sites.raise_for_status()
    except requests.RequestException as e:
        log.warning("Listes Supabase illisibles (%s) : on garde celles du .env.", e)
        return cfg.applis_autorisees, cfg.sites_autorises
    a = tuple(x["appli"] for x in applis.json()) or cfg.applis_autorisees
    s = tuple(x["domaine"] for x in sites.json()) or cfg.sites_autorises
    return a, s


class Recorder:
    def __init__(self, cfg: Config):
        self.cfg = cfg
        self.profil = charger_profil(cfg.profil_id)
        self.applis, self.sites = listes_autorisees(cfg)
        self.stockage = Stockage(cfg.dossier_journal, cfg.supabase_url, cfg.supabase_cle)
        self.dossier_miniatures = cfg.dossier_journal / "miniatures"
        self.dossier_miniatures.mkdir(parents=True, exist_ok=True)

        self.en_pause = False
        self.hors_perimetre = False
        self.arret = threading.Event()
        self.sur_changement_etat = lambda: None

        self._etat = None              # (appli, titre, url) du dernier événement capturé
        self._empreinte = None
        self._derniere_capture = 0.0
        self._derniere_verif = 0.0
        self._captures_jour = 0

    # --- boucle -----------------------------------------------------------------

    def boucle(self) -> None:
        log.info("Applis autorisées : %s", ", ".join(self.applis) or "(aucune)")
        log.info("Sites autorisés : %s", ", ".join(self.sites) or "(aucun)")
        log.info("Nettoyage : %s. Capture : %s.", SOURCE_NETTOYAGE, self.cfg.mode_capture)
        while not self.arret.is_set():
            if not self.en_pause:
                try:
                    self.tour()
                except Exception:  # la boucle ne doit jamais s'arrêter sur une erreur ponctuelle
                    log.exception("Erreur pendant un tour de boucle")
            self.arret.wait(INTERVALLE_BOUCLE_S)
        self.stockage.clore_precedent()

    def tour(self) -> None:
        fen = plateforme.fenetre_active()
        if fen is None:
            return
        url, prive = (None, False)
        if fen.appli in NAVIGATEURS and fen.appli in self.applis:
            url, prive = plateforme.url_navigateur(fen)

        if not est_autorise(fen.appli, fen.titre, url, self.applis, self.sites, prive or fen.prive):
            self._entrer_hors_perimetre()
            return

        etat = (fen.appli, fen.titre, url)
        maintenant = time.monotonic()
        if self._etat is None or etat[0] != self._etat[0]:
            type_ = "changement_appli"
        elif etat != self._etat:
            type_ = "changement_fenetre"
        elif maintenant - self._derniere_verif >= VERIF_ECRAN_S:
            type_ = "changement_ecran"
        else:
            return

        if maintenant - self._derniere_capture < ECART_MIN_CAPTURES_S:
            return  # trop tôt : le changement sera repris au prochain tour
        if self._captures_jour >= PLAFOND_CAPTURES_JOUR:
            return
        self._capturer(fen, url, etat, type_)

    # --- étapes -----------------------------------------------------------------

    def _entrer_hors_perimetre(self) -> None:
        if self.hors_perimetre:
            return
        self.hors_perimetre = True
        self._etat = None
        self._empreinte = None
        # Aucun contenu : ni appli, ni titre, ni adresse (§1 bis).
        self.stockage.ecrire(nouvel_evenement(self.cfg.audit_id, self.cfg.utilisateur_id, "hors_perimetre"))
        self.sur_changement_etat()

    def _capturer(self, fen, url, etat, type_) -> None:
        self._derniere_verif = time.monotonic()
        image = plateforme.capturer(fen, self.cfg.mode_capture)
        if image is None:
            return
        empreinte = imagehash.phash(image)
        if type_ == "changement_ecran" and self._empreinte is not None \
                and empreinte - self._empreinte <= SEUIL_EMPREINTE:
            return  # même écran : doublon jeté

        texte = compacter(plateforme.ocr(image))
        evt = nouvel_evenement(
            self.cfg.audit_id, self.cfg.utilisateur_id, type_,
            appli=fen.appli,
            titre_fenetre=nettoyer(fen.titre or "", self.profil) or None,
            url=url,
            texte_nettoye=nettoyer(texte, self.profil) or None,
            empreinte=str(empreinte),
        )
        self._miniature_floutee(image, evt["id"])
        del image  # l'image n'est jamais envoyée : seul le texte nettoyé part
        self.stockage.ecrire(evt)

        self._etat = etat
        self._empreinte = empreinte
        self._derniere_capture = time.monotonic()
        self._captures_jour += 1
        if self.hors_perimetre:
            self.hors_perimetre = False
            self.sur_changement_etat()

    def _miniature_floutee(self, image: Image.Image, evt_id: str) -> None:
        """Miniature floutée gardée en local pour le journal du salarié."""
        mini = image.convert("RGB")
        mini.thumbnail((320, 320))
        mini.filter(ImageFilter.GaussianBlur(4)).save(self.dossier_miniatures / f"{evt_id}.jpg", quality=60)

    # --- commandes de l'icône ---------------------------------------------------

    def basculer_pause(self) -> None:
        self.en_pause = not self.en_pause
        if self.en_pause:
            self.stockage.clore_precedent()
            self._etat = None
            self.hors_perimetre = False
        log.info("Pause" if self.en_pause else "Reprise")
        self.sur_changement_etat()


# --- icône (barre des menus sur Mac, zone de notification sur Windows) ---------

def dessiner_icone(actif: bool) -> Image.Image:
    img = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    couleur = (40, 40, 40, 255) if actif else (150, 150, 150, 255)
    d.ellipse((8, 8, 56, 56), outline=couleur, width=6)
    d.ellipse((24, 24, 40, 40), fill=couleur)
    if not actif:
        d.line((10, 54, 54, 10), fill=(200, 40, 40, 255), width=6)  # icône barrée
    return img


def ouvrir(chemin) -> None:
    if sys.platform == "win32":
        os.startfile(chemin)  # noqa: S606
    else:
        subprocess.run(["open", str(chemin)], check=False)


def lancer_icone(rec: Recorder) -> None:
    import pystray

    def actif() -> bool:
        return not rec.en_pause and not rec.hors_perimetre

    icone = pystray.Icon(
        "ghost", dessiner_icone(True), "Ghost Recorder",
        menu=pystray.Menu(
            pystray.MenuItem(lambda _: "Reprendre" if rec.en_pause else "Pause",
                             lambda: rec.basculer_pause()),
            pystray.MenuItem("Ouvrir le journal", lambda: ouvrir(rec.cfg.dossier_journal)),
            pystray.MenuItem("Quitter", lambda: (rec.arret.set(), icone.stop())),
        ),
    )

    def rafraichir() -> None:
        icone.icon = dessiner_icone(actif())
        icone.title = "Ghost Recorder : " + ("en pause" if rec.en_pause
                                             else "hors périmètre" if rec.hors_perimetre else "actif")
        icone.update_menu()

    rec.sur_changement_etat = rafraichir
    threading.Thread(target=rec.boucle, daemon=True).start()
    icone.run()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--console", action="store_true", help="sans icône, Ctrl+C pour arrêter")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(asctime)s  %(message)s", datefmt="%H:%M:%S")

    rec = Recorder(charger_config())
    if args.console:
        try:
            rec.boucle()
        except KeyboardInterrupt:
            rec.stockage.clore_precedent()
    else:
        lancer_icone(rec)


if __name__ == "__main__":
    main()
