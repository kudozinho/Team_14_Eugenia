"""Agent Équipe : accueille une personne dans la messagerie d'Atelier Nova.

Phase 1 : message de bienvenue dans le canal de l'équipe + annonce dans « # accueil ».
Phase 2 : demande de parrain au MANAGER, et créneau pour le café d'accueil. Le manager vient de la réponse humaine
donnée à l'Agent Accès : l'agent attend qu'elle existe, il n'invente rien.
Chaque action est vérifiée dans la base (vue v_onboarding : canal, message, parrain, café).
"""
import os
import sys
import time
import urllib.parse
from datetime import datetime, timedelta

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import commun as c  # noqa: E402
from commun import evenement, lire  # noqa: E402
import connecteurs  # noqa: E402

ATTENTE_MANAGER_S = 600
AGENT_H = os.environ.get("AGENT_EQUIPE", "ghost-equipe")


def _manager(p, manager_nom):
    """Renvoie {id, nom}. Si le manager n'est pas fourni, attend qu'il soit renseigné dans la fiche RH (réponse humaine)."""
    limite = time.monotonic() + ATTENTE_MANAGER_S
    while True:
        if manager_nom:
            parts = manager_nom.split(" ", 1)
            r = lire(f"personnes?prenom=eq.{urllib.parse.quote(parts[0])}&nom=eq.{urllib.parse.quote(parts[-1])}&select=id,prenom,nom")
        else:
            f = lire(f"rh_fiches?personne_id=eq.{urllib.parse.quote(p['id'])}&select=manager_id")
            r = lire(f"personnes?id=eq.{f[0]['manager_id']}&select=id,prenom,nom") if f and f[0]["manager_id"] else []
        if r:
            return {"id": r[0]["id"], "nom": f"{r[0]['prenom']} {r[0]['nom']}"}
        if time.monotonic() > limite:
            return None
        time.sleep(3)


def executer(client, personne_id, proposition_id=None, manager=None):
    p = c.personne(personne_id)
    debut = time.monotonic()
    run = c.creer_run("equipe", p, proposition_id)
    evenement(run, f"Agent Équipe : accueil de {p['prenom']} {p['nom']}", "en_cours", outil="Messagerie")
    canal = p["equipe"].lower()
    ok1 = ok2 = False
    try:
        arrivee = datetime.fromisoformat(p["date_arrivee"]) if p.get("date_arrivee") else datetime.now() + timedelta(days=3)
        c1 = f"""Tu es l'assistant de l'équipe d'accueil d'Atelier Nova. Tu es dans la messagerie. Accueille {p['prenom']} {p['nom']} ({p['poste']}, équipe {p['equipe']}), qui arrive le {arrivee.strftime('%d/%m/%Y')}.
1. Ouvre le canal « # {canal} ». Dans « Écrire un message », laisse l'auteur tel quel, écris : « Bienvenue {p['prenom']} dans l'équipe {p['equipe']} ! Nous sommes ravis de t'accueillir. » puis clique « Publier le message ».
2. Ouvre le canal « # accueil ». Écris : « {p['prenom']} {p['nom']} arrive le {arrivee.strftime('%d/%m/%Y')} comme {p['poste']} dans l'équipe {p['equipe']}. Faites-lui bon accueil ! » puis clique « Publier le message ».
Ne sors pas de la messagerie. Ne modifie rien d'autre. Réponds statut=termine avec un résumé court, ou statut=echec si tu es bloqué."""
        fin, _ = c.passage(client, run, p, c1, "/intranet/messagerie", {"canal": "Message de bienvenue dans le canal de l'équipe", "message": "Annonce dans # accueil"}, 30, 180, AGENT_H)
        ok1 = bool(c.preuve(p["id"]).get("canal")) and bool(c.preuve(p["id"]).get("message"))

        evenement(run, "Attente du manager", "en_cours", "la demande de parrain part au manager : réponse humaine attendue dans l'espace RH", outil="Messagerie")
        m = _manager(p, manager)
        if not m:
            evenement(run, "Manager introuvable", "echec", outil="Messagerie")
        else:
            cafe = (arrivee + timedelta(days=1)).replace(hour=10, minute=0)
            c2 = f"""Tu es l'assistant de l'équipe d'accueil d'Atelier Nova. Tu es dans la messagerie. Ouvre « Demandes » (parrain et café d'accueil).
1. Section « Demander un parrain » : « Personne qui arrive » = {p['prenom']} {p['nom']} ; « Envoyer la demande à » = {m['nom']} ; clique « Envoyer la demande de parrain ».
2. Section « Proposer un café d'accueil » : « Personne qui arrive » = {p['prenom']} {p['nom']} ; « Inviter » = Toute l'équipe ; « Créneau » = le {cafe.strftime('%d/%m/%Y')} à 10:00 (saisis la date puis l'heure dans le champ) ; clique « Proposer le café ».
Ne sors pas de la messagerie. Réponds statut=termine avec un résumé court, ou statut=echec si tu es bloqué."""
            fin, _ = c.passage(client, run, p, c2, "/intranet/messagerie/demandes", {"parrain": f"Demande de parrain envoyée à {m['nom']}", "cafe": "Café d'accueil proposé"}, 30, 180, AGENT_H)
            ok2 = bool(c.preuve(p["id"]).get("parrain")) and bool(c.preuve(p["id"]).get("cafe"))
    except Exception as e:  # noqa: BLE001
        evenement(run, "Erreur de l'agent", "echec", f"{type(e).__name__}: {str(e)[:200]}", outil="Messagerie")
    mgr_nom = None
    try:
        f = lire(f"rh_fiches?personne_id=eq.{urllib.parse.quote(p['id'])}&select=manager_id")
        if f and f[0]["manager_id"]:
            mp = lire(f"personnes?id=eq.{f[0]['manager_id']}&select=prenom,nom")
            mgr_nom = f"{mp[0]['prenom']} {mp[0]['nom']}" if mp else None
    except Exception:  # noqa: BLE001
        pass
    for nom, fn, outil, lib in (("slack", connecteurs.slack_bienvenue, "Slack", "Message de bienvenue dans Slack"), ("gmail", connecteurs.gmail_bienvenue, "Gmail", "E-mail de bienvenue envoyé")):
        if not connecteurs.autorise(nom):
            continue
        ok, detail = fn(p, mgr_nom)
        if ok is not None:
            evenement(run, lib, "ok" if ok else "echec", detail, outil=outil)
    pr = c.preuve(p["id"])
    verifiees = sum(1 for k in ("canal", "message", "parrain", "cafe") if pr.get(k))
    return c.cloturer(run, verifiees == 4, verifiees, 4, debut, "Équipe")
