import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import attendre_prouver as ap  # noqa: E402


class Reponse:
    def __init__(self, donnees):
        self.donnees = donnees

    def raise_for_status(self):
        pass

    def json(self):
        return self.donnees


def base_factice(monkeypatch, prise_ok=True):
    """Remplace Supabase : garde la trace des écritures dans `appels`."""
    appels = []
    monkeypatch.setenv("SUPABASE_URL", "https://base.test")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "cle")

    def patch(url, json, params, **_):
        appels.append((json, params))
        return Reponse([{"id": params["id"]}] if prise_ok else [])

    monkeypatch.setattr(ap.requests, "patch", patch)
    return appels


def test_prise_seulement_si_la_ligne_est_libre(monkeypatch):
    appels = base_factice(monkeypatch)
    assert ap.prendre("x1") is True
    _, params = appels[0]
    assert params == {"id": "eq.x1", "statut": "eq.en_cours", "resume": "is.null"}


def test_ligne_deja_prise_n_est_pas_relancee(monkeypatch):
    base_factice(monkeypatch, prise_ok=False)
    lancements = []
    monkeypatch.setattr(ap, "lancer", lambda *a: lancements.append(a))
    ap.traiter({"id": "x1", "tache_id": "tache_001"}, {}, "publie", "h/web-surfer-pro")
    assert lancements == []


def test_resultat_ecrit_sur_la_ligne_du_clic(monkeypatch):
    base_factice(monkeypatch)
    ecrits = []
    monkeypatch.setattr(ap, "lancer", lambda *a: {"duree_s": 99, "resume": "ok"})
    monkeypatch.setattr(ap, "ecrire_resultat", lambda r, ligne_id: ecrits.append(ligne_id))
    ap.traiter({"id": "x1", "tache_id": "tache_001"}, {}, "publie", "h/web-surfer-pro")
    assert ecrits == ["x1"]


def test_echec_du_lancement_debloque_l_interface(monkeypatch):
    appels = base_factice(monkeypatch)

    def panne(*_):
        raise RuntimeError("API H indisponible")

    monkeypatch.setattr(ap, "lancer", panne)
    ap.traiter({"id": "x1", "tache_id": "tache_001"}, {}, "publie", "h/web-surfer-pro")
    derniere_ecriture, _ = appels[-1]
    assert derniere_ecriture["statut"] == "failed"
    assert "API H indisponible" in derniere_ecriture["resume"]
