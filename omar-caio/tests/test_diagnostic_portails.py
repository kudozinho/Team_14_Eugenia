from datetime import datetime, timedelta, timezone

import pytest

from detection.diagnostic_portails import diagnostic_portails
from detection.supabase_audit import SupabaseAudit


def evenements(sequence):
    base = datetime(2026, 11, 18, 12, tzinfo=timezone.utc)
    chemins = {'A': 'deposer', 'B': 'nouvelle', 'C': 'publier'}
    lignes = []
    for i, etape in enumerate(sequence):
        site = etape.upper()
        url = None
        if site in chemins:
            chemin = chemins[site] if etape.isupper() else 'annonces/exemple'
            url = f'https://ghost-portail-{site.lower()}.vercel.app/{chemin}'
        lignes.append({'type': 'hors_perimetre' if etape == '-' else 'changement_fenetre',
                       'audit_id': 'audit', 'utilisateur_id': 'u', 'id': str(i),
                       'horodatage': (base + timedelta(seconds=i)).isoformat(), 'url': url})
    return lignes


def test_formulaires_et_fiches_avec_interruptions():
    lignes = evenements('AA-aBB-CccABCABCbc')
    # Un ancien export peut comporter une URL indue hors périmètre ; elle est ignorée.
    lignes[2]['url'] = 'https://ghost-portail-c.vercel.app/publier'
    resultat = diagnostic_portails(reversed(lignes))
    assert resultat['captures_formulaire'] == {'A': 4, 'B': 4, 'C': 3}
    assert resultat['passages_formulaires_A_B_C'] == 3
    assert [p['hors_perimetre_entre_formulaires'] for p in resultat['passages']] == [2, 0, 0]


@pytest.mark.parametrize('champ', ['audit_id', 'utilisateur_id'])
def test_ne_relier_ni_utilisateurs_ni_audits(champ):
    lignes = evenements('ABC')
    lignes[-1][champ] = 'autre'
    assert diagnostic_portails(lignes)['passages'] == []


def test_autre_activite_ou_fiches_seules_ne_comptent_pas():
    assert diagnostic_portails(evenements('ABXCabcabcabc'))['passages'] == []


def test_fenetre_supabase_est_bornee_sans_charger_le_texte(monkeypatch):
    base = SupabaseAudit('https://ghost.example', 'cle-fictive')
    appels = []

    def lire(table, filtres):
        appels.append(filtres)
        return []

    monkeypatch.setattr(base, '_requete', lire)
    base.evenements('audit', depuis='2026-11-18T14:28:00+01:00', avant='2026-11-18T14:44:00+01:00')
    assert appels[0]['horodatage'] == 'gte.2026-11-18T14:28:00+01:00'
    assert appels[0]['and'] == '(horodatage.lt.2026-11-18T14:44:00+01:00)'
    colonnes = appels[0]['select'].split(',')
    assert 'url' in colonnes and 'texte_nettoye' not in colonnes


def test_ecriture_impossible_en_diagnostic(monkeypatch):
    import sys
    from analyser_audit import main
    monkeypatch.setattr(sys, 'argv', ['analyser_audit.py', '--audit', 'audit', '--ecrire',
                                     '--diagnostic-portails'])
    with pytest.raises(SystemExit) as arret:
        main()
    assert arret.value.code == 2
