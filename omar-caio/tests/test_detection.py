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


def test_export_recorder_vers_analyse(monkeypatch):
    from analyser_audit import analyser_audit
    from detection.analyse_llm import simulateur_local
    from detection.provider_holo import HoloProvider

    def reponse_holo(self, route, payload):
        assert route == '/chat/completions'
        assert payload['model'] == 'holo-test'
        return {'choices': [{'message': {
            'content': json.dumps(simulateur_local(payload['messages']))
        }}]}

    monkeypatch.setenv('HAI_API_KEY', 'cle-fictive-test')
    monkeypatch.setattr(HoloProvider, '_requete', reponse_holo)
    tache = analyser_audit(EVENTS, HoloProvider('holo-test'))[0]
    assert tache['occurrences'] == 3
    assert tache['duree_moyenne_s'] == 745
    assert tache['methode'] == 'agent_h'
    assert tache['instructions_agent']
    assert tache['prompt_empreinte']


def test_audit_supabase_cli(monkeypatch, capsys):
    import sys

    from analyser_audit import main
    from detection.analyse_llm import simulateur_local
    from detection.supabase_audit import SupabaseAudit

    audit = EVENTS[0]['audit_id']
    requetes = []

    def requete(self, table, parametres, *, lignes=None):
        requetes.append((table, parametres, lignes))
        if table == 'evenements':
            assert parametres['audit_id'] == f'eq.{audit}'
            assert parametres['horodatage'] == 'gte.2026-11-18T08:55:00+01:00'
            return EVENTS if parametres['offset'] == 0 else []
        assert table == 'taches_detectees'
        assert parametres['on_conflict'] == 'id'
        return [{'id': tache['id']} for tache in lignes]

    monkeypatch.setenv('SUPABASE_URL', 'https://ghost.example')
    monkeypatch.setenv('SUPABASE_SERVICE_ROLE_KEY', 'cle-fictive')
    monkeypatch.setattr(SupabaseAudit, '_requete', requete)
    monkeypatch.setattr('analyser_audit.HoloProvider', lambda _: simulateur_local)
    monkeypatch.setattr(sys, 'argv', ['analyser_audit.py', '--audit', audit, '--depuis', '2026-11-18T08:55:00+01:00',
                                      '--modele', 'holo-test', '--ecrire'])

    main()
    premier = json.loads(capsys.readouterr().out)
    main()
    second = json.loads(capsys.readouterr().out)
    assert premier['inserees'] == second['inserees']
    tache = premier['taches'][0]
    assert tache['audit_id'] == audit
    assert (tache['methode'], tache['occurrences'], tache['duree_moyenne_s']) == ('agent_h', 3, 745)
    assert tache['prompt_empreinte']
    assert {'score', 'fiche'}.isdisjoint(requetes[-1][2][0])
