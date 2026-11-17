"""Test de connexion à la base Ghost : 1 lecture + 1 écriture (supprimée aussitôt).

Chacun le lance une fois pour valider le branchement « Base ouverte à tous » (mardi 12h).

    pip install supabase python-dotenv
    python henriquet-cdo/supabase/test_connexion.py

Variables à mettre dans le fichier .env à la racine (jamais sur GitHub) :
    SUPABASE_URL=https://bvxmnrvqehemqsjiasdr.supabase.co
    SUPABASE_SERVICE_KEY=<clé service_role, envoyée en privé par Henriquet>
"""
import os
import socket

from dotenv import load_dotenv
from supabase import create_client

load_dotenv()
url = os.getenv("SUPABASE_URL")
cle = os.getenv("SUPABASE_SERVICE_KEY")
if not url or not cle:
    raise SystemExit("SUPABASE_URL ou SUPABASE_SERVICE_KEY manquante dans .env")

sb = create_client(url, cle)

# Lecture
org = sb.table("organisations").select("id, nom").execute().data
print("Lecture OK :", org)

# Écriture puis suppression
poste = socket.gethostname()
ligne = sb.table("annonces_portails").insert({"portail": "test_connexion", "titre": f"test depuis {poste}"}).execute().data[0]
sb.table("annonces_portails").delete().eq("id", ligne["id"]).execute()
print("Écriture OK (ligne de test créée puis supprimée)")
print("Branchement validé pour", poste)
