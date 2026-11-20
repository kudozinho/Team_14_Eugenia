"""Mécanique commune des agents Équipe et Docs (l'Agent Accès a la sienne, déjà testée).

Un passage = une session H + une surveillance de la base : chaque élément de v_onboarding qui passe à « vrai »
est écrit comme événement « vérifié dans l'outil ». La base prouve, pas l'agent.
"""
import os
import sys
import threading
import time
import urllib.parse
from datetime import datetime, timezone

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "acces"))
import acces  # noqa: E402
from acces import Reponse, _req, evenement, lire, preuve  # noqa: E402,F401


def personne(personne_id):
    return lire(f"personnes?id=eq.{urllib.parse.quote(personne_id)}&select=*")[0]


def creer_run(agent, p, proposition_id):
    corps = {"agent": agent, "statut": "en_cours"}
    if proposition_id:
        corps["proposition_id"] = proposition_id
    run = _req("POST", "agents_runs", corps, retour=True)[0]["id"]
    return run


def passage(client, run_id, p, consigne, chemin_depart, elements, max_steps=40, max_time_s=240, agent_h=None):
    """Lance une session H et vérifie dans la base les `elements` ({clé v_onboarding: libellé}) pendant qu'elle travaille."""
    vus, stop = set(), threading.Event()

    def surveiller():
        while not stop.is_set():
            try:
                pr = preuve(p["id"])
                for el, etiquette in elements.items():
                    if pr.get(el) and el not in vus:
                        vus.add(el)
                        evenement(run_id, etiquette, "ok", "vérifié dans l'outil", outil=chemin_depart.split("/")[2])
            except Exception as e:  # noqa: BLE001
                print("  (surveillance)", type(e).__name__)
            stop.wait(3)

    t = threading.Thread(target=surveiller, daemon=True)
    t.start()
    s = client.start_session(agent=agent_h or acces.AGENT, messages=consigne, answer_schema=Reponse, max_steps=max_steps,
                             max_time_s=max_time_s, timezone="Europe/Paris",
                             overrides={"agent.environments[kind=web].start_url": f"{acces.INTRANET}{chemin_depart}"})
    vue = client.sessions.get_session(s.id).agent_view_url
    _req("PATCH", f"agents_runs?id=eq.{run_id}", {"session_h_id": s.id, "vue_directe_url": vue})
    print(f"  Session H {s.id}\n  Vue en direct : {vue}")
    fin = s.wait_for_completion()
    time.sleep(4)
    stop.set()
    t.join(timeout=5)
    return fin, vus


def cloturer(run_id, ok, verifiees, total, debut, agent):
    duree = round(time.monotonic() - debut)
    _req("PATCH", f"agents_runs?id=eq.{run_id}", {"statut": "termine" if ok else "echec", "fin": datetime.now(timezone.utc).isoformat(),
                                                   "actions_total": total, "actions_verifiees": verifiees})
    print(f"\nAgent {agent} : {'RÉUSSI' if ok else 'ÉCHEC'} · {verifiees}/{total} actions vérifiées dans la base · {duree} s")
    return {"agent": agent, "run_id": run_id, "reussi": ok, "verifiees": verifiees, "duree_s": duree}
