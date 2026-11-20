"""Agent Accès (GHOST New Era) : prépare l'arrivée d'une personne dans l'espace RH de l'intranet d'Atelier Nova.

Un agent H clique dans l'intranet (fiche, accès du poste, badge, demande de matériel).
Chaque action est VÉRIFIÉE dans la base (vue v_onboarding) pendant que l'agent travaille : c'est la base qui prouve,
pas l'agent. Les événements sont écrits dans agents_runs, agents_evenements et decisions_humaines.

    .venv/bin/python acces.py --personne karim-benali                # question du manager : attend une réponse humaine
    .venv/bin/python acces.py --personne karim-benali --manager "Claire Fontaine"   # manager fourni d'avance
    .venv/bin/python acces.py --personne karim-benali --reset        # remet Karim à zéro (données de test) puis lance
    .venv/bin/python acces.py --personne karim-benali --seulement-reset   # remet à zéro et s'arrête : prépare la démo
"""
import argparse
import json
import os
import ssl
import threading
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from typing import Literal, Optional

import certifi
from dotenv import load_dotenv
from hai_agents import Client
from pydantic import BaseModel

load_dotenv()
CONTEXTE_SSL = ssl.create_default_context(cafile=certifi.where())  # certificats fiables (Python macOS)

INTRANET = os.environ.get("INTRANET_URL", "https://atelier-nova-intranet.vercel.app")
AGENT = os.environ.get("AGENT_ACCES", "ghost-acces")  # agent créé dans le compte H ; repli possible : h/web-surfer-pro
MAX_STEPS, MAX_TIME_S = 40, 240
ATTENTE_HUMAINE_S = 600
ELEMENTS = {"fiche": "Fiche RH créée", "acces": "Accès demandés", "badge": "Badge demandé"}


AGENT_PAR_DEFAUT = "h/web-surfer-pro"


def _avec_coffre(client, params):
    """Lie le navigateur de l'agent au coffre-fort de Ghost (s'il existe) : l'agent se connecte seul aux comptes enregistrés."""
    try:
        import coffre  # noqa: PLC0415
        vid = coffre.coffre_existant(client)
        if vid:
            params = dict(params)
            params["overrides"] = {**params.get("overrides", {}), "agent.environments[kind=web].vault_id": vid}
    except Exception as e:  # noqa: BLE001
        print("  (coffre-fort ignoré)", type(e).__name__, flush=True)
    return params


def demarrer(client, agent, **params):
    params = _avec_coffre(client, params)
    """Démarre une session avec l'agent nommé ; s'il n'existe pas dans le compte H de la clé utilisée (404),
    bascule sur l'agent prêt à l'emploi de H. Les agents personnalisés sont propres à chaque compte."""
    try:
        return client.start_session(agent=agent, **params)
    except Exception as e:  # noqa: BLE001
        if "404" in str(e) and agent != AGENT_PAR_DEFAUT:
            print(f"  Agent '{agent}' introuvable dans ce compte H : repli sur {AGENT_PAR_DEFAUT}", flush=True)
            return client.start_session(agent=AGENT_PAR_DEFAUT, **params)
        raise


class Reponse(BaseModel):
    statut: Literal["termine", "question", "echec"]
    question: Optional[str] = None
    resume: str


# ---------- Supabase (REST, clé de service : serveur seulement) ----------
def _req(methode, chemin, corps=None, retour=False):
    url = os.environ["NEXT_PUBLIC_SUPABASE_URL"] + "/rest/v1/" + chemin
    cle = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
    h = {"apikey": cle, "Authorization": f"Bearer {cle}", "Content-Type": "application/json"}
    if retour:
        h["Prefer"] = "return=representation"
    r = urllib.request.Request(url, data=json.dumps(corps).encode() if corps is not None else None, headers=h, method=methode)
    with urllib.request.urlopen(r, timeout=20, context=CONTEXTE_SSL) as f:
        t = f.read().decode()
        return json.loads(t) if t else None


def lire(chemin):
    return _req("GET", chemin)


def evenement(run_id, action, statut, detail="", outil="Espace RH"):
    _req("POST", "agents_evenements", {"run_id": run_id, "action": action, "outil": outil, "statut": statut, "detail": detail})
    print(f"  [{datetime.now().strftime('%H:%M:%S')}] {statut:<18} {action}" + (f" : {detail}" if detail else ""))


def preuve(personne_id):
    q = urllib.parse.quote(personne_id)
    return {l["element"]: l["present"] for l in lire(f"v_onboarding?personne_id=eq.{q}&select=element,present")}


def reinitialiser(personne_id):
    """Remet une personne de TEST à zéro (jamais utilisé en dehors des données fictives)."""
    q = urllib.parse.quote(personne_id)
    _req("PATCH", f"rh_fiches?personne_id=eq.{q}", {"statut_fiche": "vide", "manager_id": None})
    _req("DELETE", f"rh_acces?personne_id=eq.{q}")
    _req("DELETE", f"rh_materiel?personne_id=eq.{q}")
    _req("PATCH", f"rh_badges?personne_id=eq.{q}", {"zones": [], "statut": "a_demander"})
    # Sans ceci, la notification d'arrivée reste « en cours » ou « terminée » et Ghost ne propose plus rien.
    _req("PATCH", f"arrivees?personne_id=eq.{q}", {"statut": "nouvelle"})
    # Messagerie et wiki : uniquement ce que les agents ont écrit pour cette personne de test.
    if personne_id == "karim-benali":
        _req("DELETE", "msg_demandes?personne_id=eq.karim-benali")
        _req("DELETE", "msg_messages?auteur=eq." + urllib.parse.quote("Ghost, pour Sophie Durand") + "&texte=ilike." + urllib.parse.quote("*Karim*"))
        _req("DELETE", "wiki_pages?titre=ilike." + urllib.parse.quote("Bienvenue Karim*"))
        _req("DELETE", "wiki_checklists?personne_id=eq.karim-benali")
    print(f"Données de test de {personne_id} remises à zéro.")


# ---------- Consigne ----------
def consigne(p, manager=None):
    mgr = (f"Le manager de {p['prenom']} est {manager} : sélectionne-le dans la liste « Manager » avant de créer la fiche."
           if manager else
           "Si le champ « Manager » est « Non renseigné » et que tu ne connais pas le manager, N'INVENTE RIEN : "
           "n'enregistre pas la fiche, arrête-toi et réponds statut=question avec la question à poser à la RH.")
    return f"""Tu es l'assistant RH d'Atelier Nova. Tu es sur l'intranet, espace RH et badges. Prépare l'arrivée de {p['prenom']} {p['nom']} (poste : {p['poste']}, équipe : {p['equipe']}).
1. Dans « Notifications d'arrivée » (ou dans « Liste des personnes »), clique sur « Ouvrir la fiche de {p['prenom']} » (ou « Ouvrir la fiche »).
2. Section « Fiche RH » : vérifie le poste, l'équipe et la date d'arrivée. {mgr} Puis clique « Créer la fiche ».
3. Section « Accès » : clique « Demander l'accès à … » pour chaque outil listé, un par un.
4. Section « Badge » : coche « Entrée principale » et « Open space », puis clique « Demander le badge ».
5. Section « Matériel » : clique « Demander le matériel » (article « Ordinateur portable »). Ne clique JAMAIS « Valider la commande (personne seulement) » : c'est une décision humaine.
Ne sors pas de l'espace RH. Ne modifie aucune autre personne. Quand tout est fait, réponds statut=termine avec un résumé court ; si tu es bloqué, statut=echec."""


# ---------- Un passage de l'agent, avec vérification en direct ----------
def passage(client, run_id, p, manager):
    vus = set()
    stop = threading.Event()

    def surveiller():
        while not stop.is_set():
            try:
                for el, etiquette in ELEMENTS.items():
                    if preuve(p["id"]).get(el) and el not in vus:
                        vus.add(el)
                        evenement(run_id, etiquette, "ok", "vérifié dans l'outil")
            except Exception as e:  # noqa: BLE001
                print("  (surveillance) ", type(e).__name__)
            stop.wait(3)

    t = threading.Thread(target=surveiller, daemon=True)
    t.start()
    s = demarrer(client, AGENT, messages=consigne(p, manager), answer_schema=Reponse, max_steps=MAX_STEPS,
                             max_time_s=MAX_TIME_S, timezone="Europe/Paris",
                             overrides={"agent.environments[kind=web].start_url": f"{INTRANET}/intranet/rh"})
    vue = client.sessions.get_session(s.id).agent_view_url
    _req("PATCH", f"agents_runs?id=eq.{run_id}", {"session_h_id": s.id, "vue_directe_url": vue})
    print(f"  Session H {s.id}\n  Vue en direct : {vue}")
    fin = s.wait_for_completion()
    time.sleep(4)  # laisse la surveillance voir les dernières écritures
    stop.set()
    t.join(timeout=5)
    return fin, vus


def executer(client, personne_id, proposition_id=None, manager=None):
    """Lance l'Agent Accès pour une personne. Renvoie un dict (réussite, actions vérifiées, durée)."""
    p = lire(f"personnes?id=eq.{urllib.parse.quote(personne_id)}&select=*")[0]
    debut = time.monotonic()
    corps = {"agent": "acces", "statut": "en_cours"}
    if proposition_id:
        corps["proposition_id"] = proposition_id
    run = _req("POST", "agents_runs", corps, retour=True)[0]["id"]
    evenement(run, f"Agent Accès : préparation de {p['prenom']} {p['nom']}", "en_cours")

    fin, vus = None, set()
    try:
        for essai in range(2):
            fin, vus = passage(client, run, p, manager)
            rep = fin.answer if isinstance(fin.answer, Reponse) else None
            if rep and rep.statut == "question" and essai == 0:
                d = _req("POST", "decisions_humaines", {"run_id": run, "libelle": rep.question or "Question de l'agent Accès"}, retour=True)[0]["id"]
                evenement(run, "Question de l'agent", "question", rep.question or "")
                print(f"  En attente d'une réponse humaine (decisions_humaines {d})...")
                limite = time.monotonic() + ATTENTE_HUMAINE_S
                while time.monotonic() < limite:
                    r = lire(f"decisions_humaines?id=eq.{d}&select=statut,reponse")[0]
                    if r["statut"] == "validee" and r["reponse"]:
                        manager = r["reponse"]
                        evenement(run, "Réponse reçue", "ok", f"manager : {manager}")
                        break
                    time.sleep(3)
                else:
                    evenement(run, "Pas de réponse humaine", "echec")
                    break
                continue
            break
    except Exception as e:  # noqa: BLE001
        evenement(run, "Erreur de l'agent", "echec", f"{type(e).__name__}: {str(e)[:200]}")

    # Matériel : jamais validé par l'agent, une personne doit décider.
    mat = lire(f"rh_materiel?personne_id=eq.{urllib.parse.quote(p['id'])}&statut=eq.a_valider&select=article")
    if mat:
        _req("POST", "decisions_humaines", {"run_id": run, "libelle": f"Valider la commande : {mat[0]['article']}"})
        evenement(run, "Commande de matériel", "attente_validation", mat[0]["article"])

    prouve = preuve(p["id"])
    verifiees = sum(1 for el in ELEMENTS if prouve.get(el)) + (1 if mat else 0)
    ok = all(prouve.get(el) for el in ELEMENTS)
    duree = round(time.monotonic() - debut)
    _req("PATCH", f"agents_runs?id=eq.{run}", {"statut": "termine" if ok else "echec", "fin": datetime.now(timezone.utc).isoformat(),
                                               "actions_total": 4, "actions_verifiees": verifiees})
    print(f"\nAgent Accès : {'RÉUSSI' if ok else 'ÉCHEC'} · {verifiees}/4 actions vérifiées dans la base · {duree} s")
    return {"agent": "acces", "run_id": run, "reussi": ok, "verifiees": verifiees, "duree_s": duree}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--personne", default="karim-benali")
    ap.add_argument("--manager", default=None, help="nom du manager, si déjà connu")
    ap.add_argument("--reset", action="store_true", help="remet la personne de test à zéro avant de lancer")
    ap.add_argument("--seulement-reset", action="store_true", help="remet à zéro puis s'arrête (prépare la démo, ne lance aucun agent)")
    a = ap.parse_args()
    if a.seulement_reset:
        a.reset = True
    if a.reset:
        if a.personne != "karim-benali":
            raise SystemExit("Reset réservé à karim-benali.")
        reinitialiser(a.personne)
    if a.seulement_reset:
        return
    executer(Client(), a.personne, manager=a.manager)


if __name__ == "__main__":
    main()
