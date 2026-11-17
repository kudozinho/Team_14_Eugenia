"""Rognage du haut des captures de Chrome : onglets, barre d'adresse et favoris ne doivent
jamais être lus par l'OCR ni gardés dans la miniature (ils montrent d'autres sites ouverts)."""

from PIL import Image


def rogner_haut(image: Image.Image, hauteur_fenetre_pt: float, hauteur_barres_pt: float) -> Image.Image:
    """Retire les `hauteur_barres_pt` premiers points de la fenêtre.

    La capture est en pixels (2 pixels par point sur un écran Retina) : échelle = hauteur de
    l'image / hauteur de la fenêtre en points (kCGWindowBounds). Hauteur inconnue ou rognage
    plus grand que l'image : on rend l'image telle quelle plutôt que de tout perdre.
    """
    if hauteur_fenetre_pt <= 0:
        return image
    echelle = image.height / hauteur_fenetre_pt
    haut = round(hauteur_barres_pt * echelle)
    if haut <= 0 or haut >= image.height:
        return image
    return image.crop((0, haut, image.width, image.height))
