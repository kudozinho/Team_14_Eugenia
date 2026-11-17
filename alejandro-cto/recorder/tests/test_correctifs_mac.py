"""Correctifs du test sur Mac du 17/11 : onglet capturé = onglet lu, et pas de hors_perimetre sur une lecture ratée."""

import sys
import types
from dataclasses import dataclass
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from regles import titres_concordent  # noqa: E402


def test_titres_identiques_ou_suffixe_chrome():
    assert titres_concordent("Portail A - Déposer une annonce", "Portail A - Déposer une annonce")
    assert titres_concordent("Portail A - Déposer une annonce - Google Chrome", "Portail A - Déposer une annonce")
    assert titres_concordent("Portail A - Déposer une annonce - Google Chrome - Assel", "Portail A - Déposer une annonce")


def test_titres_differents_ou_vides_refuses():
    # Le cas du 17/11 : l'image montrait une recherche Google, l'adresse lue était celle du Portail A.
    assert not titres_concordent("cd ~/team_14_eugenia - Recherche Google", "Portail A - Déposer une annonce")
    assert not titres_concordent("", "Portail A")
    assert not titres_concordent("Portail A", None)


def _recorder_avec_faux_systeme(tmp_path, reponses_url):
    """Recorder branché sur une fausse couche système (le vrai module ne tourne que sur Windows/Mac)."""
    @dataclass(frozen=True)
    class Fenetre:
        appli: str
        titre: str
        ident: int
        pid: int
        prive: bool = False

    faux = types.ModuleType("plateforme")
    faux.Fenetre = Fenetre
    faux.fenetre_active = lambda: Fenetre("Google Chrome", "Portail A", 1, 1)
    faux.url_navigateur = lambda fen: reponses_url.pop(0)
    faux.capturer = lambda fen, mode: None   # pas d'image : on teste seulement la décision
    faux.ocr = lambda image: ""
    sys.modules["plateforme"] = faux
    sys.modules.pop("recorder", None)
    import recorder
    from config import Config

    cfg = Config("aud_test", "usr_test", "immobilier", ("Google Chrome",), ("portail-a.example",),
                 None, None, "fenetre", tmp_path)
    return recorder.Recorder(cfg)


def test_une_lecture_ratee_ne_bascule_pas_hors_perimetre(tmp_path):
    rec = _recorder_avec_faux_systeme(tmp_path, [(None, False), ("https://portail-a.example/deposer", False)])
    rec.tour()
    assert not rec.hors_perimetre
    rec.tour()
    assert not rec.hors_perimetre


def test_deux_lectures_ratees_de_suite_basculent_hors_perimetre(tmp_path):
    rec = _recorder_avec_faux_systeme(tmp_path, [(None, False), (None, False)])
    rec.tour()
    rec.tour()
    assert rec.hors_perimetre


def test_site_non_autorise_bascule_tout_de_suite(tmp_path):
    rec = _recorder_avec_faux_systeme(tmp_path, [("https://mail.google.com", False)])
    rec.tour()
    assert rec.hors_perimetre
