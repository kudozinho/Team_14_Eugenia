"""Worker permanent : consomme les clics du site ; aucun enregistrement de poste."""
import os
import sys
import time
import subprocess
from pathlib import Path
import requests

ROOT=Path('/app/alejandro-cto/agent-h')
sys.path.insert(0,str(ROOT))
def demandes_en_attente():
    r=requests.get(base+'executions_agent', params={'statut':'eq.en_cours','resume':'eq.CLOUD_PENDING','tache_id':'eq.'+task,'select':'id,tache_id','order':'cree_le'},headers=headers,timeout=10)
    r.raise_for_status()
    return r.json()

def prendre(identity):
    r=requests.patch(base+'executions_agent',params={'id':'eq.'+identity,'statut':'eq.en_cours','resume':'eq.CLOUD_PENDING'},headers=headers|{'Prefer':'return=representation'},json={'resume':'Agent H hébergé : exécution en cours.'},timeout=10)
    r.raise_for_status()
    return bool(r.json())

base=os.environ['SUPABASE_URL'].rstrip('/')+'/rest/v1/'
key=os.environ['SUPABASE_SERVICE_ROLE_KEY']
headers={'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json'}
task=os.environ['TACHE_ID']
if not os.environ.get('HAI_API_KEY'):
    raise SystemExit('HAI_API_KEY manquante')
# Ne jamais effacer les publications d’autres essais depuis le service public.
os.environ.pop('RESET_TOKEN',None)
active=None
started=0

def patch(identity,values):
    r=requests.patch(base+'executions_agent',params={'id':'eq.'+identity},headers=headers,json=values,timeout=10)
    r.raise_for_status()

if len(sys.argv)>1:
    from lancer_agent import lancer, charger_mandat, ecrire_resultat, AGENT_PAR_DEFAUT
    identity,tid=sys.argv[1:3]
    try:
        result=lancer(tid,['Portail A','Portail B','Portail C'],AGENT_PAR_DEFAUT,charger_mandat('M-0142'),'publie')
        ecrire_resultat(result,identity)
        # L’écriture existante ne lève pas toujours : ne jamais laisser un faux « en cours ».
        r=requests.get(base+'executions_agent',params={'id':'eq.'+identity,'select':'statut'},headers=headers,timeout=10)
        r.raise_for_status()
        if r.json()[0]['statut']=='en_cours':
            patch(identity,{'statut':'failed','resume':'Résultat non enregistré ; vérification requise.'})
    except Exception:
        patch(identity,{'statut':'failed','resume':'Exécution ou vérification impossible ; contactez l’équipe.'})
    raise SystemExit()

while True:
    try:
        r=requests.post(base+'agent_worker?on_conflict=id',headers=headers|{'Prefer':'resolution=merge-duplicates'},json={'id':'cloud','heartbeat':__import__('datetime').datetime.now(__import__('datetime').timezone.utc).isoformat()},timeout=10)
        r.raise_for_status()
        if active:
            process,identity=active
            if time.monotonic()-started>600:
                process.kill();process.wait()
                patch(identity,{'statut':'failed','resume':'Délai dépassé ; vérifier les publications avant une nouvelle tentative.'});active=None
            elif process.poll() is not None:
                if process.returncode:
                    patch(identity,{'statut':'failed','resume':'Worker interrompu ; vérifier les publications.'})
                active=None
        if not active:
            for request in demandes_en_attente():
                if request['tache_id']==task and prendre(request['id']):
                    active=(subprocess.Popen([sys.executable,__file__,request['id'],task]),request['id'])
                    started=time.monotonic();break
    except requests.RequestException:
        print('Liaison base indisponible ; nouvelle tentative sans révéler les détails réseau.',flush=True)
    time.sleep(3)
