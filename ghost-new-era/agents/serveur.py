"""Service hébergé (Render) : surveille la base et lance les agents, + une adresse /sante pour le garder éveillé.

Render (offre gratuite) s'endort après 15 minutes sans visite : le portail appelle /sante pendant qu'une session est ouverte.
Variables d'environnement (jamais dans le dépôt) : HAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, HF_TOKEN (facultatif).
"""
import os
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, HTTPServer

sys.path.insert(0, os.path.dirname(__file__))
import orchestrateur as o  # noqa: E402

DEMARRE = time.time()


class Sante(BaseHTTPRequestHandler):
    def do_GET(self):  # noqa: N802
        corps = b"ok"
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(corps)))
        self.end_headers()
        self.wfile.write(corps)

    def log_message(self, *args):  # silence
        pass


def boucle():
    client = o.Client()
    print("Orchestrateur en ligne : surveille les propositions acceptées.", flush=True)
    while True:
        try:
            for pid in o.en_attente():
                o.traiter(client, pid)
        except Exception as e:  # noqa: BLE001  (une erreur ne doit jamais arrêter le service)
            print("Erreur de boucle :", type(e).__name__, str(e)[:200], flush=True)
        time.sleep(3)


if __name__ == "__main__":
    threading.Thread(target=boucle, daemon=True).start()
    HTTPServer(("0.0.0.0", int(os.environ.get("PORT", "10000"))), Sante).serve_forever()
