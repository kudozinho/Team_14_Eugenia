"""HTTP demo runner: no permanent queue polling, no capture, no automatic retry."""
import hmac
import json
import os
import re
import subprocess
import sys
import threading
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

import requests

REPO = Path(__file__).resolve().parents[2] if Path(__file__).parent.name == 'agent-h' else Path('/app')
TASK = 'tache_a1a0c7545c805f328eba1e25'
PORTALS = ['Portail A', 'Portail B', 'Portail C']


def settings():
    if os.environ.get('TACHE_ID') != TASK:
        raise ValueError('TACHE_ID doit désigner la tâche de démonstration.')
    token = os.environ.get('GHOST_WORKER_TOKEN', '')
    if len(token) < 32:
        raise ValueError('GHOST_WORKER_TOKEN : 32 caractères minimum.')
    base = os.environ['SUPABASE_URL'].rstrip('/') + '/rest/v1/'
    key = os.environ['SUPABASE_SERVICE_ROLE_KEY']
    if not os.environ.get('HAI_API_KEY'):
        raise ValueError('Clé H absente.')
    return base, {'apikey': key, 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'}, token


def db(method, resource, **kwargs):
    base, headers, _ = settings()
    r = requests.request(method, base + resource, headers=headers | kwargs.pop('headers', {}), timeout=15, **kwargs)
    r.raise_for_status()
    return r


def fail(identity, message):
    # A remote H session might still complete: operator review blocks further admission.
    db('PATCH', 'executions_agent', params={'id': 'eq.' + identity},
       json={'statut': 'interrupted', 'verification': 'inconnue', 'review_required': True, 'resume': message})


def execute(identity):
    # .env files are excluded from the image; remove reset even on a developer machine.
    sys.path.insert(0, str(REPO / 'alejandro-cto/agent-h'))
    import lancer_agent
    os.environ.pop('RESET_TOKEN', None)
    try:
        # Fail closed rather than taking a fixture if the real task has disappeared.
        rows = db('GET', 'taches_detectees', params={'id': 'eq.' + TASK}).json()
        if not rows or not rows[0].get('instructions_agent'):
            raise ValueError('Tâche indisponible')
        photo = lancer_agent.DOSSIER_PHOTOS / 'M-0142.jpg'
        if not photo.is_file():
            raise ValueError('Photo exacte absente')
        result = lancer_agent.lancer(TASK, PORTALS, lancer_agent.AGENT_PAR_DEFAUT,
                                     lancer_agent.charger_mandat('M-0142'), 'publie',
                                     on_session=lambda sid: db('PATCH', 'executions_agent', params={'id': 'eq.' + identity}, json={'session_id': sid}),
                                     on_verification=lambda: db('PATCH', 'executions_agent', params={'id': 'eq.' + identity}, json={'resume': 'Vérification des annonces et de la photo exacte…'}))
        checked = result.get('verification_base', {})
        ok = result.get('reussi') is True and all(checked.get(p) == 'ok' for p in PORTALS) and result.get('photo_prouvee') is True
        values = lancer_agent.ligne_execution(result)
        values.update(statut='completed' if ok else 'failed', verification='ok' if ok else 'echec',
                      portails_publies=[p for p in PORTALS if checked.get(p) == 'ok'], review_required=not ok,
                      preuve={'portails': checked, 'photo_exacte': result.get('photo_prouvee'),
                              'verifie_le': datetime.now(timezone.utc).isoformat(), 'mandat': 'M-0142'})
        db('PATCH', 'executions_agent', params={'id': 'eq.' + identity}, json=values)
    except Exception:
        fail(identity, 'Résultat incertain ; vérifier la session H et les publications avant toute reprise.')


class Runner:
    def __init__(self):
        self.lock = threading.Lock()
        self.identity = None

    def start(self, identity):
        if not re.fullmatch(r'[\w-]{1,64}', identity):
            return 400
        with self.lock:
            rows = db('GET', 'executions_agent', params={'id': 'eq.' + identity, 'tache_id': 'eq.' + TASK}).json()
            if not rows:
                return 404
            row = rows[0]
            if self.identity == identity or row['statut'] != 'en_cours':
                return 200
            if self.identity:
                return 409
            if row.get('resume') != 'HTTP_PENDING':
                return 409  # already taken, including before a restart: never execute twice
            # Atomic claim also protects against two server instances.
            claimed = db('PATCH', 'executions_agent', params={'id': 'eq.' + identity, 'resume': 'eq.HTTP_PENDING', 'statut': 'eq.en_cours'},
                         headers={'Prefer': 'return=representation'}, json={'resume': 'Agent H : exécution en cours.'}).json()
            if not claimed:
                return 409
            self.identity = identity
            threading.Thread(target=self.run, args=(identity,), daemon=True).start()
            return 202

    def run(self, identity):
        try:
            # Runtime limit does not imply the distant H session has stopped.
            proc = subprocess.Popen([sys.executable, str(Path(__file__).resolve()), '--execute', identity])
            try:
                code = proc.wait(timeout=600)
            except subprocess.TimeoutExpired:
                proc.kill()
                proc.wait()
                raise RuntimeError('timeout')
            if code:
                raise RuntimeError('child failed')
        except Exception:
            try:
                fail(identity, 'Worker interrompu ; vérifier les publications et la session avant reprise.')
            except requests.RequestException:
                pass  # existing en_cours blocks admission; never replay blindly
        finally:
            with self.lock:
                self.identity = None


runner = Runner()


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *_):
        pass  # no tokens, task input or secrets in access logs

    def respond(self, status, data):
        body = json.dumps(data).encode()
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Content-Length', str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def authorized(self):
        _, _, token = settings()
        return hmac.compare_digest(self.headers.get('Authorization', ''), 'Bearer ' + token)

    def do_GET(self):
        if self.path == '/healthz':
            return self.respond(200, {'http': 'ready'})  # only process liveness
        if self.path != '/ready':
            return self.respond(404, {})
        try:
            if not self.authorized():
                return self.respond(401, {})
            # Row seeded by migration; no upsert that might reset the run budget.
            rows = db('PATCH', 'agent_worker', params={'id': 'eq.cloud'}, headers={'Prefer': 'return=representation'},
                      json={'heartbeat': datetime.now(timezone.utc).isoformat()}).json()
            if not rows:
                return self.respond(503, {'error': 'migration_required'})
            return self.respond(200, {'ready': True})
        except Exception:
            return self.respond(503, {'error': 'unavailable'})

    def do_POST(self):
        if self.path != '/run':
            return self.respond(404, {})
        try:
            if not self.authorized():
                return self.respond(401, {})
            length = int(self.headers.get('Content-Length', '0'))
            if not 0 < length <= 1024:
                return self.respond(400, {})
            self.connection.settimeout(5)
            data = json.loads(self.rfile.read(length))
            status = runner.start(str(data.get('id', '')))
            self.respond(status, {'accepted': status in (200, 202)})
        except Exception:
            self.respond(503, {'error': 'unavailable'})


def main():
    settings()
    if len(sys.argv) == 3 and sys.argv[1] == '--execute':
        execute(sys.argv[2])
    else:
        ThreadingHTTPServer(('0.0.0.0', int(os.environ.get('PORT', '10000'))), Handler).serve_forever()


if __name__ == '__main__':
    main()
