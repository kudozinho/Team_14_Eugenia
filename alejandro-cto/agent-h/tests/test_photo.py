"""Photo du site C (test Windows du 18/11) : l'agent déposait une image générée au lieu de M-0142.jpg,
parce que H refusait notre fichier (chemin relatif, 403) et que la vérification ne regardait que photo: true."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from portails import etat_photo  # noqa: E402
from serie_tests import code_erreur  # noqa: E402


def test_bonne_photo_validee():
    assert etat_photo(["abc", "def"], "def") == "ok"


def test_autre_image_refusee():
    assert etat_photo(["une-image-generee"], "photo-du-bien") == "mauvaise_photo"


def test_rien_a_comparer_ou_photo_illisible_ne_fait_pas_echouer():
    assert etat_photo([], "photo-du-bien") == "ok"              # sites A et B : pas de photo
    assert etat_photo(["x"], None) == "ok"                       # pas de photo attendue
    assert etat_photo([None], "photo-du-bien") == "ok"           # stockage illisible : on ne peut rien prouver


def test_mauvaise_photo_compte_comme_e7():
    r = {"statut": "completed", "faux_succes": False, "reussi": False, "reponse_structuree": True,
         "verification_base": {"Portail A": "ok", "Portail C": "mauvaise_photo"}}
    assert code_erreur(r) == "E7"


def test_le_chemin_envoye_a_h_est_absolu():
    import lancer_agent
    assert lancer_agent.DOSSIER_FICHIERS_H.startswith("/")
    assert lancer_agent.photo_du_mandat("M-0142").name == "M-0142.jpg"
    assert lancer_agent.photo_du_mandat("M-9999").name == "photo-annonce.png"
