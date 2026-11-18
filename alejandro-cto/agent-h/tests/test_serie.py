import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from serie_tests import code_erreur  # noqa: E402


def resultat(**champs):
    base = {"statut": "completed", "faux_succes": False, "reussi": True,
            "reponse_structuree": True, "verification_base": {"Portail A": "ok"}}
    return {**base, **champs}


def test_reussi_sans_erreur():
    assert code_erreur(resultat()) is None


def test_faux_succes_prime_sur_le_reste():
    r = resultat(reussi=False, faux_succes=True, verification_base={"Portail A": "faux"})
    assert code_erreur(r) == "E6"


def test_infra_timeout_reponse_absente():
    assert code_erreur(resultat(statut="erreur_infra", reussi=False)) == "E8"
    assert code_erreur(resultat(statut="timed_out", reussi=False)) == "E4"
    assert code_erreur(resultat(reussi=False, reponse_structuree=False)) == "E5"


def test_photo_absente_sur_c():
    assert code_erreur(resultat(reussi=False, verification_base={"Portail C": "sans_photo"})) == "E7"


def test_piege_detecte_reussi():
    r = resultat(attendu="signale", reussi=True, verification_base={"Portail A": "absent"})
    assert code_erreur(r) is None


def test_piege_publie_et_signale_a_tort():
    assert code_erreur(resultat(attendu="signale", reussi=False, piege_publie=True)) == "E9"
    assert code_erreur(resultat(reussi=False, signale_a_tort=True)) == "E10"
    assert code_erreur(resultat(attendu="signale", reussi=False,
                                verification_base={"Portail A": "absent"})) == "E5"


def test_essai_corrige_garde_l_erreur_de_depart():
    def corrige(premiere):
        return resultat(corrections=1, verification_base={"Portail A": "ok"},
                        premiere_verification={"Portail A": premiere})
    assert code_erreur(corrige("faux")) == "E2"
    assert code_erreur(corrige("sans_photo")) == "E7"
    assert code_erreur(corrige("absent")) == "E1"


def test_mauvaise_valeur_contre_annonce_absente():
    assert code_erreur(resultat(reussi=False, verification_base={"Portail A": "faux"})) == "E2"
    assert code_erreur(resultat(reussi=False, verification_base={"Portail A": "absent"})) == "E1"
