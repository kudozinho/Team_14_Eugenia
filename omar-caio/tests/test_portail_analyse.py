"""Recette du point d’entrée appelé par le compagnon, services remplacés localement."""
import json
import sys
from pathlib import Path

import pytest

from analyser_audit import main
from detection.analyse_llm import simulateur_local
from detection.supabase_audit import SupabaseAudit

ROOT = Path(__file__).resolve().parents[2]
EXEMPLE = json.loads((ROOT / 'commun/donnees/evenements-exemple.json').read_text())


def configurer(monkeypatch, evenements):
    ecritures = []
    base = SupabaseAudit('https://ghost.example', 'cle-fictive')

    def lire(audit, **kwargs):
        return [dict(e, audit_id=audit) for e in evenements]

    def inserer(taches):
        ecritures.append(taches)
        return [{'id': t['id']} for t in taches]

    monkeypatch.setattr(base, 'evenements', lire)
    monkeypatch.setattr(base, 'inserer_taches', inserer)
    monkeypatch.setattr(SupabaseAudit, 'depuis_configuration', lambda _: base)
    monkeypatch.delenv('HAI_API_KEY', raising=False)
    return base, ecritures


def lancer(monkeypatch, capsys, audit):
    monkeypatch.setattr(sys, 'argv', ['analyser_audit.py', '--audit', audit,
                                     '--modele', 'holo-test', '--ecrire', '--env', 'absent.env'])
    main()
    return json.loads(capsys.readouterr().out)


@pytest.mark.parametrize('evenements', [[], EXEMPLE[:1]])
def test_session_vide_ou_courte_sans_appel_holo(monkeypatch, capsys, evenements):
    _, ecritures = configurer(monkeypatch, evenements)

    def interdit(*args):
        pytest.fail('Une session sans candidate ne doit pas contacter Holo')

    monkeypatch.setattr('analyser_audit.HoloProvider', interdit)
    resultat = lancer(monkeypatch, capsys, 'audit_vide')
    assert resultat == {'taches': [], 'inserees': []}
    assert not any(ecritures)


def test_nouvel_audit_conserve_ses_evenements_et_ses_taches(monkeypatch, capsys):
    _, ecritures = configurer(monkeypatch, EXEMPLE)
    monkeypatch.setattr('analyser_audit.HoloProvider', lambda _: simulateur_local)
    a = lancer(monkeypatch, capsys, 'audit_portail_a')
    b = lancer(monkeypatch, capsys, 'audit_portail_b')
    assert a['taches'] and b['taches']
    assert all(t['audit_id'] == 'audit_portail_a' for t in a['taches'])
    assert all(t['audit_id'] == 'audit_portail_b' for t in b['taches'])
    assert {t['id'] for t in a['taches']}.isdisjoint(t['id'] for t in b['taches'])
    assert ecritures[0][0]['occurrences'] == 3


def test_lignes_d_un_autre_audit_refusees_avant_qualification(monkeypatch, capsys):
    base, ecritures = configurer(monkeypatch, EXEMPLE)
    monkeypatch.setattr(base, 'evenements', lambda *args, **kwargs: EXEMPLE)
    with pytest.raises(SystemExit) as arret:
        lancer(monkeypatch, capsys, 'audit_inattendu')
    assert arret.value.code == 1
    assert not ecritures


@pytest.mark.parametrize('reponse', ['du texte libre', '{"taches": []}'])
def test_json_invalide_ou_candidates_perdues_sans_ecriture(monkeypatch, capsys, reponse):
    _, ecritures = configurer(monkeypatch, EXEMPLE)
    monkeypatch.setattr('analyser_audit.HoloProvider', lambda _: lambda messages: reponse)
    with pytest.raises(SystemExit) as arret:
        lancer(monkeypatch, capsys, 'audit_erreur')
    assert arret.value.code == 1
    assert not ecritures


def test_erreur_fournisseur_sans_ecriture(monkeypatch, capsys):
    _, ecritures = configurer(monkeypatch, EXEMPLE)

    def echec(messages):
        raise RuntimeError('API H Company : HTTP 401')

    monkeypatch.setattr('analyser_audit.HoloProvider', lambda _: echec)
    with pytest.raises(SystemExit) as arret:
        lancer(monkeypatch, capsys, 'audit_sans_acces')
    assert arret.value.code == 1
    assert not ecritures
