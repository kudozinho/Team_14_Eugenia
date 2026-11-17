"""Score d'une tâche (doc 07, partie 18 b) et gain net (formule du professeur).

Ce module ne dépend de rien : il peut être importé par la détection (Omar), le rapport (Binta)
ou le script qui écrit en base (ecrire_score_en_base.py).

    from score import heures_nettes, scorer
"""

# Grille du gain : heures nettes par an -> note de 1 à 5 (doc 07, 18 b)
SEUILS_GAIN = [(150, 5), (60, 4), (25, 3), (10, 2), (0, 1)]

# Poids de la formule (doc 07) : le gain pèse le plus, effort et risque sont inversés
POIDS = {"gain": 0.35, "facilite": 0.20, "effort": 0.20, "risque": 0.15, "confiance": 0.10}

QUADRANTS = ("gain_rapide", "projet", "a_regrouper", "a_ecarter")


def heures_nettes(personnes, par_an_par_personne, minutes_gagnees, adoption, part_recuperee):
    """Formule du professeur : personnes × fréquence × temps gagné × adoption × part récupérée.

    Retourne des heures par an. L'adoption et la part récupérée ne sont jamais à 100 %.
    """
    if not (0 <= adoption < 1 and 0 <= part_recuperee < 1):
        raise ValueError("adoption et part récupérée doivent être entre 0 et 1, jamais 100 %")
    return personnes * par_an_par_personne * minutes_gagnees / 60 * adoption * part_recuperee


def note_gain(heures_an):
    """Convertit des heures nettes par an en note de 1 à 5."""
    for seuil, note in SEUILS_GAIN:
        if heures_an >= seuil:
            return note
    return 1


def total(gain, facilite, effort, risque, confiance):
    """Score sur 100 = (0,35 G + 0,20 F + 0,20 (6 − E) + 0,15 (6 − R) + 0,10 C) × 20."""
    for nom, v in (("gain", gain), ("facilite", facilite), ("effort", effort), ("risque", risque), ("confiance", confiance)):
        if v not in (1, 2, 3, 4, 5):
            raise ValueError(f"{nom} doit être une note entière de 1 à 5 (reçu : {v})")
    brut = (POIDS["gain"] * gain + POIDS["facilite"] * facilite + POIDS["effort"] * (6 - effort)
            + POIDS["risque"] * (6 - risque) + POIDS["confiance"] * confiance) * 20
    return round(brut)


def quadrant(gain, effort):
    """Matrice gain / effort : gain ≥ 3 et effort ≤ 2 = gain rapide, etc."""
    if gain >= 3:
        return "gain_rapide" if effort <= 2 else "projet"
    return "a_regrouper" if effort <= 2 else "a_ecarter"


def scorer(heures_an, facilite, effort, risque, confiance, hypotheses):
    """Construit le champ `score` d'une tâche détectée (contrat §10).

    heures_an : gain net calculé avec heures_nettes()
    hypotheses : liste de phrases, une par hypothèse, avec à qui la vérifier
    Garde-fous (doc 07) :
      - risque à 5 : la tâche sort du classement, mention « à ne pas automatiser » ;
      - confiance à 1 ou 2 : mention « à mesurer ».
    """
    gain = note_gain(heures_an)
    score = {
        "gain": gain, "facilite": facilite, "effort": effort, "risque": risque, "confiance": confiance,
        "total": total(gain, facilite, effort, risque, confiance),
        "heures_an": round(heures_an),
        "quadrant": quadrant(gain, effort),
        "hypotheses": list(hypotheses),
    }
    if risque == 5:
        score["exclu"] = True
        score["mention"] = "à ne pas automatiser"
    elif confiance <= 2:
        score["mention"] = "à mesurer"
    return score
