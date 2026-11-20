"""Orchestrateur GHOST New Era : lance les agents H dès qu'une proposition est ACCEPTÉE dans le portail.

Le portail écrit « propositions.statut = acceptee ». Ce programme (qui tourne sur un poste ou sur un service hébergé,
jamais sur Vercel à cause des durées maximales) surveille la base, puis lance les agents EN PARALLÈLE :
chacun écrit ses événements dans agents_evenements, et le portail les affiche.

    cd agents && acces/../tests_h/.venv/bin/python -u orchestrateur.py          # surveille en continu
    ... orchestrateur.py --une-fois --proposition <id>                           # traite une proposition
Les clés sont lues dans acces/.env (HAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).
"""
import argparse
import os
import sys
import threading
import time
import urllib.parse

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "acces"))
from dotenv import load_dotenv  # noqa: E402

load_dotenv(os.path.join(os.path.dirname(__file__), "acces", ".env"))
import acces  # noqa: E402
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "equipe"))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "docs"))
import docs as agent_docs  # noqa: E402
import equipe as agent_equipe  # noqa: E402
from hai_agents import Client  # noqa: E402

# Les trois agents partent en parallèle. Aucun succès n'est simulé : tout est vérifié dans la base.
AGENTS = {"acces": acces.executer, "equipe": agent_equipe.executer, "docs": agent_docs.executer}
A_FAIRE = []


def personne_de(proposition_id):
    p = acces.lire(f"propositions?id=eq.{proposition_id}&select=tache_id")[0]
    t = acces.lire(f"taches_detectees?id=eq.{p['tache_id']}&select=declencheur_arrivee_id")[0]
    a = acces.lire(f"arrivees?id=eq.{t['declencheur_arrivee_id']}&select=personne_id,id")[0]
    return a["personne_id"], a["id"]


def traiter(client, proposition_id, manager=None):
    personne_id, arrivee_id = personne_de(proposition_id)
    print(f"\n=== Proposition {proposition_id} acceptée : arrivée de {personne_id} ===")
    if A_FAIRE:
        print(f"  Agents non écrits (pas de faux succès) : {', '.join(A_FAIRE)}")
    acces._req("PATCH", f"arrivees?id=eq.{arrivee_id}", {"statut": "en_cours"})
    try:
        q0 = client.quota.get_token_quota().used  # jetons H déjà consommés : sert à mesurer le coût de ce run
    except Exception:  # noqa: BLE001
        q0 = None
    resultats, fils = {}, []
    for nom, fn in AGENTS.items():
        def lancer(nom=nom, fn=fn):
            try:
                resultats[nom] = fn(client, personne_id, proposition_id=proposition_id, manager=manager)
            except Exception as e:  # noqa: BLE001
                resultats[nom] = {"agent": nom, "reussi": False, "erreur": f"{type(e).__name__}: {str(e)[:200]}"}
        f = threading.Thread(target=lancer)
        f.start()
        fils.append(f)
    t0 = time.monotonic()
    [f.join() for f in fils]
    try:
        if q0 is not None and resultats.get("acces", {}).get("run_id"):
            delta = client.quota.get_token_quota().used - q0
            # Coût du run entier (3 agents), noté sur le run Accès : jetons H consommés pendant le run (approximatif si le compte sert à autre chose).
            acces._req("PATCH", f"agents_runs?id=eq.{resultats['acces']['run_id']}", {"cout_credits": delta})
            print(f"  Coût mesuré : environ {delta} jetons H pour ce run", flush=True)
    except Exception as e:  # noqa: BLE001
        print("  Coût non mesuré :", type(e).__name__, flush=True)
    tout_ok = all(r.get("reussi") for r in resultats.values()) and not A_FAIRE
    if tout_ok:
        acces._req("PATCH", f"arrivees?id=eq.{arrivee_id}", {"statut": "terminee"})
    print(f"=== Terminé en {round(time.monotonic() - t0)} s : {resultats}")
    return resultats


def en_attente():
    """Propositions acceptées qui n'ont encore aucun run d'agent."""
    acceptees = acces.lire("propositions?statut=eq.acceptee&select=id")
    deja = {r["proposition_id"] for r in acces.lire("agents_runs?proposition_id=not.is.null&select=proposition_id")}
    return [p["id"] for p in acceptees if p["id"] not in deja]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--une-fois", action="store_true")
    ap.add_argument("--proposition", default=None)
    ap.add_argument("--manager", default=None, help="manager fourni d'avance (tests)")
    a = ap.parse_args()
    client = Client()
    if a.proposition:
        traiter(client, a.proposition, a.manager)
        return
    print("Orchestrateur en attente de propositions acceptées (Ctrl+C pour arrêter)...")
    while True:
        for pid in en_attente():
            traiter(client, pid, a.manager)
        if a.une_fois:
            break
        time.sleep(3)


if __name__ == "__main__":
    main()
