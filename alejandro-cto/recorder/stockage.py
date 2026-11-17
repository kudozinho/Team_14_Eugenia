"""Écriture des événements (contrat §1) : journal local toujours, Supabase si configuré.

duree_s = temps passé sur l'écran avant l'événement suivant : il est connu seulement
quand l'événement suivant arrive, on met donc à jour l'événement précédent à ce moment-là.
"""

import json
import logging
import time
import uuid
from datetime import datetime
from pathlib import Path

import requests

log = logging.getLogger("recorder")


def nouvel_evenement(audit_id: str, utilisateur_id: str, type_: str, **contenu) -> dict:
    evt = {
        "id": "evt_" + uuid.uuid4().hex[:12],
        "audit_id": audit_id,
        "utilisateur_id": utilisateur_id,
        "horodatage": datetime.now().astimezone().isoformat(timespec="seconds"),
        "appli": None,
        "titre_fenetre": None,
        "url": None,
        "type": type_,
        "texte_nettoye": None,
        "miniature_url": None,
        "empreinte": None,
        "duree_s": None,
    }
    evt.update(contenu)
    return evt


class Stockage:
    def __init__(self, dossier: Path, supabase_url: str | None, supabase_cle: str | None):
        self.dossier = dossier
        self.dossier.mkdir(parents=True, exist_ok=True)
        self.fichier = dossier / f"evenements-{datetime.now():%Y-%m-%d}.jsonl"
        self.supabase = None
        if supabase_url and supabase_cle:
            self.supabase = supabase_url.rstrip("/") + "/rest/v1/evenements"
            self.entetes = {
                "apikey": supabase_cle,
                "Authorization": f"Bearer {supabase_cle}",
                "Content-Type": "application/json",
                "Prefer": "return=minimal",
            }
        self._precedent: dict | None = None
        self._debut_precedent = 0.0

    def ecrire(self, evt: dict) -> None:
        self.clore_precedent()
        with self.fichier.open("a", encoding="utf-8") as f:
            f.write(json.dumps(evt, ensure_ascii=False) + "\n")
        if self.supabase:
            try:
                r = requests.post(self.supabase, headers=self.entetes, json=evt, timeout=10)
                r.raise_for_status()
            except requests.RequestException as e:
                log.error("Supabase : envoi refusé (%s). L'événement reste dans le journal local.", e)
        self._precedent = evt
        self._debut_precedent = time.monotonic()
        log.info("%s  %s  %s", evt["type"], evt["appli"] or "-", evt["titre_fenetre"] or "")

    def clore_precedent(self) -> None:
        """Fixe duree_s de l'événement en cours (avant le suivant, une pause ou l'arrêt)."""
        if not self._precedent:
            return
        duree = round(time.monotonic() - self._debut_precedent)
        evt_id = self._precedent["id"]
        with self.fichier.open("a", encoding="utf-8") as f:
            f.write(json.dumps({"maj": evt_id, "duree_s": duree}) + "\n")
        if self.supabase:
            try:
                r = requests.patch(
                    self.supabase, params={"id": f"eq.{evt_id}"},
                    headers=self.entetes, json={"duree_s": duree}, timeout=10,
                )
                r.raise_for_status()
            except requests.RequestException as e:
                log.error("Supabase : durée non mise à jour (%s).", e)
        self._precedent = None
