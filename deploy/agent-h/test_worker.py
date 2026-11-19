"""Network-free contract checks: no H session, publication, reset or shared database."""
import importlib.util
import threading
import types
import sys
from pathlib import Path
import pytest

spec = importlib.util.spec_from_file_location('http_worker', Path(__file__).with_name('worker.py'))
w = importlib.util.module_from_spec(spec)
spec.loader.exec_module(w)


def test_wrong_task_disabled(monkeypatch):
    monkeypatch.setenv('TACHE_ID', 'example')
    with pytest.raises(ValueError):
        w.settings()


def test_atomic_claim_survives_two_instances_and_restart(monkeypatch):
    row = {'id': 'one', 'tache_id': w.TASK, 'statut': 'en_cours', 'resume': 'HTTP_PENDING'}
    lock = threading.Lock()
    class Reply:
        def __init__(self, value): self.value = value
        def json(self): return self.value
    def db(method, resource, **kw):
        with lock:
            if method == 'GET': return Reply([dict(row)])
            if row['resume'] == 'HTTP_PENDING':
                row.update(kw['json']); return Reply([dict(row)])
            return Reply([])
    runs=[]
    monkeypatch.setattr(w, 'db', db)
    monkeypatch.setattr(w.Runner, 'run', lambda self, identity: runs.append(identity))
    a,b=w.Runner(),w.Runner()
    results=[]
    ts=[threading.Thread(target=lambda x=x: results.append(x.start('one'))) for x in (a,b)]
    for t in ts:t.start()
    for t in ts:t.join()
    assert runs == ['one']
    assert 202 in results
    assert w.Runner().start('one') == 409  # already taken, never replay after restart
    row['statut']='completed'
    assert w.Runner().start('one') == 200
    assert runs == ['one']


@pytest.mark.parametrize('proved,expected', [(True,'completed'), (None,'failed'), (False,'failed')])
def test_photo_proof_required_for_success(monkeypatch,tmp_path,proved,expected):
    (tmp_path/'M-0142.jpg').write_bytes(b'fixture')
    patches=[]
    def db(method,resource,**kwargs):
        if method=='PATCH':patches.append(kwargs['json'])
        return types.SimpleNamespace(json=lambda:[{'instructions_agent':'fixture'}])
    fake=types.SimpleNamespace(DOSSIER_PHOTOS=tmp_path, AGENT_PAR_DEFAUT='fake',
        charger_mandat=lambda x:{}, ligne_execution=lambda x:{'session_id':'fake-session'},
        lancer=lambda *a,**k:{'reussi':True,'verification_base':{p:'ok' for p in w.PORTALS},'photo_prouvee':proved})
    monkeypatch.setitem(sys.modules,'lancer_agent',fake)
    monkeypatch.setattr(w,'db',db)
    monkeypatch.setenv('RESET_TOKEN','must-not-be-used')
    w.execute('one')
    assert patches[-1]['statut']==expected
    assert patches[-1]['review_required'] is (expected!='completed')
    assert patches[-1]['preuve']['photo_exacte'] is proved
    import os
    assert 'RESET_TOKEN' not in os.environ


def test_pending_wrong_source_is_never_executed(monkeypatch):
    monkeypatch.setattr(w,'db',lambda *a,**k:types.SimpleNamespace(json=lambda:[{'statut':'en_cours','resume':'CLOUD_PENDING'}]))
    assert w.Runner().start('one')==409


def test_http_routes_require_private_token(monkeypatch):
    import http.client
    monkeypatch.setattr(w,'settings',lambda:('https://db.invalid/',{},'x'*32))
    calls=[]
    monkeypatch.setattr(w,'db',lambda *a,**k: calls.append((a,k)) or types.SimpleNamespace(json=lambda:[{'id':'cloud'}]))
    server=w.ThreadingHTTPServer(('127.0.0.1',0),w.Handler)
    thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
    def request(method,path,token=None,body=None):
        conn=http.client.HTTPConnection('127.0.0.1',server.server_port,timeout=2)
        conn.request(method,path,body=body,headers={'Authorization':'Bearer '+token} if token else {})
        response=conn.getresponse();response.read();status=response.status;conn.close();return status
    try:
        assert request('GET','/healthz')==200
        assert request('GET','/ready')==401
        assert request('POST','/run',body='{}')==401
        assert calls==[]
        assert request('GET','/ready','x'*32)==200
        assert len(calls)==1
    finally:
        server.shutdown();server.server_close();thread.join()
