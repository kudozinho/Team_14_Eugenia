import sys
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (SimpleDocTemplate, Paragraph, Spacer, Table,
                                TableStyle, PageBreak, KeepTogether)

OUT = sys.argv[1]
pdfmetrics.registerFont(TTFont("UI", r"C:\Windows\Fonts\segoeui.ttf"))
pdfmetrics.registerFont(TTFont("UIB", r"C:\Windows\Fonts\segoeuib.ttf"))
pdfmetrics.registerFont(TTFont("SYM", r"C:\Windows\Fonts\seguisym.ttf"))
from reportlab.pdfbase.pdfmetrics import registerFontFamily
registerFontFamily("UI", normal="UI", bold="UIB", italic="UI", boldItalic="UIB")

VERT = colors.HexColor("#1F5B45")
VERT_CLAIR = colors.HexColor("#E3EEE8")
ORANGE = colors.HexColor("#E07A2E")
ORANGE_CLAIR = colors.HexColor("#FCEBDD")
CREME = colors.HexColor("#FAF8F3")
ENCRE = colors.HexColor("#1D1D1B")
GRIS = colors.HexColor("#6B6B66")
TRAIT = colors.HexColor("#D9D6CC")
ROUGE_CLAIR = colors.HexColor("#F7E1DE")

W, H = A4
M = 18 * mm
CW = W - 2 * M

def st(name, **kw):
    base = dict(fontName="UI", fontSize=10, leading=14.5, textColor=ENCRE)
    base.update(kw)
    return ParagraphStyle(name, **base)

S = {
    "kicker": st("k", fontName="UIB", fontSize=8.5, textColor=ORANGE, leading=11),
    "h1": st("h1", fontName="UIB", fontSize=24, leading=29, textColor=VERT),
    "lead": st("lead", fontSize=12, leading=17.5, textColor=ENCRE),
    "h2": st("h2", fontName="UIB", fontSize=15, leading=19, textColor=VERT, spaceBefore=4, spaceAfter=6),
    "h3": st("h3", fontName="UIB", fontSize=11, leading=14, textColor=ENCRE, spaceAfter=3),
    "p": st("p"),
    "small": st("s", fontSize=8.5, leading=12, textColor=GRIS),
    "cell": st("c", fontSize=9.2, leading=13),
    "cellb": st("cb", fontName="UIB", fontSize=9.2, leading=13),
    "cellw": st("cw", fontName="UIB", fontSize=9.2, leading=13, textColor=colors.white),
    "step": st("step", fontName="UIB", fontSize=8.8, leading=11.5, alignment=1),
    "stepn": st("stepn", fontName="UIB", fontSize=15, leading=17, alignment=1, textColor=ORANGE),
    "steps": st("steps", fontSize=7.6, leading=10, alignment=1, textColor=GRIS),
    "box": st("box", fontName="UIB", fontSize=9, leading=12, alignment=1),
    "boxs": st("boxs", fontSize=7.6, leading=10, alignment=1, textColor=GRIS),
    "mock": st("mock", fontSize=8.6, leading=12),
    "mockb": st("mockb", fontName="UIB", fontSize=10.5, leading=14, textColor=VERT),
}

def P(t, s="p"):
    return Paragraph(t, S[s])

def bullets(items, s="p"):
    rows = [[Paragraph('<font name="UIB" color="#E07A2E">•</font>', S[s]), Paragraph(t, S[s])] for t in items]
    t = Table(rows, colWidths=[5 * mm, CW - 5 * mm])
    t.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                           ("LEFTPADDING", (0, 0), (-1, -1), 0),
                           ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 2.5),
                           ("TOPPADDING", (0, 0), (-1, -1), 0)]))
    return t

def callout(html, bg=ORANGE_CLAIR, bar=ORANGE):
    t = Table([[P(html)]], colWidths=[CW])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), bg),
                           ("LINEBEFORE", (0, 0), (0, -1), 3, bar),
                           ("LEFTPADDING", (0, 0), (-1, -1), 10),
                           ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                           ("TOPPADDING", (0, 0), (-1, -1), 8),
                           ("BOTTOMPADDING", (0, 0), (-1, -1), 8)]))
    return t

def grid(data, widths, head=True, zebra=True):
    t = Table(data, colWidths=widths, repeatRows=1 if head else 0)
    style = [("VALIGN", (0, 0), (-1, -1), "TOP"),
             ("LEFTPADDING", (0, 0), (-1, -1), 6), ("RIGHTPADDING", (0, 0), (-1, -1), 6),
             ("TOPPADDING", (0, 0), (-1, -1), 5), ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
             ("LINEBELOW", (0, 0), (-1, -1), 0.5, TRAIT)]
    if head:
        style += [("BACKGROUND", (0, 0), (-1, 0), VERT)]
    if zebra:
        for i in range(1 if head else 0, len(data)):
            if i % 2 == 0:
                style.append(("BACKGROUND", (0, i), (-1, i), CREME))
    t.setStyle(TableStyle(style))
    return t

def flow(cells, widths, arrow_w=5 * mm, bg=VERT_CLAIR, height=None):
    row, cw = [], []
    for i, c in enumerate(cells):
        row.append(c)
        cw.append(widths)
        if i < len(cells) - 1:
            row.append(Paragraph('<font name="SYM" color="#E07A2E" size="13">→</font>', S["step"]))
            cw.append(arrow_w)
    t = Table([row], colWidths=cw, rowHeights=[height] if height else None)
    style = [("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
             ("LEFTPADDING", (0, 0), (-1, -1), 3), ("RIGHTPADDING", (0, 0), (-1, -1), 3),
             ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]
    for i in range(0, len(row), 2):
        style += [("BACKGROUND", (i, 0), (i, 0), bg), ("BOX", (i, 0), (i, 0), 0.6, VERT)]
    t.setStyle(TableStyle(style))
    return t

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(CREME)
    canvas.rect(0, 0, W, H, stroke=0, fill=1)
    canvas.setFillColor(VERT)
    canvas.rect(0, H - 6, W, 6, stroke=0, fill=1)
    canvas.setFont("UI", 7.5)
    canvas.setFillColor(GRIS)
    canvas.drawString(M, 10 * mm, "Ghost · Team 14 Eugenia · Pivot agent H · 19 novembre 2026")
    canvas.drawRightString(W - M, 10 * mm, f"{doc.page}")
    canvas.restoreState()

story = []

# ---------------- PAGE 1 ----------------
story += [P("NOTE D'ÉQUIPE · CTO", "kicker"), Spacer(1, 4),
          P("Ce qui change avec l'agent H", "h1"), Spacer(1, 6),
          P("<b>En une phrase :</b> Ghost ne change pas de métier, mais on montre maintenant "
            "l'agent H <b>en premier</b>, et il doit pouvoir travailler <b>tout seul</b>, depuis le site "
            "public, <b>même quand le PC d'Henriquet est éteint</b>.", "lead"),
          Spacer(1, 12)]

story += [P("Pourquoi on pivote", "h2"),
          bullets(["Le jury a ouvert le lien public et n'a pas pu déclencher H : l'agent dépendait d'un "
                   "programme (le « listener ») qui tourne sur le PC d'Henriquet.",
                   "Conclusion : la démonstration la plus forte, H qui publie vraiment une annonce sur trois "
                   "portails, n'était pas visible par celui qui la juge.",
                   "Contrainte confirmée par Assel : <b>zéro abonnement, zéro dépense, zéro recharge</b> de "
                   "crédits H."]),
          Spacer(1, 10)]

story += [P("Avant / après", "h2")]
rows = [[P("", "cellw"), P("Avant", "cellw"), P("Maintenant", "cellw")]]
for a, b, c in [
    ("Qui lance H ?", "Le PC d'Henriquet, allumé, avec le listener", "Le site public, depuis n'importe quel appareil"),
    ("Où tourne l'agent ?", "En local", "Sur un service gratuit dans le cloud (Render Free)"),
    ("Ce qu'on montre en premier", "Le diagnostic, puis H", "H en action dès l'accueil, puis le diagnostic qui explique ses consignes"),
    ("Si le service manque", "Un lancement simulé pouvait s'afficher", "Plus aucune simulation : un succès vérifié ou un échec clair"),
    ("Disponibilité", "Tant que le PC est allumé", "Toujours lançable ; environ 1 min de réveil après 15 min d'inactivité"),
]:
    rows.append([P(a, "cellb"), P(b, "cell"), P(c, "cell")])
story += [grid(rows, [36 * mm, (CW - 36 * mm) / 2, (CW - 36 * mm) / 2]), Spacer(1, 10)]

story += [P("Ce qui ne change pas", "h2"),
          bullets(["Le parcours Ghost : <b>observation consentie</b> du poste (le Recorder reste installé), "
                   "puis <b>diagnostic</b>, puis <b>automatisation</b>.",
                   "La répartition des outils : <b>H</b> pour les interfaces sans API, <b>n8n</b> pour celles qui en ont une.",
                   "Supabase reste la source de vérité, et le rapport en ligne garde ses chiffres : "
                   "score 66/100, 4 min 04 à la main, <b>1 min 53</b> pour l'agent (médiane de 3 essais vérifiés).",
                   "Le portail « Mon audit » et la connexion par e-mail, déjà en ligne."])]

story.append(PageBreak())

# ---------------- PAGE 2 ----------------
story += [P("L'EXPÉRIENCE", "kicker"), Spacer(1, 4),
          P("Le nouveau parcours utilisateur", "h1"), Spacer(1, 6),
          P("Le client ou le jury arrive sur le site, sans rien installer. En quelques clics, il "
            "confie une vraie tâche à H et voit le résultat <b>prouvé</b>.", "lead"), Spacer(1, 12)]

def step(n, title, sub):
    return [P(str(n), "stepn"), P(title, "step"), P(sub, "steps")]

def stepcell(n, title, sub):
    t = Table([[x] for x in step(n, title, sub)], colWidths=[None])
    t.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                           ("TOPPADDING", (0, 0), (-1, -1), 1), ("BOTTOMPADDING", (0, 0), (-1, -1), 1)]))
    return t

sw = (CW - 3 * 5 * mm) / 4
story += [flow([stepcell(1, "Accueil", "Bouton « Voir l'agent H en action »"),
                stepcell(2, "Page Agent H", "Le mandat : un bien, trois portails A, B, C"),
                stepcell(3, "Lancer", "Avec le code de démo ; le service se prépare"),
                stepcell(4, "Suivre", "Cinq étapes affichées en direct")], sw, height=30 * mm),
          Spacer(1, 6),
          flow([stepcell(5, "Résultat prouvé", "Session H, durée, portails cochés après contrôle"),
                stepcell(6, "Comprendre", "Le rapport : d'où viennent les consignes, le gain de temps"),
                stepcell(7, "Passer à l'action", "Ghost propose l'automatisation pour son propre poste")],
               (CW - 2 * 5 * mm) / 3, bg=ORANGE_CLAIR, height=30 * mm),
          Spacer(1, 14)]

story += [P("À quoi ressemble l'écran Agent H", "h2")]

def pill(txt, on):
    t = Table([[P(txt, "steps" if not on else "step")]], colWidths=[(CW - 24) / 5 - 2])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), VERT if on else colors.white),
                           ("TEXTCOLOR", (0, 0), (-1, -1), colors.white),
                           ("BOX", (0, 0), (-1, -1), 0.6, VERT),
                           ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
    return t

pill_on = ParagraphStyle("pon", parent=S["step"], textColor=colors.white)
def pill2(txt, state):
    color = {"done": VERT, "now": ORANGE, "todo": colors.white}[state]
    style = pill_on if state != "todo" else S["steps"]
    t = Table([[Paragraph(txt, style)]], colWidths=[(CW - 24) / 5 - 3])
    t.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), color),
                           ("BOX", (0, 0), (-1, -1), 0.6, VERT if state != "now" else ORANGE),
                           ("TOPPADDING", (0, 0), (-1, -1), 4), ("BOTTOMPADDING", (0, 0), (-1, -1), 4)]))
    return t

stepper = Table([[pill2("1 · Demande reçue", "done"), pill2("2 · Attente du service", "done"),
                  pill2("3 · Agent en cours", "now"), pill2("4 · Vérification", "todo"),
                  pill2("5 · Terminé", "todo")]])
stepper.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 1.5), ("RIGHTPADDING", (0, 0), (-1, -1), 1.5)]))

portails = Table([[P('<font name="SYM" color="#1F5B45">✓</font> Portail A', "mock"),
                   P('<font name="SYM" color="#1F5B45">✓</font> Portail B', "mock"),
                   P('<font color="#6B6B66">… Portail C (en cours)</font>', "mock")]],
                 colWidths=[(CW - 24) / 3] * 3)
mock = Table([[P("Confiez la tâche à l'agent H", "mockb")],
              [P("Un mandat, trois portails. Identifiant de la demande : <b>exec_…</b>  ·  "
                 "Service : <font color='#E07A2E'><b>réveillé</b></font>", "mock")],
              [stepper],
              [portails],
              [P("<font color='#6B6B66'>Un portail n'est coché qu'après contrôle réel de l'annonce "
                 "(titre, prix, photo exacte). « Terminé mais non vérifié », « échec » et « crédits "
                 "insuffisants » s'affichent tels quels, jamais comme un succès.</font>", "mock")]],
             colWidths=[CW - 12])
mock.setStyle(TableStyle([("BACKGROUND", (0, 0), (-1, -1), colors.white),
                          ("BOX", (0, 0), (-1, -1), 0.8, TRAIT),
                          ("LINEABOVE", (0, 0), (-1, 0), 4, VERT),
                          ("LEFTPADDING", (0, 0), (-1, -1), 10), ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                          ("TOPPADDING", (0, 0), (-1, -1), 6), ("BOTTOMPADDING", (0, 0), (-1, -1), 6)]))
story += [mock, Spacer(1, 12)]

story += [P("Ce que voit l'utilisateur dans chaque cas", "h2")]
rows = [[P("Situation", "cellw"), P("Message affiché", "cellw")]]
for a, b in [
    ("Le service dormait", "« Le service se réveille… » (environ une minute), puis la demande démarre seule"),
    ("Une autre exécution tourne", "« Une exécution est déjà en cours » : on attend, rien n'est lancé en double"),
    ("Crédits H non confirmés", "« Crédits insuffisants ou non confirmés » : aucun lancement, aucune recharge"),
    ("Réussite", "Session H, durée, et les trois portails cochés après contrôle des annonces"),
    ("Annonce absente ou fausse", "« Échec » avec la raison précise, jamais un faux succès"),
    ("Le navigateur a coupé", "La même demande est retrouvée à la reconnexion, sans en créer une seconde"),
]:
    rows.append([P(a, "cellb"), P(b, "cell")])
story += [grid(rows, [48 * mm, CW - 48 * mm])]

story.append(PageBreak())

# ---------------- PAGE 3 ----------------
story += [P("SOUS LE CAPOT", "kicker"), Spacer(1, 4),
          P("Un agent qui tourne tout seul", "h1"), Spacer(1, 6),
          P("Personne n'a besoin d'allumer un PC ni de surveiller quoi que ce soit. Un clic sur le site "
            "suffit : le reste s'enchaîne automatiquement et s'arrête proprement.", "lead"), Spacer(1, 12)]

def box(t, s):
    return [P(t, "box"), P(s, "boxs")]

def boxcell(t, s):
    tb = Table([[x] for x in box(t, s)])
    tb.setStyle(TableStyle([("LEFTPADDING", (0, 0), (-1, -1), 0), ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                            ("TOPPADDING", (0, 0), (-1, -1), 1), ("BOTTOMPADDING", (0, 0), (-1, -1), 1)]))
    return tb

bw = (CW - 4 * 5 * mm) / 5
story += [flow([boxcell("Site Ghost", "Vercel · bouton Lancer"),
                boxcell("API protégée", "Code de démo, secrets cachés"),
                boxcell("Service agent", "Render Free · Python"),
                boxcell("Agent H", "Navigateur distant"),
                boxcell("Portails A, B, C", "Annonces publiées")], bw, height=24 * mm),
          Spacer(1, 5),
          callout("<b>Supabase</b> garde la mémoire de chaque demande : son état, sa preuve et son résultat. "
                  "Le site relit cette même ligne, donc ce qu'il affiche est toujours ce qui s'est vraiment passé.",
                  bg=VERT_CLAIR, bar=VERT),
          Spacer(1, 12)]

story += [P("Les règles qui le rendent autonome et fiable", "h2")]
rows = [[P("Règle", "cellw"), P("Ce que ça garantit", "cellw")]]
for a, b in [
    ("Réveil automatique", "Un service endormi n'est plus refusé : la demande attend, le service se réveille et la prend"),
    ("Une seule prise par demande", "Deux clics ou deux appels simultanés ne lancent jamais deux sessions H"),
    ("Une exécution à la fois", "Pas de conflit sur les portails, pas de crédits brûlés en double"),
    ("Clé de demande", "Si la connexion coupe, on retrouve la même demande au lieu d'en recréer une"),
    ("Durée bornée", "Chaque exécution a un délai maximum : rien ne tourne indéfiniment"),
    ("Vérification par le serveur", "Le succès vient du contrôle réel des annonces, jamais de ce que H déclare"),
    ("Garde-fou crédits", "Le solde H est lu avant chaque lancement ; s'il manque ou n'est pas confirmé, on refuse"),
    ("Aucune relance aveugle", "Après une panne, la demande passe en « interrompue, à inspecter » : pas de doublon d'annonces, pas de purge"),
]:
    rows.append([P(a, "cellb"), P(b, "cell")])
story += [grid(rows, [48 * mm, CW - 48 * mm]), Spacer(1, 12)]

story += [P("Et efficace", "h2"),
          bullets(["<b>1 min 53</b> contre <b>4 min 04</b> à la main pour publier le même bien sur trois portails "
                   "(médiane de 3 essais vérifiés, sur 4 essais).",
                   "Des consignes exactes : titre épelé lettre par lettre (fini « Apartment »), photo du mandat "
                   "contrôlée par empreinte.",
                   "<b>Proposition :</b> réveiller le service dès que la page Agent H s'ouvre, pour que la "
                   "minute de réveil soit déjà écoulée au moment du clic."])]

story.append(PageBreak())

# ---------------- PAGE 4 ----------------
story += [P("ORGANISATION", "kicker"), Spacer(1, 4),
          P("Qui fait quoi, et où on en est", "h1"), Spacer(1, 12)]

rows = [[P("Qui", "cellw"), P("Rôle dans le pivot", "cellw"), P("État", "cellw")]]
for a, b, c in [
    ("Alejandro (CTO)", "Transformer l'agent en service web gratuit, migration de réveil et de clé de demande, garde-fou crédits, photo exacte (#63)", "À faire"),
    ("Binta (CPO)", "Page Agent H, bouton sur l'accueil, suivi en cinq étapes, envoi de la clé de demande", "Écran prêt, clé à pousser"),
    ("Henriquet (CDO)", "Relire et appliquer la migration, session H réelle, vérifier qu'aucune table n'est lisible par un compte connecté", "Première migration appliquée"),
    ("Vladimir (CAO)", "Variables Vercel et redéploiement, recette avec le PC d'Henriquet éteint", "Variables faites, recette à faire"),
    ("Omar (CAIO)", "Consignes et provenance de la tâche, contrôle des données", "Consignes validées"),
    ("Assel (CEO)", "Cap et arbitrages, revue avant fusion", "Cible fixée : Render Free"),
]:
    rows.append([P(a, "cellb"), P(b, "cell"), P(c, "cell")])
story += [grid(rows, [34 * mm, CW - 34 * mm - 38 * mm, 38 * mm]), Spacer(1, 14)]

story += [P("Les étapes jusqu'à la démo", "h2")]
etapes = [("1", "Adapter le service et la migration", "Alejandro, relu avec Henriquet"),
          ("2", "Raccorder le site", "Binta et Alejandro"),
          ("3", "Revue et fusion", "Assel"),
          ("4", "Recette PC éteint", "Vladimir et Henriquet, depuis un autre appareil")]
ew = (CW - 3 * 5 * mm) / 4
story += [flow([stepcell(n, t, s) for n, t, s in etapes], ew, height=26 * mm), Spacer(1, 14)]

story += [P("Le critère de réussite, commun à tous", "h2"),
          callout("Un clic autorisé → <b>une seule</b> demande → une <b>vraie</b> session H → des annonces "
                  "créées après ce clic et <b>vérifiées</b> → le résultat sur le site. Testé depuis un autre "
                  "appareil, <b>PC d'Henriquet éteint</b>. Aucun succès simulé.", bg=VERT_CLAIR, bar=VERT),
          Spacer(1, 12),
          P("Statut honnête aujourd'hui", "h2"),
          callout("Le site en ligne fonctionne encore avec l'ancien chemin local. La PR #66 (agent hébergé) "
                  "n'est pas fusionnée et le service gratuit n'est pas encore déployé. Le parcours complet "
                  "dans le cloud n'a donc pas encore été testé : <b>on ne l'annonce pas comme fonctionnel "
                  "avant la recette</b>."),
          Spacer(1, 10),
          P("Rappel : aucun secret (clés, codes, jetons) ne circule par mail ni dans Git.", "small")]

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=M, rightMargin=M, topMargin=16 * mm,
                        bottomMargin=18 * mm, title="Ghost : ce qui change avec l'agent H",
                        author="Alejandro, CTO Team 14")
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print("ok")
