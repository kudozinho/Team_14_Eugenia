"""Compagnon du portail MVP Windows. Lancez une fois, puis utilisez Mon audit."""
import os
import socket
import subprocess
import sys
import time
from dataclasses import replace
from pathlib import Path
from urllib.parse import urlsplit

import requests
from config import charger_config
from recorder import Recorder

ROOT = Path(__file__).resolve().parents[2]


def main():
    cfg = charger_config()
    origin = os.environ.get('GHOST_PORTAL_URL', '').rstrip('/')
    token = os.environ.get('GHOST_DEVICE_TOKEN', '')
    parsed = urlsplit(origin)
    if parsed.scheme != 'https' or not parsed.hostname or parsed.path or parsed.query or parsed.username or len(token) < 32:
        raise SystemExit('Configurer GHOST_PORTAL_URL (origine HTTPS) et GHOST_DEVICE_TOKEN (32 caractères minimum).')
    if not cfg.supabase_url or not cfg.supabase_cle:
        raise SystemExit('Configuration Supabase du Recorder manquante.')
    lock = socket.socket()
    try:
        lock.bind(('127.0.0.1', 47625))
    except OSError:
        raise SystemExit('Un compagnon Ghost est déjà lancé sur ce PC.')
    session = requests.Session()
    session.headers['Authorization'] = f'Bearer {token}'
    endpoint = origin + '/api/mon-audit'

    def call(method, body=None):
        response = session.request(method, endpoint, json=body, timeout=5, allow_redirects=False)
        if response.status_code != 200:
            raise RuntimeError(f'Portail indisponible (HTTP {response.status_code})')
        return response.json()

    rec = None
    process = None
    aid = None
    actual = 'ready'
    message = ''
    last_ok = time.monotonic()
    next_poll = 0
    started = 0
    analysis_started = 0
    boot = True
    print('Ghost connecté au portail. Aucun enregistrement sans votre commande et consentement.')
    try:
        while True:
            now = time.monotonic()
            if now >= next_poll:
                try:
                    state = call('GET')
                    remote_id = state.get('audit_id')
                    if boot:
                        aid = remote_id
                        actual = 'interrupted' if aid else 'ready'
                        message = 'Compagnon reconnecté. Démarrez une nouvelle session.' if aid else ''
                        boot = False
                    elif state['desired'] == 'recording' and remote_id != aid and rec is None and process is None:
                        aid = remote_id
                        selected = replace(cfg, audit_id=aid, applis_autorisees=tuple(state['applications']), sites_autorises=tuple(state['sites']), mode_capture='fenetre')
                        actual = 'starting'
                        rec = Recorder(selected)
                        # Le choix explicite de cette session prime sur les anciennes autorisations en base.
                        rec.applis, rec.sites = selected.applis_autorisees, selected.sites_autorises
                        actual, message, started = 'recording', '', now
                    if rec and now-started >= 7200:
                        rec.stockage.clore_precedent()
                        rec = None
                        actual, message = 'interrupted', 'Limite de deux heures atteinte. Démarrez une nouvelle session.'
                    if rec and state['desired'] == 'stopped':
                        rec.stockage.clore_precedent()
                        rec = None
                        model = os.environ.get('GHOST_ANALYSIS_MODEL')
                        if not model:
                            actual, message = 'error', 'Enregistrement arrêté. Le modèle d’analyse doit être configuré par l’équipe.'
                        else:
                            process = subprocess.Popen([sys.executable, str(ROOT/'omar-caio/analyser_audit.py'), '--audit', aid, '--modele', model, '--ecrire', '--env', str(ROOT/'.env')], cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
                            actual, analysis_started = 'analysing', now
                    if process:
                        if now-analysis_started > 180:
                            process.kill()
                            process.wait()
                            actual, message, process = 'error', 'Analyse trop longue. Les événements sont conservés.', None
                        elif process.poll() is not None:
                            actual = 'completed' if process.returncode == 0 else 'error'
                            message = '' if process.returncode == 0 else 'Analyse indisponible. Les événements sont conservés ; contactez l’équipe.'
                            process = None
                    call('PUT', {'audit_id': aid, 'actual': actual, 'message': message})
                    last_ok = now
                except Exception:
                    if rec:
                        rec.stockage.clore_precedent()
                        rec = None
                        actual, message = 'interrupted', 'Connexion perdue : enregistrement arrêté. Démarrez une nouvelle session.'
                    if actual == 'starting':
                        actual, message = 'error', 'Impossible de démarrer le Recorder. Vérifiez les dépendances et permissions Windows.'
                    print('Liaison portail indisponible ; capture arrêtée.', flush=True)
                next_poll = time.monotonic()+2
            if rec:
                try:
                    rec.tour()
                except Exception:
                    rec.stockage.clore_precedent()
                    rec = None
                    actual, message = 'error', 'Capture interrompue : vérifier les permissions Windows.'
            time.sleep(0.5)
    except KeyboardInterrupt:
        pass
    finally:
        if rec:
            rec.stockage.clore_precedent()
        if process:
            process.terminate()
            process.wait(timeout=10)
        try:
            call('PUT', {'audit_id': aid, 'actual': 'interrupted', 'message': 'Compagnon arrêté sur le PC.'})
        except Exception:
            pass
        lock.close()


if __name__ == '__main__':
    main()
