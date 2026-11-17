"""Crée les artefacts de démo à partir du kit commun, sans réseau.

Exécution : python omar-caio/generer_livrables.py depuis la racine du projet.
Le rapport benchmark marque explicitement la simulation.
"""
from __future__ import annotations
import json
from copy import deepcopy
from pathlib import Path
from filtres.nettoyage import nettoyer, nettoyer_evenement
from detection.prompts import assembler_prompt
from detection.detection import detecter_taches, detecter_sequences
from detection.analyse_llm import simulateur_local, analyser_candidates
from vocal.prompts_vocaux import prompt_reformulation, prompt_solutions
from evaluation_benchmark import bench, enregistrer_rapport

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'commun' / 'donnees'
OUT = Path(__file__).resolve().parent / 'exemples'
OUT.mkdir(exist_ok=True)

def load(name):
    return json.loads((DATA/name).read_text(encoding='utf-8'))

def dump(name,obj):
    (OUT/name).write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def main():
    profil=next(p for p in load('profils-metier.json') if p['id']=='immobilier')
    contexte=load('contexte-entreprise-exemple.json')
    poste=next(j for j in load('postes-exemple.json') if j['id']=='poste_assistante')
    events=load('evenements-exemple.json')
    prompt=assembler_prompt(profil, contexte, poste)
    # Le Recorder d'Alejandro transmettra de vrais événements le jour du branchement.
    filtre=nettoyer('Appelez M. Dupont au 06 12 34 56 78 | Prix : 289000',profil)
    e=nettoyer_evenement(events[1],profil,{'portail-a.example','portail-b.example','portail-c.example','immogest.example'})
    dump('nettoyage_exemple.json',{'entree_fictive':'Appelez M. Dupont au 06 12 34 56 78 | Prix : 289000',
                                  'sortie':filtre,'evenement_filtre':e})
    dump('prompt_systeme_exemple.json',prompt)
    taches=detecter_taches(events,prompt_empreinte=prompt['empreinte'])
    dump('taches_detectees_demo.json',taches)
    dump('candidates_raw_demo.json',detecter_sequences(events))
    dump('analyse_llm_SIMULATION.json', analyser_candidates(taches,prompt,simulateur_local))
    tr={'id':'voc_001','audit_id':'aud_demo','utilisateur_id':'usr_assistante',
        'texte_nettoye':'Je reprends le mandat et publie sur trois sites sans passerelle.',
        'reformulation':{'etapes':['Ouvrir ImmoGest','Publier sur trois portails'],
                         'outils':['ImmoGest','Portail A','Portail B','Portail C'],
                         'frequence':None,'temps_estime_min':None},
        'valide':True,'solutions':[]}
    dump('prompts_vocaux_exemple.json',{'reformulation':prompt_reformulation(tr['texte_nettoye']),
                                       'solutions_apres_validation':prompt_solutions(tr,contexte)})
    # 10 contextes synthétiques distincts (la simulation ne mesure PAS les performances Claude).
    cases=[]
    for i in range(10):
        c=deepcopy(contexte)
        c['resume']['objectifs']=[f'Cas fictif de test n°{i+1} : libérer du temps aux assistantes']
        p=assembler_prompt(profil,c,poste)
        ts=deepcopy(taches)
        for task in ts:
            task['prompt_empreinte']=p['empreinte']
        cases.append((ts,p))
    report=bench(cases,simulateur_local,nom_modele='SIMULATEUR_LOCAL_NON_LLM',mode='simulation')
    enregistrer_rapport(report,OUT/'benchmark_SIMULATION_10x5.json')
    successes=len(taches)
    results=f'''# Ghost — Preuves et limites techniques (CAIO)

Généré à partir du kit de données fictives. **Aucun test H Company, Supabase, n8n ou Claude réel dans ce rapport.**

## Détection automatique
- Tâches indépendantes détectées : {successes}.
- Process principal : {taches[0]['nom']}.
- Séquence : {' → '.join(taches[0]['sequence'])}.
- Occurrences : {taches[0]['occurrences']}.
- Durée moyenne observée sur les **cycles complets** : {taches[0]['duree_moyenne_s']} s.
- L'exemple de référence du kit annonce 720 s ; les événements complets permettent de calculer 745 s. La durée du portail C du second cycle est manquante : nous ne l'avons ni inventée ni remplacée par 0.
- La ligne de suivi Excel apparaît {taches[1]['occurrences'] if len(taches)>1 else 'non détectée'} fois dans les événements, alors que le fichier cible mentionne 2 occurrences. Écart à clarifier avec l'équipe.
- Aucun temps hebdomadaire ou gain net fiable calculable sans fréquence et temps de l'agent observés.

## Confidentialité
- Exemple : « Appelez M. Dupont au 06 12 34 56 78 » → « {nettoyer('Appelez M. Dupont au 06 12 34 56 78',profil)} ».
- Motifs locaux, modèle NER français optionnel non installé dans cet environnement ; repli à règles limitées.
- À considérer comme **pseudonymisation heuristique**, pas comme anonymisation garantie.
- Les fichiers non autorisés doivent être exclus **avant la capture**, et non seulement masqués ensuite.

## Reproductibilité
- Banc de test : 10 cas synthétiques, 5 relances chacun.
- Résultats dans `benchmark_SIMULATION_10x5.json` : **simulation de format, non performance IA**.
- Aucun score Haiku/Sonnet ni coût API réel disponible en l'absence de clés et de modèles effectivement configurés.
- `evaluation_benchmark.py` et `provider_anthropic.py` permettent les essais réels (identifiant modèle et clé à fournir).

## Bloquants / intégrations
1. Alejandro : injection de `nettoyer_evenement()` en amont de la base et test 10 événements, plus voie tâche §2 → agent H.
2. Henriquet : fournir événements réels anonymisés via Supabase et mesurer la fréquence.
3. Vladimir : vérifier qu'il n'existe pas d'API adaptée aux portails tests, puis connecter le bon workflow n8n.
4. Binta : relier le tableau de bord aux objets §2 et demander validation humaine avant action sensible.
5. Assel : valider les prompts métier et les règles de conservation et de consentement.

## Limites à mentionner au jury
- Les noms, adresses atypiques et documents libres peuvent échapper aux motifs ; le filtrage est probabiliste/heuristique.
- La détection repère des séquences identiques d'interfaces, pas des intentions métier.
- Le temps d'écran n'est pas le temps total de travail ni une mesure de performance du salarié.
- Aucune automatisation de paiement, signature, changement de prix ou e-mail sans accord humain.
- Une démo en environnement fictif ne démontre ni disponibilité sur les plateformes de production ni conformité juridique complète.
'''
    (OUT/'PREUVES_LIMITES.md').write_text(results,encoding='utf-8')
    (OUT/'CP2_CAIO.md').write_text(f'''# Checkpoint 2 — éléments CAIO

- **Confidentialité** : `Appelez M. Dupont au 06 12 34 56 78` devient `{nettoyer('Appelez M. Dupont au 06 12 34 56 78',profil)}`.
- **Détection** : publication ImmoGest → portails A/B/C, **3 occurrences** sur données fictives ; moyenne vérifiable **745 s sur 2 cycles complets**.
- **Intégrations restantes** : Recorder réel, Supabase, H Company et n8n.
- **Attention** : ces résultats sont issus du kit synthétique ; à remplacer par une observation réellement captée pour satisfaire le checkpoint officiel.
''',encoding='utf-8')
    (OUT/'CP4_CAIO.md').write_text('''# Pitch final — éléments CAIO à compléter avec tests réels

- Les filtres de confidentialité tournent localement, avant toute transmission.
- La répétition est décidée en Python ; le LLM ne choisit pas les occurrences ni les durées.
- Le prompt a trois couches (métier, entreprise, poste) et une empreinte SHA-256.
- Décision méthodologique : outil existant > API/n8n > interface sans API/agent H ; ne rien automatiser si preuve insuffisante.
- **À renseigner après essais réels** : taux d'accord des modèles, coût en crédits, latence, réussite de l'agent sur 3 portails.
- **Ne pas présenter** les résultats du simulateur local comme des mesures Claude ou H Company.
''',encoding='utf-8')
    print('Fichiers de démonstration générés dans',OUT)
    print('Tâches distinctes détectées :',len(taches),'| Temps moyen principal :',taches[0]['duree_moyenne_s'],'s')
    print('Benchmark : SIMULATION UNIQUEMENT | 10 cas x 5 relances')

if __name__=='__main__':
    main()
