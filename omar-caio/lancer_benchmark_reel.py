"""Tests Claude réels : 10 cas x 5 relances pour deux IDs de modèles fournis.

Exemple (après config des accès) :
ANTHROPIC_API_KEY=... python omar-caio/lancer_benchmark_reel.py \
 --modele-a ID_HAIKU_VERIFIE --modele-b ID_SONNET_VERIFIE
"""
from __future__ import annotations
import argparse
from copy import deepcopy
import json
from pathlib import Path
from detection.prompts import assembler_prompt
from detection.detection import detecter_taches
from detection.provider_anthropic import AnthropicProvider
from evaluation_benchmark import bench,enregistrer_rapport

ROOT = Path(__file__).resolve().parents[1]
OUT = Path(__file__).resolve().parent / 'evaluation'

def data():
    d=ROOT/'commun/donnees'
    load=lambda p: json.loads((d/p).read_text(encoding='utf-8'))
    profil=next(x for x in load('profils-metier.json') if x['id']=='immobilier')
    contexte=load('contexte-entreprise-exemple.json')
    poste=next(x for x in load('postes-exemple.json') if x['id']=='poste_assistante')
    ev=load('evenements-exemple.json')
    cases=[]
    for i in range(10):
        c=deepcopy(contexte)
        c['resume']['objectifs']=[f'Cas test métier {i+1} : automatiser la ressaisie des annonces']
        p=assembler_prompt(profil,c,poste)
        tasks=detecter_taches(ev,prompt_empreinte=p['empreinte'])
        cases.append((tasks,p))
    return cases


def main():
    parser=argparse.ArgumentParser(description='Comparaison réelle de deux modèles Claude sur 50 appels chacun')
    parser.add_argument('--modele-a',required=True,help='ID exact du modèle vérifié dans votre compte Anthropic')
    parser.add_argument('--modele-b',required=True,help='ID exact du second modèle vérifié')
    parser.add_argument('--prix-entree-a',type=float)
    parser.add_argument('--prix-sortie-a',type=float)
    parser.add_argument('--prix-entree-b',type=float)
    parser.add_argument('--prix-sortie-b',type=float)
    args=parser.parse_args()
    cases=data()
    OUT.mkdir(exist_ok=True)
    results=[]
    for name,ine,oute in [(args.modele_a,args.prix_entree_a,args.prix_sortie_a),
                           (args.modele_b,args.prix_entree_b,args.prix_sortie_b)]:
        provider=AnthropicProvider(name,prix_entree_usd_million=ine,prix_sortie_usd_million=oute)
        report=bench(cases,provider,nom_modele=name,mode='reel')
        report.update(provider.metriques_tokens())
        results.append(report)
        safe_name=''.join(x if x.isalnum() or x in '-_.' else '_' for x in name)
        enregistrer_rapport(report,OUT/f'benchmark_{safe_name}.json')
        print(name,'JSON valides',report['appels_valides'],'/50',
              '| accord',report['taux_accord_moyen'],
              '| latence s',report['latence_moyenne_s'],
              '| coût USD',report['cout_usd'])
    enregistrer_rapport({'mode':'reel','comparaison':[{k:v for k,v in r.items() if k!='resultats_bruts'} for r in results]},
                        OUT/'comparatif_reel.json')
    print('Attention : la précision métier nécessite en plus des annotations humaines de référence.')

if __name__=='__main__':main()
