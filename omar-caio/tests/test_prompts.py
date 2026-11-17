import json
from pathlib import Path
import pytest
from detection.prompts import assembler_prompt
from detection.detection import detecter_taches
from detection.analyse_llm import construire_messages, analyser_candidates, simulateur_local, valider_sortie, cle_cache
from vocal.prompts_vocaux import prompt_reformulation, prompt_solutions
from evaluation_benchmark import bench

ROOT=Path(__file__).resolve().parents[2]
P=json.loads((ROOT/'commun/donnees/profils-metier.json').read_text())[0]
C=json.loads((ROOT/'commun/donnees/contexte-entreprise-exemple.json').read_text())
J=json.loads((ROOT/'commun/donnees/postes-exemple.json').read_text())[2]
E=json.loads((ROOT/'commun/donnees/evenements-exemple.json').read_text())

def setup():
    prompt=assembler_prompt(P,C,J)
    tasks=detecter_taches(E,prompt_empreinte=prompt['empreinte'])
    return prompt, tasks

def test_prompt_idempotent():
    a,b=assembler_prompt(P,C,J),assembler_prompt(P,C,J)
    assert a==b
    assert a['organisation_id']=='org_belvedere'
    assert 'COUCHE 1' in a['contenu'] and 'COUCHE 2' in a['contenu'] and 'COUCHE 3' in a['contenu']
    assert 'signature' in a['contenu'] or 'Signer' in a['contenu']


def test_prompt_refuse_autre_organisation():
    j=dict(J,organisation_id='org_autre')
    with pytest.raises(ValueError): assembler_prompt(P,C,j)


def test_json_llm_local_pas_reel():
    prompt,tasks=setup()
    result=analyser_candidates(tasks,prompt,simulateur_local)
    assert len(result)==len(tasks)
    assert all(t['score'] is None for t in result)
    assert cle_cache(tasks,prompt,'modele')==cle_cache(tasks,prompt,'modele')


def test_sortie_rejette_duree_inventee():
    prompt,tasks=setup()
    out=simulateur_local(construire_messages(tasks,prompt))
    out['taches'][0]['duree_moyenne_s']=720
    with pytest.raises(ValueError, match='déterministe'):
        valider_sortie(out,tasks,prompt['empreinte'])


def test_vocal_attend_validation():
    assert len(prompt_reformulation('Je publie trois annonces'))==2
    transcript={'reformulation':{'etapes':['Publier'], 'outils':['Portail A']},'valide':False}
    with pytest.raises(PermissionError):prompt_solutions(transcript,C)
    transcript['valide']=True
    assert len(prompt_solutions(transcript,C))==2


def test_benchmark_sans_fausses_performances():
    prompt,tasks=setup()
    report=bench([(tasks,prompt)]*10,simulateur_local,nom_modele='SIMULATEUR',mode='simulation')
    assert report['nombre_appels']==50
    assert report['appels_valides']==50
    assert report['cout_usd'] is None
    assert report['precision'] is None
    assert report['mode']=='simulation'


def test_analyse_rapport_vendeurs_depuis_detection():
    from lancer_benchmark_reel import data
    from detection.analyse_llm import analyser_candidates

    lot, prompt = data(analyse_cinq=True)
    rapport = next(t for t in lot if t['id'] == 'rapport_vendeurs')
    assert rapport['occurrences'] == 3
    assert rapport['duree_moyenne_s'] == 600
    assert rapport['sequence'][0] == 'Portail A / statistiques'

    def reponse_fictive(messages):
        assert 'sans envoi' in messages[0]['content']
        assert rapport['faits'] in messages[1]['content']
        return json.dumps({'taches': [dict(
            rapport, methode='agent_h', automatisable=True,
            instructions_agent=(
                'Relever les vues et les contacts sur les trois portails fictifs autorisés. '
                'Signaler les données manquantes. Préparer un brouillon et demander '
                'la validation humaine. Ne rien envoyer.'
            )
        )]})

    resultat = analyser_candidates([rapport], prompt, reponse_fictive)[0]
    assert resultat['methode'] == 'agent_h'
    assert resultat['prompt_empreinte'] == prompt['empreinte']
    assert resultat['duree_moyenne_s'] == 600
    assert 'Ne rien envoyer.' in resultat['instructions_agent']
