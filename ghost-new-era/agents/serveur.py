"""Service hébergé (Render) : surveille la base et lance les agents, et montre l'écran des agents en direct.

- /sante : garde le service éveillé (offre gratuite).
- /agent/<session> : les dernières étapes de l'agent (clics avec coordonnées, élément visé, raisonnement).
- /agent/<session>/image/<n> : la n-ième capture d'écran de l'agent (lue avec la clé du service, jamais exposée).
Variables d'environnement (jamais dans le dépôt) : HAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, HF_TOKEN (facultatif).
"""
import json
import os
import re
import sys
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

sys.path.insert(0, os.path.dirname(__file__))
import orchestrateur as o  # noqa: E402

UUID = r"[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}"
_client = None
_images = {}  # (session, n) -> octets, pour ne pas relire la même capture


def client():
    global _client
    if _client is None:
        _client = o.Client()
    return _client


def lire_session(sid):
    """Parcourt les événements de la session : captures d'écran et actions (clic, saisie...) dans l'ordre."""
    ev = client().sessions.list_session_events(sid)
    items = getattr(ev, "events", None) or getattr(ev, "items", None) or ev
    images, etapes, url, titre = [], [], None, None
    for e in items:
        dd = e.model_dump().get("data")
        if not isinstance(dd, dict):
            continue
        k = dd.get("kind")
        if k == "observation_event":
            im = dd.get("image")
            if isinstance(im, dict) and im.get("source"):
                images.append(im["source"])
            meta = dd.get("metadata") or {}
            url, titre = meta.get("url", url), meta.get("title", titre)
        elif k == "policy_event":
            raison = (dd.get("reasoning_content") or "").strip().replace("\n", " ")[:240]
            for tr in dd.get("tool_reqs") or []:
                a = tr.get("args") or {}
                etapes.append({"image": len(images) - 1, "outil": tr.get("tool_name"), "x": a.get("x"), "y": a.get("y"),
                               "element": a.get("element"), "texte": a.get("text") or a.get("content"), "raison": raison})
    return images, etapes, url, titre


def etat_agent(sid):
    images, etapes, url, titre = lire_session(sid)
    return {"images": len(images), "derniere": len(images) - 1, "url": url, "titre": titre,
            "termine": any(x["outil"] == "answer" for x in etapes), "etapes": etapes[-14:]}


def image_agent(sid, n):
    cle = (sid, n)
    if cle not in _images:
        images, _, _, _ = lire_session(sid)
        if n < 0 or n >= len(images):
            return None
        m = re.match(r"https://[^/]+/api/v1/trajectories/[^/]+/resources/([^/]+)/(.+)$", images[n])
        if not m:
            return None
        _images[cle] = b"".join(client().sessions.get_session_resource(sid, m.group(1), m.group(2)))
        if len(_images) > 300:
            _images.pop(next(iter(_images)))
    return _images[cle]


class Service(BaseHTTPRequestHandler):
    def _envoyer(self, code, corps, type_="application/json"):
        self.send_response(code)
        self.send_header("Content-Type", type_)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-store" if type_ == "application/json" else "public, max-age=3600")
        self.send_header("Content-Length", str(len(corps)))
        self.end_headers()
        self.wfile.write(corps)

    def do_GET(self):  # noqa: N802
        chemin = self.path.split("?")[0]
        try:
            if chemin in ("/", "/sante"):
                return self._envoyer(200, b"ok", "text/plain")
            m = re.fullmatch(rf"/agent/({UUID})", chemin)
            if m:
                return self._envoyer(200, json.dumps(etat_agent(m.group(1)), ensure_ascii=False).encode())
            m = re.fullmatch(rf"/agent/({UUID})/image/(\d+)", chemin)
            if m:
                img = image_agent(m.group(1), int(m.group(2)))
                return self._envoyer(200 if img else 404, img or b"", "image/png")
            return self._envoyer(404, b'{"erreur":"inconnu"}')
        except Exception as e:  # noqa: BLE001
            return self._envoyer(502, json.dumps({"erreur": f"{type(e).__name__}"}).encode())

    def log_message(self, *args):  # silence
        pass


def boucle():
    c = client()
    lances = set()  # évite de relancer une proposition pendant que ses agents démarrent
    print("Orchestrateur en ligne : surveille les propositions acceptées.", flush=True)
    while True:
        try:
            for pid in o.en_attente():
                if pid in lances:
                    continue
                lances.add(pid)
                threading.Thread(target=o.traiter, args=(c, pid), daemon=True).start()
                time.sleep(1)
        except Exception as e:  # noqa: BLE001  (une erreur ne doit jamais arrêter le service)
            print("Erreur de boucle :", type(e).__name__, str(e)[:200], flush=True)
        time.sleep(3)


if __name__ == "__main__":
    threading.Thread(target=boucle, daemon=True).start()
    ThreadingHTTPServer(("0.0.0.0", int(os.environ.get("PORT", "10000"))), Service).serve_forever()
