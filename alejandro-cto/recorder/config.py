"""Réglages du Recorder, lus dans le fichier .env à côté de ce dossier."""

import json
import os
from dataclasses import dataclass
from pathlib import Path

from dotenv import load_dotenv

ICI = Path(__file__).resolve().parent
RACINE_REPO = ICI.parent.parent
load_dotenv(ICI / ".env")
load_dotenv(RACINE_REPO / ".env")  # SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY partagés (README d'Henriquet)

INTERVALLE_BOUCLE_S = 0.5       # on regarde la fenêtre active 2 fois par seconde
VERIF_ECRAN_S = 5               # au plus une vérification d'écran toutes les 5 s
ECART_MIN_CAPTURES_S = 3        # au plus 1 capture gardée toutes les 3 s
PLAFOND_CAPTURES_JOUR = 600
SEUIL_EMPREINTE = 4             # distance d'empreinte en dessous de laquelle 2 images sont "identiques"

LECTURES_RATEES_MAX = 2         # adresse illisible 2 tours de suite (1 s) avant hors_perimetre

NAVIGATEURS = {"Google Chrome", "Chrome"}


def _liste(variable: str) -> list[str]:
    return [x.strip() for x in os.getenv(variable, "").split(",") if x.strip()]


@dataclass(frozen=True)
class Config:
    audit_id: str
    utilisateur_id: str
    profil_id: str
    applis_autorisees: tuple[str, ...]
    sites_autorises: tuple[str, ...]
    supabase_url: str | None
    supabase_cle: str | None
    mode_capture: str            # "fenetre" (normal) ou "ecran" (plan B)
    dossier_journal: Path


def charger_config() -> Config:
    return Config(
        audit_id=os.getenv("AUDIT_ID", "aud_demo"),
        utilisateur_id=os.getenv("UTILISATEUR_ID", "usr_assistante"),
        profil_id=os.getenv("PROFIL_ID", "immobilier"),
        applis_autorisees=tuple(_liste("APPLIS_AUTORISEES")),
        sites_autorises=tuple(_liste("SITES_AUTORISES")),
        supabase_url=os.getenv("SUPABASE_URL") or None,
        # Même nom que les sites de test et le script d'Henriquet (ancien nom accepté)
        supabase_cle=os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_SERVICE_KEY") or None,
        mode_capture=os.getenv("MODE_CAPTURE", "fenetre"),
        dossier_journal=ICI / "journal",
    )


def charger_profil(profil_id: str) -> dict:
    fichier = RACINE_REPO / "commun" / "donnees" / "profils-metier.json"
    profils = json.loads(fichier.read_text(encoding="utf-8"))
    return next(p for p in profils if p["id"] == profil_id)
