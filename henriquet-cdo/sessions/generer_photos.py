"""Photos FICTIVES des 6 mandats des sessions : un dessin différent par bien.

Usage : python generer_photos.py  (écrit photos/M-xxxx.jpg, 1200 x 800)
Chaque image porte la mention « PHOTO FICTIVE » : aucun bien réel.
"""
from pathlib import Path
import random

from PIL import Image, ImageDraw, ImageFont

ICI = Path(__file__).resolve().parent
SORTIE = ICI / "photos"
W, H = 1200, 800
SOL = 640


def police(taille, gras=False):
    noms = ["DejaVuSans-Bold.ttf" if gras else "DejaVuSans.ttf", "arialbd.ttf" if gras else "arial.ttf"]
    for n in noms:
        try:
            return ImageFont.truetype(n, taille)
        except OSError:
            pass
    return ImageFont.load_default()


def ciel(d, haut, bas):
    for y in range(SOL):
        t = y / SOL
        d.line([(0, y), (W, y)], fill=tuple(int(haut[i] + (bas[i] - haut[i]) * t) for i in range(3)))


def sol(d, couleur):
    d.rectangle([0, SOL, W, H], fill=couleur)


def nuages(d, rng, n=3):
    for _ in range(n):
        x, y = rng.randint(50, W - 250), rng.randint(110, 230)
        for dx, dy, r in [(0, 0, 38), (40, -18, 45), (85, 0, 38), (42, 12, 40)]:
            d.ellipse([x + dx - r, y + dy - r, x + dx + r, y + dy + r], fill=(250, 250, 252))


def arbre(d, x, base, h=170, r=70, vert=(74, 128, 72)):
    d.rectangle([x - 10, base - h + r, x + 10, base], fill=(110, 80, 55))
    d.ellipse([x - r, base - h - r // 2, x + r, base - h + r + r // 2], fill=vert)


def fenetre(d, x, y, w, h, volets=None, cadre=(245, 245, 240), vitre=(160, 200, 225)):
    d.rectangle([x, y, x + w, y + h], fill=cadre)
    d.rectangle([x + 5, y + 5, x + w - 5, y + h - 5], fill=vitre)
    d.line([(x + w // 2, y + 5), (x + w // 2, y + h - 5)], fill=cadre, width=3)
    if volets:
        d.rectangle([x - 18, y, x - 2, y + h], fill=volets)
        d.rectangle([x + w + 2, y, x + w + 18, y + h], fill=volets)


def voiture(d, x, y, couleur):
    d.rounded_rectangle([x, y - 34, x + 120, y], 10, fill=couleur)
    d.polygon([(x + 22, y - 34), (x + 38, y - 60), (x + 86, y - 60), (x + 102, y - 34)], fill=couleur)
    d.polygon([(x + 32, y - 36), (x + 43, y - 55), (x + 81, y - 55), (x + 92, y - 36)], fill=(190, 215, 235))
    for cx in (x + 28, x + 92):
        d.ellipse([cx - 14, y - 14, cx + 14, y + 14], fill=(40, 40, 45))


# 1. M-0142 : immeuble avec ascenseur, balcon au 2e, RER au loin
def m0142(d, rng):
    ciel(d, (120, 175, 225), (205, 228, 245)); nuages(d, rng); sol(d, (150, 150, 150))
    d.rectangle([900, 470, 1200, 520], fill=(120, 120, 125))  # quai
    d.rounded_rectangle([930, 420, 1190, 470], 12, fill=(30, 90, 170))  # train RER
    for i in range(5):
        d.rectangle([945 + i * 48, 432, 975 + i * 48, 452], fill=(200, 225, 245))
    d.rectangle([300, 210, 760, SOL], fill=(232, 220, 200))
    d.rectangle([290, 195, 770, 215], fill=(150, 140, 130))
    for etage in range(5):
        y = 240 + etage * 78
        for col in range(4):
            fenetre(d, 330 + col * 108, y, 64, 52)
    d.rectangle([318, 395, 530, 405], fill=(90, 90, 95))  # balcon du 2e
    for x in range(322, 530, 14):
        d.line([(x, 360), (x, 400)], fill=(90, 90, 95), width=3)
    d.rectangle([490, 560, 570, SOL], fill=(90, 70, 55))
    arbre(d, 200, SOL, 160, 60); arbre(d, 850, SOL, 140, 55)


# 2. M-0143 : grande maison avec jardin, garage et atelier
def m0143(d, rng):
    ciel(d, (110, 165, 220), (215, 232, 245)); nuages(d, rng, 2); sol(d, (96, 160, 80))
    d.polygon([(220, 330), (520, 170), (820, 330)], fill=(176, 92, 64))
    d.rectangle([250, 330, 790, SOL], fill=(243, 232, 210))
    for x in (290, 420, 640):
        fenetre(d, x, 380, 80, 70, volets=(70, 110, 140))
    fenetre(d, 290, 520, 80, 70, volets=(70, 110, 140))
    d.rectangle([500, 500, 580, SOL], fill=(120, 75, 50))
    d.rectangle([790, 400, 1010, SOL], fill=(225, 215, 195))  # garage
    d.polygon([(780, 400), (900, 340), (1020, 400)], fill=(160, 85, 60))
    d.rectangle([820, 470, 980, SOL], fill=(170, 170, 175))
    for y in range(480, SOL, 18):
        d.line([(820, y), (980, y)], fill=(140, 140, 145), width=2)
    for x in range(30, 1200, 26):  # clôture du jardin
        d.rectangle([x, 660, x + 12, 720], fill=(245, 245, 240))
    d.rectangle([0, 675, 1200, 683], fill=(245, 245, 240))
    arbre(d, 120, SOL, 200, 85); arbre(d, 1110, SOL, 180, 70, (60, 120, 70))
    for x in range(330, 760, 45):
        d.ellipse([x, 700, x + 18, 718], fill=rng.choice([(230, 90, 90), (245, 200, 70), (240, 240, 245)]))


# 3. M-0144 : petit immeuble étudiant, vélo, arrêt de bus
def m0144(d, rng):
    ciel(d, (140, 185, 230), (220, 235, 248)); nuages(d, rng, 2); sol(d, (165, 160, 155))
    d.rectangle([380, 300, 720, SOL], fill=(205, 120, 90))
    d.rectangle([370, 290, 730, 305], fill=(120, 70, 55))
    for etage in range(3):
        for col in range(3):
            fenetre(d, 410 + col * 105, 330 + etage * 95, 70, 60, cadre=(250, 250, 250))
    d.rectangle([520, 580, 580, SOL], fill=(60, 60, 70))
    d.text((485, 545), "RÉSIDENCE", font=police(20, True), fill=(250, 250, 250))
    # vélo
    for cx in (230, 310):
        d.ellipse([cx - 32, 590, cx + 32, 654], outline=(30, 30, 30), width=5)
    d.line([(230, 622), (270, 590), (310, 622), (230, 622)], fill=(200, 40, 40), width=5)
    d.line([(270, 590), (262, 570)], fill=(30, 30, 30), width=5)
    # arrêt de bus
    d.rectangle([880, 420, 890, SOL], fill=(60, 60, 60))
    d.rectangle([845, 390, 925, 440], fill=(30, 120, 60))
    d.text((862, 402), "BUS", font=police(24, True), fill="white")
    arbre(d, 1050, SOL, 170, 65)


# 4. M-0145 : résidence récente avec terrasse et commerces au pied
def m0145(d, rng):
    ciel(d, (100, 160, 225), (205, 228, 248)); nuages(d, rng, 3); sol(d, (190, 190, 185))
    d.rectangle([220, 200, 980, SOL], fill=(245, 245, 245))
    d.rectangle([220, 200, 980, 230], fill=(70, 75, 85))
    for etage in range(4):
        y = 250 + etage * 80
        for col in range(5):
            d.rectangle([250 + col * 145, y, 350 + col * 145, y + 60], fill=(110, 150, 180))
        d.rectangle([220, y + 62, 980, y + 70], fill=(200, 200, 205))
    d.rectangle([540, 410, 780, 470], fill=(225, 225, 228))  # terrasse
    for x in range(545, 780, 18):
        d.line([(x, 420), (x, 468)], fill=(120, 125, 130), width=2)
    d.rectangle([600, 405, 640, 418], fill=(90, 160, 90))
    d.rectangle([680, 400, 720, 418], fill=(90, 160, 90))
    d.rectangle([220, 570, 980, SOL], fill=(60, 60, 70))  # commerces
    for i, (nom, c) in enumerate([("BOULANGERIE", (200, 150, 70)), ("PHARMACIE", (40, 150, 90)), ("PRIMEUR", (210, 90, 60))]):
        x = 245 + i * 250
        d.rectangle([x, 580, x + 210, 610], fill=c)
        d.text((x + 15, 586), nom, font=police(18, True), fill="white")
        d.rectangle([x, 615, x + 210, SOL], fill=(170, 200, 220))
    arbre(d, 120, SOL, 150, 55); arbre(d, 1090, SOL, 150, 55)


# 5. M-0146 : pavillon sur sous-sol, jardin clos, rue calme
def m0146(d, rng):
    ciel(d, (125, 180, 230), (225, 238, 248)); nuages(d, rng, 2); sol(d, (110, 170, 90))
    d.rectangle([330, 520, 870, SOL], fill=(200, 195, 185))  # sous-sol
    d.rectangle([380, 550, 520, SOL], fill=(150, 150, 155))
    d.polygon([(300, 340), (600, 200), (900, 340)], fill=(70, 80, 95))  # toit ardoise
    d.rectangle([330, 340, 870, 520], fill=(236, 225, 200))
    for x in (380, 520, 700):
        fenetre(d, x, 385, 85, 75, volets=(190, 80, 70))
    d.rectangle([620, 430, 680, 520], fill=(110, 70, 45))
    d.polygon([(600, 520), (700, 520), (720, 600), (580, 600)], fill=(180, 175, 170))  # perron
    d.rectangle([0, 690, 1200, 800], fill=(80, 80, 85))  # rue
    for x in range(40, 1200, 160):
        d.rectangle([x, 742, x + 80, 750], fill=(240, 240, 240))
    for x in range(0, 1200, 30):  # haie et portail
        d.ellipse([x, 640, x + 44, 690], fill=(60, 120, 60))
    arbre(d, 1050, SOL, 220, 80); arbre(d, 150, SOL, 190, 70)


# 6. M-0148 : petit immeuble rénové, place de parking, centre-ville
def m0148(d, rng):
    ciel(d, (115, 170, 225), (210, 230, 248)); nuages(d, rng, 2); sol(d, (120, 120, 125))
    d.rectangle([140, 300, 420, SOL], fill=(210, 190, 170))  # voisin
    d.rectangle([780, 330, 1060, SOL], fill=(190, 200, 210))  # voisin
    d.rectangle([420, 230, 780, SOL], fill=(250, 248, 240))  # immeuble rénové
    d.polygon([(410, 230), (600, 150), (790, 230)], fill=(60, 65, 75))
    for etage in range(4):
        for col in range(3):
            fenetre(d, 455 + col * 110, 260 + etage * 90, 70, 62, cadre=(60, 60, 65), vitre=(150, 195, 225))
    d.rectangle([570, 580, 630, SOL], fill=(60, 60, 65))
    for x in range(160, 1060, 120):
        for y in (340, 440, 540):
            if not 420 <= x <= 780:
                fenetre(d, x + 20, y, 50, 50)
    d.rectangle([0, 660, 1200, 800], fill=(85, 85, 90))  # parking
    for x in range(250, 1000, 150):
        d.line([(x, 665), (x, 790)], fill=(240, 240, 240), width=4)
    d.text((395, 760), "P", font=police(30, True), fill=(240, 240, 240))
    voiture(d, 410, 745, (40, 90, 160))
    voiture(d, 700, 745, (200, 60, 50))


BIENS = [
    ("M-0142", "Appartement T3 lumineux proche RER · Massy", m0142),
    ("M-0143", "Maison familiale avec jardin · Palaiseau", m0143),
    ("M-0144", "Studio étudiant proche université · Orsay", m0144),
    ("M-0145", "T2 avec terrasse en résidence récente · Massy", m0145),
    ("M-0146", "Pavillon 4 pièces au calme · Igny", m0146),
    ("M-0148", "T3 refait à neuf avec parking · Longjumeau", m0148),
]

if __name__ == "__main__":
    SORTIE.mkdir(exist_ok=True)
    for i, (ref, legende, dessin) in enumerate(BIENS):
        img = Image.new("RGB", (W, H))
        d = ImageDraw.Draw(img)
        dessin(d, random.Random(14 + i))
        d.rectangle([0, 0, W, 90], fill=(255, 255, 255))
        d.text((24, 14), f"PHOTO FICTIVE · {ref}", font=police(34, True), fill=(25, 25, 25))
        d.text((24, 56), legende, font=police(22), fill=(60, 60, 60))
        d.rectangle([0, H - 40, W, H], fill=(255, 255, 255))
        d.text((24, H - 32), "Image générée pour le hackathon Ghost · aucun bien réel", font=police(20), fill=(70, 70, 70))
        img.save(SORTIE / f"{ref}.jpg", quality=88)
    print(f"{len(BIENS)} photos écrites dans {SORTIE}")
