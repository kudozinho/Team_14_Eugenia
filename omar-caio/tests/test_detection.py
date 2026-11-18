import json
from datetime import datetime, timedelta
from pathlib import Path
import pytest
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


@pytest.mark.parametrize(('url', 'titre', 'action'), [
    ('https://ghost-portail-b.vercel.app/nouvelle', 'Portail B', 'Portail B / formulaire'),
    ('https://ghost-portail-c.vercel.app/annonces/123?publiee=1', 'Portail C', 'Portail C / fiche annonce'),
    ('https://ghost-portail-a.vercel.app/annonces', 'Portail A - Déposer une annonce', 'Portail A / liste des annonces'),
    ('https://portail-a.example/', 'Portail A', 'Portail A / accueil'),
    ('https://portail-b.example/deposer', 'Portail B - Nouvelle annonce', 'Portail B / autre page'),
    (None, 'Portail A - Déposer une annonce - Google Chrome', 'Portail A / formulaire'),
    (None, 'Portail C - Annonces publiées', 'Portail C / liste des annonces'),
    (None, 'Portail A - Annonce', 'Portail A / fiche annonce'),
])
def test_action_distingue_formulaires_et_consultations(url, titre, action):
    evenement = {'titre_fenetre': titre, 'url': url}
    assert evenement_vers_action(evenement) == action


def test_visites_de_listes_ne_declenchent_pas_une_publication():
    evenements = []
    for row in EVENTS:
        url = row.get('url') or ''
        if 'portail-' in url:
            row = dict(row, url=url.rsplit('/', 1)[0] + '/annonces')
        evenements.append(row)
    taches = detecter_taches(evenements)
    assert taches
    assert all(tache['methode'] == 'rien' for tache in taches)


def test_formulaire_ne_peut_etre_deduit_d_un_autre_domaine():
    titre = 'Portail A - Déposer une annonce'
    assert evenement_vers_action({
        'appli': 'Chrome', 'titre_fenetre': titre, 'url': 'https://autre.example/deposer',
    }) != 'Portail A / formulaire'
    assert evenement_vers_action({'titre_fenetre': 'Portail administratif'}) != 'Portail A / formulaire'


def test_trois_captures_du_meme_formulaire_comptent_pour_une_visite():
    evenements = [dict(EVENTS[1], id=f'capture_{i}', empreinte=f'image_{i}',
                       horodatage=f'2026-11-18T13:00:0{i}+01:00', duree_s=1) for i in range(3)]
    assert detecter_taches(evenements) == []
    seule, = detecter_sequences(evenements, min_occurrences=1)
    assert seule['duree_moyenne_s'] == 3
    assert seule['ids_evenements'] == [['capture_0', 'capture_1', 'capture_2']]


def test_empreinte_identique_ne_fusionne_pas_deux_applications_distinctes():
    a, b = EVENTS[1:3]
    trace = [a, dict(b, empreinte=a['empreinte'])]
    sequence, = detecter_sequences(trace, min_occurrences=1, min_etapes=2)
    assert sequence['sequence'] == ['Portail A / formulaire', 'Portail B / formulaire']


def test_captures_successives_conservent_tous_les_identifiants_et_la_duree_inconnue():
    evenements = []
    for row in EVENTS:
        evenements.append(row)
        if row['id'] in ('evt_0002', 'evt_0007', 'evt_0012'):
            # Même formulaire, nouvelle capture d'écran une seconde plus tard.
            horodatage = datetime.fromisoformat(row['horodatage']) + timedelta(seconds=1)
            evenements.append(dict(row, id=row['id'] + '_bis', empreinte='autre',
                                  horodatage=horodatage.isoformat(),
                                  duree_s=None if row['id'] == 'evt_0002' else 4))
    sequence = next(s for s in detecter_sequences(evenements) if s['sequence'] == TARGET['sequence'])
    assert sequence['occurrences'] == 3
    assert sequence['occurrences_duree_connue'] == 1
    ids = sequence['ids_evenements']
    assert all(len(groupe) == 5 for groupe in ids)
    assert ids[0][1:3] == ['evt_0002', 'evt_0002_bis']
    dernier = {row['id']: row for row in evenements}
    assert sequence['duree_moyenne_s'] == sum(dernier[ident]['duree_s'] for ident in ids[2])


@pytest.mark.parametrize('separation', ['pause', 'utilisateur', 'audit'])
def test_une_etape_ne_traverse_pas_une_separation(separation):
    premier, second = dict(EVENTS[1]), dict(EVENTS[2])
    evenements = [premier, second]
    if separation == 'pause':
        pause = dict(premier, id='pause', type='hors_perimetre', horodatage='2026-11-18T09:08:00+01:00')
        evenements.insert(1, pause)
    elif separation == 'utilisateur':
        second['utilisateur_id'] = 'autre'
    else:
        second['audit_id'] = 'autre'
    assert detecter_sequences(evenements, min_occurrences=1, min_etapes=2) == []


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
