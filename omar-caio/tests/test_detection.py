import json
from pathlib import Path
from detection.detection import evenement_vers_action, detecter_taches, detecter_sequences
ROOT=Path(__file__).resolve().parents[2]
EVENTS=json.loads((ROOT/'commun/donnees/evenements-exemple.json').read_text())
TARGET=json.loads((ROOT/'commun/donnees/tache-detectee-exemple.json').read_text())[0]

def test_retrouve_la_tache_principale():
    t=detecter_taches(EVENTS,prompt_empreinte='test')[0]
    assert t['sequence']==TARGET['sequence']
    assert t['occurrences']==TARGET['occurrences']==3
    assert t['methode']=='agent_h'
    assert t['prompt_empreinte']=='test'
    # Le kit contient une durée nulle au second cycle : exclue, non inventée.
    assert t['duree_moyenne_s']==745
    assert t['temps_perdu_semaine_min'] is None
    assert t['gain_estime_h_semaine'] is None


def test_hors_perimetre_ignore():
    e=next(x for x in EVENTS if x['type']=='hors_perimetre')
    assert evenement_vers_action(e) is None
    assert 'secrets' not in str(detecter_taches(EVENTS))


def test_pourcentage_utile_pas_invente():
    t=detecter_taches(EVENTS,frequence_semaine=15)[0]
    assert t['temps_perdu_semaine_min']==round(745*15/60)


def test_events_groupe_par_audit():
    arr=[dict(x) for x in EVENTS]
    arr[0]['audit_id']='autre_audit'
    try:
        detecter_taches(arr)
        assert False, 'Devrait refuser plusieurs audits'
    except ValueError:
        pass


def test_deduplication_empreinte():
    e=EVENTS[0].copy()
    extra=e.copy();extra['id']='doublon';extra['horodatage']='2026-11-18T09:05:11+01:00'
    arr=[e,extra]+EVENTS[1:]
    assert detecter_taches(arr)[0]['occurrences']==3
