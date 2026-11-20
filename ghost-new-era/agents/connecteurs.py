"""Connecteurs réels : Slack, Gmail, Notion. Chaque fonction renvoie (ok, détail) et ne lève jamais d'exception.
Les accès viennent UNIQUEMENT de variables d'environnement (jamais dans le dépôt). Sans accès : (None, « non configuré »).

  Slack  : SLACK_BOT_TOKEN (xoxb-...), SLACK_CHANNEL (identifiant du canal, ex. C0123ABCD)
  Gmail  : GMAIL_ADDRESS, GMAIL_APP_PASSWORD (mot de passe d'application), NEW_HIRE_EMAIL (destinataire de l'e-mail de bienvenue)
  Notion : NOTION_TOKEN (secret de l'intégration), NOTION_PARENT_PAGE_ID (page partagée avec l'intégration)
"""
import json
import os
import smtplib
import ssl
import urllib.request
from email.message import EmailMessage

import certifi

from contexte import autorise  # noqa: F401

CTX = ssl.create_default_context(cafile=certifi.where())


def _http(url, corps, entetes):
    req = urllib.request.Request(url, data=json.dumps(corps).encode(), headers={"Content-Type": "application/json; charset=utf-8", **entetes}, method="POST")
    with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
        return json.load(r)


def notion_id():
    """Accepte un identifiant ou le LIEN d'une page Notion (les 32 derniers caractères hexadécimaux du lien)."""
    v = os.environ.get("NOTION_PARENT_PAGE_ID", "").split("?")[0].rstrip("/").replace("-", "")
    return v[-32:] if len(v) >= 32 else v


def configure(nom):
    cles = {"slack": ["SLACK_BOT_TOKEN", "SLACK_CHANNEL"], "gmail": ["GMAIL_ADDRESS", "GMAIL_APP_PASSWORD", "NEW_HIRE_EMAIL"], "notion": ["NOTION_TOKEN", "NOTION_PARENT_PAGE_ID"]}[nom]
    return all(os.environ.get(c) for c in cles)


def slack_bienvenue(p, manager_nom=None):
    if not configure("slack"):
        return None, "Slack non configuré"
    try:
        texte = (f"Bienvenue à {p['prenom']} {p['nom']}, qui rejoint l'équipe {p['equipe']} comme {p['poste']}"
                 + (f" (manager : {manager_nom})" if manager_nom else "") + ". Préparé par Ghost : accès, badge, parrain et wiki sont prêts.")
        r = _http("https://slack.com/api/chat.postMessage", {"channel": os.environ["SLACK_CHANNEL"], "text": texte},
                  {"Authorization": f"Bearer {os.environ['SLACK_BOT_TOKEN']}"})
        return (True, f"message publié (ts {r.get('ts')})") if r.get("ok") else (False, f"Slack : {r.get('error')}")
    except Exception as e:  # noqa: BLE001
        return False, f"Slack : {type(e).__name__}"


def gmail_bienvenue(p, manager_nom=None):
    if not configure("gmail"):
        return None, "Gmail non configuré"
    try:
        m = EmailMessage()
        m["Subject"] = f"Bienvenue chez Atelier Nova, {p['prenom']} !"
        m["From"] = os.environ["GMAIL_ADDRESS"]
        m["To"] = os.environ["NEW_HIRE_EMAIL"]
        m.set_content(f"Bonjour {p['prenom']},\n\nBienvenue dans l'équipe {p['equipe']}. Ton accès, ton badge et ta page d'accueil dans le wiki sont prêts"
                      + (f", et {manager_nom} est ton manager" if manager_nom else "") + ".\n\nÀ très vite,\nGhost, pour l'équipe RH (message de démonstration)")
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, context=CTX, timeout=30) as s:
            s.login(os.environ["GMAIL_ADDRESS"], os.environ["GMAIL_APP_PASSWORD"])
            s.send_message(m)
        return True, "e-mail accepté par Gmail"
    except Exception as e:  # noqa: BLE001
        return False, f"Gmail : {type(e).__name__}"


def notion_page(p, titres_pages=None):
    if not configure("notion"):
        return None, "Notion non configuré"
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
        r = _http("https://api.notion.com/v1/pages",
                  {"parent": {"page_id": notion_id()}, "properties": {"title": {"title": t(f"Onboarding de {p['prenom']} {p['nom']}")}}, "children": blocs},
                  {"Authorization": f"Bearer {os.environ['NOTION_TOKEN']}", "Notion-Version": "2022-06-28"})
        return (True, "page créée") if r.get("id") else (False, "Notion : réponse inattendue")
    except Exception as e:  # noqa: BLE001
        return False, f"Notion : {type(e).__name__}"


def notion_lire(max_car=700):
    """Lit le texte de la page Notion partagée avec l'intégration (titres, paragraphes, listes). Renvoie (ok, texte ou détail)."""
    if not configure("notion"):
        return None, "Notion non configuré"
    try:
        req = urllib.request.Request(f"https://api.notion.com/v1/blocks/{notion_id()}/children?page_size=50",
                                     headers={"Authorization": f"Bearer {os.environ['NOTION_TOKEN']}", "Notion-Version": "2022-06-28"})
        with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
            d = json.load(r)
        textes = []
        for b in d.get("results", []):
            rt = (b.get(b.get("type")) or {}).get("rich_text") or []
            x = "".join(t.get("plain_text", "") for t in rt).strip()
            if x:
                textes.append(x)
        txt = " | ".join(textes)[:max_car]
        return (True, txt) if txt else (False, "page Notion vide ou non partagée avec l'intégration")
    except Exception as e:  # noqa: BLE001
        return False, f"Notion : {type(e).__name__}"
