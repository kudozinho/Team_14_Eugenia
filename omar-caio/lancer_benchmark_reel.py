"""Tests Claude réels : 10 cas x 5 relances pour deux IDs de modèles fournis.

Exemple (après config des accès) :
ANTHROPIC_API_KEY=... python omar-caio/lancer_benchmark_reel.py \
 --modele-a ID_HAIKU_VERIFIE --modele-b ID_SONNET_VERIFIE
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from detection.prompts import assembler_prompt
from detection.detection import detecter_taches
from detection.provider_anthropic import AnthropicProvider
from evaluation_benchmark import bench,enregistrer_rapport

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent / 'evaluation'

def data(*, analyse_cinq=False):
    d=ROOT/'commun/donnees'
    load=lambda p: json.loads((d/p).read_text(encoding='utf-8'))
    profil=next(x for x in load('profils-metier.json') if x['id']=='immobilier')
    contexte=load('contexte-entreprise-exemple.json')
    poste=next(x for x in load('postes-exemple.json') if x['id']=='poste_assistante')
    ev=load('evenements-exemple.json')
    annotations = json.loads((Path(__file__).parent / 'exemples/cas_benchmark.json').read_text(encoding='utf-8'))
    prompt = assembler_prompt(profil, contexte, poste)
    modele = detecter_taches(ev, prompt_empreinte=prompt['empreinte'])[0]
    candidates = [
        dict(modele, id=cas['id'], nom=cas['nom'],
             sequence=[cas['nom'], cas['faits']], occurrences=3,
             duree_moyenne_s=None, temps_perdu_semaine_min=None,
             gain_estime_h_semaine=None, methode='rien', automatisable=False,
             instructions_agent=None, workflow_n8n_modele=None, confiance=0)
        for cas in annotations
    ]
    rapport = next(cas for cas in annotations if cas['id'] == 'rapport_vendeurs')
    rapport_events = json.loads(
        (Path(__file__).parent / 'exemples/evenements_rapport_vendeurs_fictifs.json').read_text(encoding='utf-8')
    )
    rapport_detecte = detecter_taches(rapport_events, prompt_empreinte=prompt['empreinte'])[0]
    index_rapport = annotations.index(rapport)
    candidates[index_rapport] = dict(
        rapport_detecte, id=rapport['id'], nom=rapport['nom'], faits=rapport['faits']
    )
    attendu = {cas['id']: cas['methode'] for cas in annotations}
    if analyse_cinq:
        return candidates[:5], prompt
    return [([candidate], prompt) for candidate in candidates], attendu


def main():
    parser=argparse.ArgumentParser(description='Comparaison réelle de deux modèles Claude sur 50 appels chacun')
    parser.add_argument('--modele-a',required=True,help='ID exact du modèle vérifié dans votre compte Anthropic')
    parser.add_argument('--modele-b',required=True,help='ID exact du second modèle vérifié')
    parser.add_argument('--prix-entree-a',type=float)
    parser.add_argument('--prix-sortie-a',type=float)
    parser.add_argument('--prix-entree-b',type=float)
    parser.add_argument('--prix-sortie-b',type=float)
    args=parser.parse_args()
    cases, attendu = data()
    OUT.mkdir(exist_ok=True)
    results=[]
    for name,ine,oute in [(args.modele_a,args.prix_entree_a,args.prix_sortie_a),
                           (args.modele_b,args.prix_entree_b,args.prix_sortie_b)]:
        provider=AnthropicProvider(name,prix_entree_usd_million=ine,prix_sortie_usd_million=oute)
        report=bench(cases,provider,nom_modele=name, mode='reel', attendu=attendu)
        report.update(provider.metriques_tokens())
        results.append(report)
        safe_name=''.join(x if x.isalnum() or x in '-_.' else '_' for x in name)
        enregistrer_rapport(report,OUT/f'benchmark_{safe_name}.json')
        print(name,'JSON valides',report['appels_valides'],'/50',
              '| accord',report['taux_accord_moyen'],
              '| exactitude méthode',report['precision'],
              '| latence s',report['latence_moyenne_s'],
              '| coût USD',report['cout_usd'])
    enregistrer_rapport({'mode':'reel','comparaison':[{k:v for k,v in r.items() if k!='resultats_bruts'} for r in results]},
                        OUT/'comparatif_reel.json')
    print('Attention : la précision métier nécessite en plus des annotations humaines de référence.')

if __name__=='__main__':main()
