"""Tests : on doit retrouver exactement les chiffres du doc 07 (73, 85, 71 points ; 49, 84, 72 h ; 205 h).

    python -m pytest henriquet-cdo/scoring -q
"""
import pytest

from calcul_gain import calculer
from score import heures_nettes, note_gain, quadrant, scorer, total


def test_heures_des_3_taches_du_doc_07():
    assert round(heures_nettes(2, 300, 10, 0.7, 0.7)) == 49
    assert round(heures_nettes(6, 400, 5, 0.6, 0.7)) == 84
    assert round(heures_nettes(6, 300, 8, 0.5, 0.6)) == 72


def test_scores_du_doc_07():
    assert total(3, 4, 2, 2, 4) == 73
    assert total(4, 5, 1, 3, 4) == 85
    assert total(4, 3, 2, 3, 3) == 71


def test_grille_du_gain():
    assert [note_gain(h) for h in (5, 10, 24, 25, 59, 60, 149, 150)] == [1, 2, 2, 3, 3, 4, 4, 5]


def test_quadrants():
    assert quadrant(3, 2) == "gain_rapide"
    assert quadrant(4, 3) == "projet"
    assert quadrant(2, 1) == "a_regrouper"
    assert quadrant(2, 4) == "a_ecarter"


def test_garde_fous():
    assert scorer(100, 4, 2, 5, 4, [])["mention"] == "à ne pas automatiser"
    assert scorer(100, 4, 2, 5, 4, [])["exclu"] is True
    assert scorer(100, 4, 2, 2, 2, [])["mention"] == "à mesurer"
    assert "mention" not in scorer(100, 4, 2, 2, 4, [])


def test_adoption_jamais_100_pourcent():
    with pytest.raises(ValueError):
        heures_nettes(2, 300, 10, 1.0, 0.7)


def test_note_hors_bornes_refusee():
    with pytest.raises(ValueError):
        total(6, 4, 2, 2, 4)


def test_calcul_sur_la_source_unique():
    r = calculer()
    assert [x["score"]["total"] for x in r["taches_justifiees"]] == [73, 85, 71]
    assert [x["score"]["heures_an"] for x in r["taches_justifiees"]] == [49, 84, 72]
    assert r["total_heures_an"] == 205
    assert all(x["score"]["quadrant"] == "gain_rapide" for x in r["taches_justifiees"])
    assert all(len(x["score"]["hypotheses"]) == 5 for x in r["taches_justifiees"])
    assert r["pistes_a_confirmer_heures_an"] == 155
