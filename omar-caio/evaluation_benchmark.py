"""Harnais d'évaluation : 10 cas x 5 relances par modèle, PAS de métrique inventée.

L'utilisation d'un fournisseur réel passe par un callback fourni à bench().
Les prix API ne sont calculés que lorsqu'ils sont effectivement disponibles.
"""
from __future__ import annotations
import json
import statistics
from pathlib import Path
from time import perf_counter
from typing import Any, Callable, Mapping, Sequence
from detection.analyse_llm import analyser_candidates


def normaliser_decision(taches: Sequence[Mapping[str, Any]]) -> tuple[tuple[str,str], ...]:
    return tuple(sorted((str(t['nom']).casefold().strip(), str(t['methode'])) for t in taches))


def bench(cas: Sequence[tuple[Sequence[Mapping[str, Any]], Mapping[str, Any]]],
          callback: Callable[[list[dict[str,str]]], str | Mapping[str, Any]], *,
          nom_modele: str, repeats: int = 5, mode: str = 'reel',
          attendu: Mapping[str, str] | None = None) -> dict[str, Any]:
    if len(cas) != 10 or repeats != 5:
        raise ValueError('Le protocole prévu est 10 cas x 5 relances')
    if mode not in {'reel', 'simulation'}:
        raise ValueError('mode doit être réel ou simulation')
    if attendu is not None and set(attendu) != {t['id'] for candidates, _ in cas for t in candidates}:
        raise ValueError('Il faut une annotation par candidate')
    rows = []
    agreements = []
    for i, (candidates, p) in enumerate(cas):
        outputs = []
        for essai in range(repeats):
            start = perf_counter()
            exact = None
            try:
                tasks = analyser_candidates(candidates, p, callback)
                signature = normaliser_decision(tasks)
                outputs.append(signature)
                if attendu is not None:
                    exact = all(t['methode'] == attendu[t['id']] for t in tasks)
                status, error = 'ok', None
            except Exception as exc:
                signature = None
                outputs.append(None)
                status, error = 'failed', type(exc).__name__ + ': ' + str(exc)
            rows.append({'cas':i+1, 'essai':essai+1, 'status':status,
                         'latence_s':round(perf_counter()-start,4),
                         'decision':signature, 'erreur':error, 'exact':exact})
        # Taux d'accord mesuré contre la modalité la plus fréquente, pas le « vrai » résultat.
        valid = [v for v in outputs if v is not None]
        agreement = (max(valid.count(v) for v in valid)/len(valid)) if valid else 0.0
        agreements.append(agreement)
    successful = [r for r in rows if r['status']=='ok']
    return {
        'mode': mode, 'modele':nom_modele, 'nombre_cas':10, 'relances_par_cas':5,
        'nombre_appels':50, 'appels_valides':len(successful),
        'taux_json_valide':round(len(successful)/50,3),
        'taux_accord_moyen':round(statistics.mean(agreements),3),
        'cas_accord_min_9_sur_10':sum(a>=0.9 for a in agreements),
        'latence_moyenne_s':round(statistics.mean(r['latence_s'] for r in rows),4),
        'cout_usd':None,  # Non calculé sans usages/token pricing vérifiés.
        'precision': round(sum(r['exact'] is True for r in rows) / len(rows), 3)
        if attendu is not None else None,
        'resultats_bruts':rows,
    }


def enregistrer_rapport(rapport: Mapping[str, Any], chemin: str | Path) -> None:
    Path(chemin).parent.mkdir(parents=True, exist_ok=True)
    Path(chemin).write_text(json.dumps(rapport,ensure_ascii=False,indent=2),encoding='utf-8')
