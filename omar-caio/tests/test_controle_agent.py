from detection.controle_agent import verifier_preparation


def test_validation_relecture_agent():
    urls = ['https://a.example', 'https://b.example', 'https://c.example']
    annonce = dict(titre='Appartement T3 lumineux', prix=289000,
                   surface_m2=68, ville='Massy', description='T3 avec balcon.')
    demande = {'portails': urls, 'donnees': annonce}
    controles = [dict(annonce, url=url, etapes_inaccessibles=[]) for url in urls]
    reponse = {'controles': controles}

    assert verifier_preparation(demande, reponse) == {}
    controles[0]['titre'] = 'Appartement T3 Excellent'
    controles[2]['etapes_inaccessibles'] = ['Étape 2']
    assert verifier_preparation(demande, reponse) == {
        urls[0]: ['titre'], urls[2]: ['etapes_inaccessibles'],
    }
    controles[2]['url'] = urls[1]
    assert 'reponse' in verifier_preparation(demande, reponse)
