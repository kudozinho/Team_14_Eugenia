"""Titre « lumineux » (1 échec sur 4 le 18/11) : l'agent traduisait ou accordait le titre."""

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

import lancer_agent  # noqa: E402


def test_la_correction_montre_le_mot_faux():
    msg = lancer_agent.mots_faux("Apartment T3 lumineuse proche RER", "Appartement T3 lumineux proche RER")
    assert "« Apartment » au lieu de « Appartement »" in msg
    assert "« lumineuse » au lieu de « lumineux »" in msg


def test_pas_de_detail_si_les_mots_ne_s_alignent_pas():
    assert lancer_agent.mots_faux("T3", "Appartement T3 lumineux") == ""
    assert lancer_agent.mots_faux(329000, 329000) == ""


def test_la_consigne_cite_les_pieges_et_les_guillemets():
    demande = {"consignes": "Publie l'annonce.", "portails": ["https://a"],
               "donnees": dict(lancer_agent.MANDAT_DEMO)}
    texte = lancer_agent.consigne_texte(demande)
    assert "« Appartement T3 lumineux proche RER »" in texte
    assert "jamais « Apartment »" in texte and "jamais « lumineuse »" in texte


def test_le_titre_est_epele_dans_la_consigne_et_la_correction():
    assert lancer_agent.epeler("Appartement T3") == "A-p-p-a-r-t-e-m-e-n-t / T-3"
    demande = {"consignes": "Publie.", "portails": ["https://a"], "donnees": dict(lancer_agent.MANDAT_DEMO)}
    assert "A-p-p-a-r-t-e-m-e-n-t" in lancer_agent.consigne_texte(demande)
    assert "A-p-p-a-r-t-e-m-e-n-t" in lancer_agent.mots_faux("Apartment T3", "Appartement T3")
