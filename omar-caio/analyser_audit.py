"""Analyse CAIO d'un export JSON d'événements déjà floutés, pour un seul audit."""
import argparse
import json
from pathlib import Path

from detection.analyse_llm import analyser_candidates, simulateur_local
from detection.detection import detecter_taches
from detection.prompts import assembler_prompt
from detection.provider_holo import HoloProvider

DONNEES = Path(__file__).resolve().parent.parent / 'commun' / 'donnees'


def lire_json(chemin):
    return json.loads(chemin.read_text(encoding='utf-8'))


def analyser_audit(evenements, fournisseur):
    profil = next(p for p in lire_json(DONNEES / 'profils-metier.json') if p['id'] == 'immobilier')
    contexte = lire_json(DONNEES / 'contexte-entreprise-exemple.json')
    poste = next(p for p in lire_json(DONNEES / 'postes-exemple.json') if p['id'] == 'poste_assistante')
    prompt = assembler_prompt(profil, contexte, poste)
    candidates = detecter_taches(evenements, prompt_empreinte=prompt['empreinte'])[:5]
    return analyser_candidates(candidates, prompt, fournisseur) if candidates else []


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('evenements', type=Path, help='Export du Recorder après validation du floutage')
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--modele', help='Identifiant Holo de la Models API')
    mode.add_argument('--simulation', action='store_true', help='Valide le parcours local sans appel API')
    args = parser.parse_args()
    fournisseur = simulateur_local if args.simulation else HoloProvider(args.modele)
    taches = analyser_audit(lire_json(args.evenements), fournisseur)
    print(json.dumps({'taches': taches}, ensure_ascii=False, indent=2, allow_nan=False))


if __name__ == '__main__':
    main()
