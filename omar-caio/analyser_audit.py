"""Analyse CAIO d'un export JSON d'événements déjà floutés, pour un seul audit."""
import argparse
import hashlib
import json
from datetime import datetime
from pathlib import Path

from detection.analyse_llm import analyser_candidates, simulateur_local
from detection.detection import detecter_taches
from detection.diagnostic_portails import diagnostic_portails
from detection.prompts import assembler_prompt
from detection.provider_holo import HoloProvider
from detection.supabase_audit import SupabaseAudit

DONNEES = Path(__file__).resolve().parent.parent / 'commun' / 'donnees'


def lire_json(chemin):
    return json.loads(chemin.read_text(encoding='utf-8'))


def analyser_audit(evenements, fournisseur):
    if not evenements:
        return []
    profil = next(p for p in lire_json(DONNEES / 'profils-metier.json') if p['id'] == 'immobilier')
    contexte = lire_json(DONNEES / 'contexte-entreprise-exemple.json')
    poste = next(p for p in lire_json(DONNEES / 'postes-exemple.json') if p['id'] == 'poste_assistante')
    prompt = assembler_prompt(profil, contexte, poste)
    candidates = detecter_taches(evenements, prompt_empreinte=prompt['empreinte'])[:5]
    return analyser_candidates(candidates, prompt, fournisseur) if candidates else []


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    source = parser.add_mutually_exclusive_group(required=True)
    source.add_argument('evenements', nargs='?', type=Path, help='Export JSON flouté du Recorder')
    source.add_argument('--audit', help='Identifiant de l’audit Supabase')
    parser.add_argument('--depuis', help='Date ISO 8601 avec fuseau pour filtrer les événements Supabase')
    parser.add_argument('--avant', help='Fin exclusive de la fenêtre Supabase (ISO 8601 avec fuseau)')
    parser.add_argument('--ecrire', action='store_true', help='Insère les tâches avec --audit')
    parser.add_argument('--env', type=Path, default=Path('.env'), help='Configuration Supabase locale')
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--diagnostic-portails', action='store_true',
                      help='Compte en lecture seule les passages observés sur les formulaires de démo')
    mode.add_argument('--modele', help='Identifiant Holo de la Models API')
    mode.add_argument('--simulation', action='store_true', help='Valide le parcours local sans appel API')
    args = parser.parse_args()
    if args.ecrire and not args.audit:
        parser.error('--ecrire requiert --audit')
    if args.ecrire and not args.modele:
        parser.error('--ecrire requiert --modele')
    if (args.depuis or args.avant) and not args.audit:
        parser.error('--depuis et --avant requièrent --audit')
    if args.diagnostic_portails and args.audit and not (args.depuis and args.avant):
        parser.error('Délimiter la session avec --depuis et --avant')
    try:
        depuis = datetime.fromisoformat(args.depuis) if args.depuis else None
        avant = datetime.fromisoformat(args.avant) if args.avant else None
        if any(borne.utcoffset() is None for borne in (depuis, avant) if borne is not None):
            raise ValueError('Les bornes de temps exigent un fuseau horaire explicite')
        if depuis and avant and depuis >= avant:
            raise ValueError('--avant doit être postérieur à --depuis')
        base = SupabaseAudit.depuis_configuration(args.env) if args.audit else None
        if base:
            evenements = base.evenements(args.audit, depuis=depuis.isoformat() if depuis else None,
                                         avant=avant.isoformat() if avant else None)
        else:
            evenements = lire_json(args.evenements)
        if args.audit and any(e.get('audit_id') != args.audit for e in evenements):
            raise ValueError('La table a renvoyé un événement d’un autre audit')
        if args.diagnostic_portails:
            print(json.dumps(diagnostic_portails(evenements), ensure_ascii=False, indent=2))
            return
        # Une session sans candidate se termine sans appel ni clé du fournisseur.
        def fournisseur_holo(messages):
            return HoloProvider(args.modele)(messages)

        fournisseur = simulateur_local if args.simulation else fournisseur_holo
        taches = analyser_audit(evenements, fournisseur)
        resultat = {'taches': taches}
        if args.ecrire:
            for tache in taches:
                identite = json.dumps([args.audit, tache['sequence']], ensure_ascii=False)
                tache['id'] = 'tache_' + hashlib.sha256(identite.encode()).hexdigest()[:24]
            resultat['inserees'] = [ligne['id'] for ligne in base.inserer_taches(taches)]
        print(json.dumps(resultat, ensure_ascii=False, indent=2, allow_nan=False))
    except (ValueError, RuntimeError, OSError) as exc:
        parser.exit(1, f'{exc}\n')


if __name__ == '__main__':
    main()
