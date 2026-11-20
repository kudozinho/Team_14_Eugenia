"""Tests H (GHOST New Era) : sessions d'agent H sur l'intranet d'Atelier Nova, en LECTURE SEULE.

Lancer, depuis ce dossier :
    python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
    cp .env.example .env     # puis coller HAI_API_KEY dans .env (jamais dans un message ni un commit)
    .venv/bin/python tests_h.py 1     # une session
    .venv/bin/python tests_h.py 2     # trois sessions en parallèle
    .venv/bin/python tests_h.py 3     # message envoyé à une session en cours
Les durées sont mesurées par ce script. La clé n'est jamais affichée.
"""
import json
import sys
import threading
import time

from dotenv import load_dotenv
from hai_agents import Client
from pydantic import BaseModel

load_dotenv()

INTRANET = "https://atelier-nova-intranet.vercel.app"
AGENT = "h/web-surfer-pro"  # web-surfer-flash reformulait les valeurs lors des tests précédents
MAX_STEPS, MAX_TIME_S = 15, 150


class Poste(BaseModel):
    poste: str
    equipe: str


class Auteur(BaseModel):
    auteur: str


class Horaires(BaseModel):
    horaires: str


# (nom, page de départ, consigne, schéma de réponse, valeur attendue pour vérifier)
CAS = {
    "rh": (f"{INTRANET}/intranet/rh",
           "Tu es dans l'espace RH d'Atelier Nova. Clique sur « Ouvrir la fiche de Karim », puis donne son poste et son équipe. "
           "Ne modifie rien.", Poste, {"poste": "Commercial", "equipe": "Ventes"}),
    "messagerie": (f"{INTRANET}/intranet/messagerie",
                   "Tu es dans la messagerie d'Atelier Nova. Ouvre le canal « # tech » et donne l'auteur du premier message. "
                   "Ne publie rien.", Auteur, {"auteur": "Sophie Durand"}),
    "wiki": (f"{INTRANET}/intranet/wiki",
             "Tu es dans le wiki d'Atelier Nova. Ouvre la page « Livret d'accueil Atelier Nova » et donne les horaires. "
             "Ne modifie rien.", Horaires, {"horaires": "9 h 30"}),
}


def vue_directe(client, session):
    """Adresse de la vue en direct (agent_view_url) lue dans la session côté H."""
    try:
        return client.sessions.get_session(session.id).agent_view_url, []
    except Exception as e:  # noqa: BLE001
        return None, [f"erreur: {e}"]


def verifie(rep, attendu):
    if rep is None:
        return False
    d = rep.model_dump()
    return all(v.lower() in str(d.get(k, "")).lower() for k, v in attendu.items())


def lancer(cle, client, resultats, idle=None):
    url, consigne, schema, attendu = CAS[cle]
    t0 = time.monotonic()
    r = {"cas": cle, "demarrage_ok": False}
    try:
        params = dict(agent=AGENT, messages=consigne, answer_schema=schema, max_steps=MAX_STEPS, max_time_s=MAX_TIME_S,
                      timezone="Europe/Paris", overrides={"agent.environments[kind=web].start_url": url})
        if idle:
            params["idle_timeout_s"] = idle
        s = client.start_session(**params)
        r.update(demarrage_ok=True, session_id=s.id, demarrage_s=round(time.monotonic() - t0, 1))
        vue, champs = vue_directe(client, s)
        r.update(vue_directe=vue, champs_etat=champs)
        fin = s.wait_for_completion()
        r.update(statut=fin.status, duree_s=round(time.monotonic() - t0), reponse=getattr(fin.answer, "model_dump", lambda: None)(),
                 verifie=verifie(fin.answer, attendu))
        r["session"] = s
    except Exception as e:  # noqa: BLE001
        r.update(erreur=f"{type(e).__name__}: {e}"[:300], duree_s=round(time.monotonic() - t0))
    resultats[cle] = r
    return r


def afficher(resultats):
    sortie = {k: {c: v for c, v in r.items() if c != "session"} for k, r in resultats.items()}
    print(json.dumps(sortie, ensure_ascii=False, indent=2, default=str))


def main():
    test = sys.argv[1] if len(sys.argv) > 1 else "1"
    client = Client()  # lit HAI_API_KEY
    try:
        q = client.quota.get_token_quota()
        print(f"Quota de jetons : {q.used} utilisés sur {q.limit} (reste {q.remaining})")
    except Exception as e:  # noqa: BLE001
        print("Quota illisible :", type(e).__name__)
    res = {}
    if test == "1":
        lancer("rh", client, res)
    elif test == "2":
        fils = [threading.Thread(target=lancer, args=(c, client, res)) for c in CAS]
        t0 = time.monotonic()
        [f.start() for f in fils]
        [f.join() for f in fils]
        print(f"Durée totale en parallèle : {round(time.monotonic() - t0)} s (somme des durées seules : {sum(r.get('duree_s', 0) for r in res.values())} s)")
    elif test == "3":
        r = lancer("rh", client, res, idle=90)
        s = r.get("session")
        if s:
            t0 = time.monotonic()
            s.send_message({"type": "user_message", "message": "Merci. Redonne ta réponse, mais écris le poste en MAJUSCULES."})
            time.sleep(3)
            fin = s.wait_for_completion()
            r["message_envoye"] = True
            r["reponse_apres_message"] = str(fin.answer)[:300]
            r["reprise_s"] = round(time.monotonic() - t0)
    else:
        sys.exit("Usage : tests_h.py 1 | 2 | 3")
    afficher(res)


if __name__ == "__main__":
    main()
