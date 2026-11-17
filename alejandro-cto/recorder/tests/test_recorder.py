import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from config import charger_profil  # noqa: E402
from nettoyage import _nettoyer_secours, compacter  # noqa: E402
from regles import est_autorise, site_autorise  # noqa: E402
from stockage import Stockage, nouvel_evenement  # noqa: E402

APPLIS = ("Google Chrome", "Microsoft Excel")
SITES = ("portail-a.example", "immogest.example")


def test_appli_non_cochee_hors_perimetre():
    assert not est_autorise("Messages", "Discussion", None, APPLIS, SITES)


def test_appli_de_bureau_cochee_autorisee():
    assert est_autorise("Microsoft Excel", "suivi_prospects.xlsx", None, APPLIS, SITES)


def test_chrome_coche_sans_site_ne_capte_rien():
    assert not est_autorise("Google Chrome", "Portail A", "https://portail-a.example/deposer", APPLIS, ())


def test_chrome_site_autorise_et_sous_domaine():
    assert est_autorise("Google Chrome", "Portail A", "https://portail-a.example/deposer", APPLIS, SITES)
    assert site_autorise("https://www.immogest.example/mandats", SITES)


def test_chrome_site_non_autorise_ou_adresse_illisible():
    assert not est_autorise("Google Chrome", "Gmail", "https://mail.google.com", APPLIS, SITES)
    assert not est_autorise("Google Chrome", "Portail A", None, APPLIS, SITES)
    assert not site_autorise("https://portail-a.example.evil.com", SITES)


def test_navigation_privee_jamais_captee():
    url = "https://portail-a.example/deposer"
    assert not est_autorise("Google Chrome", "Portail A", url, APPLIS, SITES, prive=True)
    assert not est_autorise("Google Chrome", "Portail A (Navigation privée)", url, APPLIS, SITES)


def test_hors_perimetre_sans_contenu():
    evt = nouvel_evenement("aud_demo", "usr_assistante", "hors_perimetre")
    for champ in ("appli", "titre_fenetre", "url", "texte_nettoye", "miniature_url", "empreinte"):
        assert evt[champ] is None
    attendu = json.loads((Path(__file__).resolve().parents[3] / "commun/donnees/evenements-exemple.json")
                         .read_text(encoding="utf-8"))[0].keys()
    assert set(evt) == set(attendu)


def test_nettoyage_secours_motifs_immobilier():
    profil = charger_profil("immobilier")
    texte = "Prix : 289 000 € | Contact : 06 12 34 56 78 | jean.dupont@mail.fr"
    assert _nettoyer_secours(texte, profil) == "Prix : [MONTANT] | Contact : [TELEPHONE] | [EMAIL]"


def test_compacter_en_une_ligne():
    assert compacter("Déposer une annonce\n\n Titre : T3 \n") == "Déposer une annonce | Titre : T3"


def test_duree_ecrite_sur_evenement_precedent(tmp_path):
    s = Stockage(tmp_path, None, None)
    premier = nouvel_evenement("aud_demo", "usr_assistante", "changement_appli", appli="Microsoft Excel")
    s.ecrire(premier)
    s.ecrire(nouvel_evenement("aud_demo", "usr_assistante", "hors_perimetre"))
    lignes = [json.loads(l) for l in s.fichier.read_text(encoding="utf-8").splitlines()]
    assert lignes[1] == {"maj": premier["id"], "duree_s": 0}
