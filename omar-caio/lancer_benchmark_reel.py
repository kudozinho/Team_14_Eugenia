"""Tests Holo réels : 10 cas x 5 relances pour deux IDs de modèles fournis.

Exemple (après config des accès) :
python omar-caio/lancer_benchmark_reel.py \
 --modele-a ID_HOLO_A --modele-b ID_HOLO_B
"""
from __future__ import annotations
import argparse
import json
from pathlib import Path
from detection.prompts import assembler_prompt
from detection.detection import detecter_taches
from detection.provider_holo import HoloProvider
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
    attendu = {cas['id']: cas['methode'] for cas in annotations}
    if analyse_cinq:
        return candidates[:5], prompt
    return [([candidate], prompt) for candidate in candidates], attendu


def main():
    parser=argparse.ArgumentParser(description='Comparaison réelle de deux modèles Holo sur 50 appels chacun')
    parser.add_argument('--modele-a',required=True,help='ID exact du modèle vérifié dans votre compte H Company')
    parser.add_argument('--modele-b',required=True,help='ID exact du second modèle vérifié')
    parser.add_argument('--prix-entree-a',type=float)
    parser.add_argument('--prix-sortie-a',type=float)
    parser.add_argument('--prix-entree-b',type=float)
    parser.add_argument('--prix-sortie-b',type=float)
    args=parser.parse_args()
    cases, attendu = data()
    if args.modele_a == args.modele_b:
        parser.error('Fournir deux modèles distincts')
    providers = [
        HoloProvider(args.modele_a, prix_entree_usd_million=args.prix_entree_a,
                     prix_sortie_usd_million=args.prix_sortie_a),
        HoloProvider(args.modele_b, prix_entree_usd_million=args.prix_entree_b,
                     prix_sortie_usd_million=args.prix_sortie_b),
    ]
    disponibles = providers[0].modeles()
    for provider in providers:
        if provider.model not in disponibles:
            parser.error(f'Modèle absent du catalogue : {provider.model}')
        texte = provider([{'role': 'user', 'content': 'Réponds uniquement par OK.'}])
        if not isinstance(texte, str) or not texte.strip():
            parser.error(f'Pas de réponse texte pour {provider.model}')
        provider.usage.clear()
    OUT.mkdir(exist_ok=True)
    results=[]
    for provider in providers:
        name = provider.model
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
    print('Attention : l’exactitude mesurée porte sur le choix de méthode.')

if __name__=='__main__':main()
