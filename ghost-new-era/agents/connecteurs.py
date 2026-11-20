"""Connecteurs Notion, Slack, Gmail. Chaque fonction renvoie (ok, détail) et ne lève jamais d'exception ; (None, « non connecté ») sans accès.

Les accès sont ceux de LA PERSONNE qui lance l'onboarding (lus dans le coffre-fort H, via le contexte). Les variables d'environnement
ne servent que de repli pour des essais en ligne de commande.
  Notion : {"token", "page"}      Slack : {"webhook"} (ou SLACK_BOT_TOKEN + SLACK_CHANNEL)      Gmail : {"adresse", "mot_de_passe", "destinataire"}
"""
import json
import os
import smtplib
import ssl
import urllib.request
from email.message import EmailMessage

import certifi

import contexte
from contexte import autorise  # noqa: F401

CTX = ssl.create_default_context(cafile=certifi.where())
CHAMPS = {"notion": ("token", "page"), "slack": ("webhook",), "gmail": ("adresse", "mot_de_passe", "destinataire")}


def _http(url, corps, entetes):
    req = urllib.request.Request(url, data=json.dumps(corps).encode(), headers={"Content-Type": "application/json; charset=utf-8", **entetes}, method="POST")
    with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
        t = r.read().decode()
        try:
            return json.loads(t)
        except ValueError:
            return {"ok": t.strip() == "ok", "brut": t[:80]}


def notion_id(valeur):
    """Accepte un identifiant ou le LIEN d'une page Notion (les 32 derniers caractères hexadécimaux)."""
    v = (valeur or "").split("?")[0].rstrip("/").replace("-", "")
    return v[-32:] if len(v) >= 32 else v


def cfg(nom):
    """Accès de la personne (contexte), sinon variables d'environnement (essais locaux), sinon None."""
    apps = getattr(contexte.CONTEXTE, "apps", None)
    if apps is not None:
        c = apps.get(nom)
        return c if c and all(c.get(k) for k in CHAMPS[nom]) else None
    e = os.environ
    if nom == "notion" and e.get("NOTION_TOKEN") and e.get("NOTION_PARENT_PAGE_ID"):
        return {"token": e["NOTION_TOKEN"], "page": e["NOTION_PARENT_PAGE_ID"]}
    if nom == "slack" and e.get("SLACK_WEBHOOK_URL"):
        return {"webhook": e["SLACK_WEBHOOK_URL"]}
    if nom == "gmail" and e.get("GMAIL_ADDRESS") and e.get("GMAIL_APP_PASSWORD") and e.get("NEW_HIRE_EMAIL"):
        return {"adresse": e["GMAIL_ADDRESS"], "mot_de_passe": e["GMAIL_APP_PASSWORD"], "destinataire": e["NEW_HIRE_EMAIL"]}
    return None


def configure(nom):
    return cfg(nom) is not None


def _slack(c, texte):
    r = _http(c["webhook"], {"text": texte}, {})
    return (True, "message publié") if r.get("ok") else (False, f"Slack a refusé : {r.get('brut') or r.get('error')}")


def slack_bienvenue(p, manager_nom=None, c=None):
    c = c or cfg("slack")
    if not c:
        return None, "Slack non connecté"
    try:
        return _slack(c, f"Bienvenue à {p['prenom']} {p['nom']}, qui rejoint l'équipe {p['equipe']} comme {p['poste']}"
                         + (f" (manager : {manager_nom})" if manager_nom else "") + ". Préparé par Ghost : accès, badge, parrain et wiki sont prêts.")
    except Exception as e:  # noqa: BLE001
        return False, f"Slack : {type(e).__name__}"


def _smtp(c):
    s = smtplib.SMTP_SSL("smtp.gmail.com", 465, context=CTX, timeout=30)
    s.login(c["adresse"], c["mot_de_passe"])
    return s


def gmail_bienvenue(p, manager_nom=None, c=None):
    c = c or cfg("gmail")
    if not c:
        return None, "Gmail non connecté"
    try:
        m = EmailMessage()
        m["Subject"], m["From"], m["To"] = f"Bienvenue chez Atelier Nova, {p['prenom']} !", c["adresse"], c["destinataire"]
        m.set_content(f"Bonjour {p['prenom']},\n\nBienvenue dans l'équipe {p['equipe']}. Ton accès, ton badge et ta page d'accueil dans le wiki sont prêts"
                      + (f", et {manager_nom} est ton manager" if manager_nom else "") + ".\n\nÀ très vite,\nGhost, pour l'équipe RH (message de démonstration)")
        with _smtp(c) as s:
            s.send_message(m)
        return True, "e-mail accepté par Gmail"
    except Exception as e:  # noqa: BLE001
        return False, f"Gmail : {type(e).__name__}"


def _notion_get(c, chemin):
    req = urllib.request.Request(f"https://api.notion.com/v1/{chemin}", headers={"Authorization": f"Bearer {c['token']}", "Notion-Version": "2022-06-28"})
    with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
        return json.load(r)


def notion_lire(max_car=700, c=None):
    c = c or cfg("notion")
    if not c:
        return None, "Notion non connecté"
    try:
        d = _notion_get(c, f"blocks/{notion_id(c['page'])}/children?page_size=50")
        textes = []
        for b in d.get("results", []):
            x = "".join(t.get("plain_text", "") for t in ((b.get(b.get("type")) or {}).get("rich_text") or [])).strip()
            if x:
                textes.append(x)
        txt = " | ".join(textes)[:max_car]
        return (True, txt) if txt else (False, "page vide ou non partagée avec l'intégration")
    except Exception as e:  # noqa: BLE001
        return False, f"Notion : {type(e).__name__}"


def notion_page(p, titres_pages=None, c=None):
    c = c or cfg("notion")
    if not c:
        return None, "Notion non connecté"
    try:
        def t(txt):
            return [{"type": "text", "text": {"content": txt}}]
        blocs = [{"object": "block", "type": "paragraph", "paragraph": {"rich_text": t(f"{p['prenom']} {p['nom']} · {p['poste']} · équipe {p['equipe']}. Page préparée par Ghost.")}}]
        if titres_pages:
            blocs.append({"object": "block", "type": "heading_2", "heading_2": {"rich_text": t("À lire en premier")}})
            blocs += [{"object": "block", "type": "bulleted_list_item", "bulleted_list_item": {"rich_text": t(x)}} for x in titres_pages]
        blocs.append({"object": "block", "type": "heading_2", "heading_2": {"rich_text": t("Checklist")}})
        for x in ["Jour 1 : récupérer son badge et son ordinateur", "Semaine 1 : rencontrer son parrain", "Mois 1 : point d'étape avec son manager"]:
            blocs.append({"object": "block", "type": "to_do", "to_do": {"rich_text": t(x), "checked": False}})
        r = _http("https://api.notion.com/v1/pages", {"parent": {"page_id": notion_id(c["page"])}, "properties": {"title": {"title": t(f"Onboarding de {p['prenom']} {p['nom']}")}}, "children": blocs},
                  {"Authorization": f"Bearer {c['token']}", "Notion-Version": "2022-06-28"})
        return (True, "page créée") if r.get("id") else (False, "Notion : réponse inattendue")
    except Exception as e:  # noqa: BLE001
        return False, f"Notion : {type(e).__name__}"


def tester(app, valeurs):
    """Vérifie un accès avant de l'enregistrer : Notion (lecture de la page), Slack (message de confirmation), Gmail (connexion sans envoi)."""
    try:
        if app == "notion":
            d = _notion_get(valeurs, f"blocks/{notion_id(valeurs['page'])}/children?page_size=1")
            return True, "page Notion lue" if d.get("results") is not None else "réponse inattendue"
        if app == "slack":
            if not str(valeurs["webhook"]).startswith("https://hooks.slack.com/"):
                return False, "L'adresse doit commencer par https://hooks.slack.com/"
            return _slack(valeurs, "Ghost est connecté à ce canal. Il y publiera les messages de bienvenue.")
        if app == "gmail":
            with _smtp(valeurs):
                pass
            return True, "connexion à Gmail réussie"
    except Exception as e:  # noqa: BLE001
        return False, f"{type(e).__name__} : vérifie l'accès (" + ("la page doit être partagée avec l'intégration" if app == "notion" else "identifiants refusés") + ")"
    return False, "application inconnue"
