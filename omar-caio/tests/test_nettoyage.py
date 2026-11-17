import json
from pathlib import Path
import pytest
from filtres.nettoyage import nettoyer, nettoyer_evenement

ROOT = Path(__file__).resolve().parents[2]
PROFIL = next(p for p in json.loads((ROOT/'commun/donnees/profils-metier.json').read_text()) if p['id']=='immobilier')

# 20 formulations délibérément variées, incluant des faux positifs à éviter.
PIEGES = [
 ('Appelez M. Dupont au 06 12 34 56 78', '[NOM]', '06 12 34 56 78'),
 ('Téléphone : 06.12.34.56.78', '[TELEPHONE]', '06.12.34.56.78'),
 ('Portable +33 6 12 34 56 78', '[TELEPHONE]', '+33 6 12 34 56 78'),
 ('Numéro 06-12-34-56-78', '[TELEPHONE]', '06-12-34-56-78'),
 ('E-mail: jean.dupont+vente@example.fr', '[EMAIL]', 'jean.dupont+vente@example.fr'),
 ('IBAN FR76 3000 6000 0112 3456 7890 189', '[IBAN]', 'FR76 3000 6000 0112 3456 7890 189'),
 ('Compte: FR7630006000011234567890189', '[IBAN]', 'FR7630006000011234567890189'),
 ('Prix total 289 000 €', '[MONTANT]', '289 000 €'),
 ('Prix : 289000', '[MONTANT]', '289000'),
 ('Budget : 180000', '[MONTANT]', '180000'),
 ('Adresse : 12 rue Victor Hugo 75016 Paris', '[ADRESSE]', '12 rue Victor Hugo'),
 ('Rendez-vous 4 avenue de la République 75011 Paris', '[ADRESSE]', '4 avenue de la République'),
 ('Mme Marie-Claire Dupont doit rappeler', '[NOM]', 'Marie-Claire Dupont'),
 ('Le client Alice Martin souhaite visiter', '[NOM]', 'Alice Martin'),
 ('Propriétaire : Sophie Durand | Prix : 250000', '[NOM]', 'Sophie Durand'),
 ('Contact : [TELEPHONE]', '[TELEPHONE]', '__GHOSTMASK'),
 ('Surface : 68 m2, 3 pièces', '68 m2', '[MONTANT]'),
 ('Mandat M-0142 à publier', 'M-0142', '[MONTANT]'),
 ('Contact: 07 11 22 33 44, email: x.y@domain.com', '[TELEPHONE]', '07 11 22 33 44'),
 ('Propriétaire : Jean-Pierre Martin ; adresse : 7 rue des Lilas, Paris', '[ADRESSE]', '7 rue des Lilas'),
]

@pytest.mark.parametrize('text,contains,absent',PIEGES, ids=[f'piege_{i+1:02}' for i in range(20)])
def test_20_pieges(text,contains,absent):
    result = nettoyer(text,PROFIL)
    assert contains in result, (text,result)
    assert absent not in result, (text,result)


def test_contract_example():
    assert nettoyer('Appelez M. Dupont au 06 12 34 56 78', PROFIL) == 'Appelez [NOM] au [TELEPHONE]'


def test_evenement_hors_perimetre_aveugle():
    e={'id':'1','audit_id':'aud','utilisateur_id':'usr','horodatage':'2026-11-17T10:00:00+01:00','type':'hors_perimetre','appli':'secret','titre_fenetre':'Client John Doe','texte':'123','url':'https://secret.com'}
    out=nettoyer_evenement(e,PROFIL)
    for key in ('appli','titre_fenetre','texte_nettoye','url','miniature_url','empreinte'):
        assert out[key] is None


def test_evenement_domaine_autorise():
    e={'id':'1','audit_id':'aud','utilisateur_id':'usr','horodatage':'2026-11-17T10:00:00+01:00','type':'changement_ecran','appli':'Chrome','titre_fenetre':'Portail A','url':'https://portail-a.example/user?email=x@example.com#secret','texte':'Contact: 06 11 22 33 44','miniature_url':'https://bad'}
    out=nettoyer_evenement(e,PROFIL,{'portail-a.example'})
    assert out['url']=='https://portail-a.example'
    assert out['texte_nettoye']=='Contact: [TELEPHONE]'
    assert out['miniature_url'] is None
    blocked=nettoyer_evenement(e,PROFIL,{'portail-b.example'})
    assert blocked['type']=='hors_perimetre'


def test_idempotent_sur_marqueurs():
    txt='Prix [MONTANT], Contact [NOM] [TELEPHONE]'
    assert nettoyer(nettoyer(txt,PROFIL),PROFIL)==txt


@pytest.mark.parametrize('texte,entite,attendu', [
    ('Portail B - Déposer une annonce', 'Portail B - Déposer', 'Portail B - Déposer une annonce'),
    ('Portail B - Nouvelle annonce', 'Portail B', 'Portail B - Nouvelle annonce'),
    ('Portail B', 'Portail B', 'Portail B'),
    ('Annonce publiée sur Portail A', 'Portail A', 'Annonce publiée sur Portail A'),
    ('Livre intéressant', 'Livre', 'Livre intéressant'),
    ('n8n x Eugenia', 'Eugenia', 'n8n x Eugenia'),
    ('Visite avec Jean-Pierre Dupont', 'Jean-Pierre Dupont', 'Visite avec [NOM]'),
    ('Visite avec jean-pierre dupont', 'jean-pierre dupont', 'Visite avec jean-pierre dupont'),
    ('Module Brumelune', 'Brumelune', 'Module Brumelune'),
])
def test_entites_spacy(monkeypatch, texte, entite, attendu):
    from types import SimpleNamespace
    from filtres import nettoyage

    debut = texte.index(entite)
    detection = SimpleNamespace(label_='PER', text=entite, start_char=debut,
                                end_char=debut + len(entite))
    monkeypatch.setattr(nettoyage, '_get_fr_nlp', lambda: lambda _: SimpleNamespace(ents=[detection]))
    assert nettoyer(texte, dict(PROFIL, mots_interface=['brumelune'])) == attendu


def test_prenom_compose_sans_spacy(monkeypatch):
    from filtres import nettoyage

    monkeypatch.setattr(nettoyage, '_get_fr_nlp', lambda: None)
    assert nettoyer('Visite avec Jean-Pierre Brisedune', PROFIL) == 'Visite avec [NOM]'
