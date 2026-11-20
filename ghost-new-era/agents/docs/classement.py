"""Classement des pages du wiki par poste : embeddings Hugging Face (même méthode que agents/hf/meilleuresPages.ts).
Repli honnête sur l'étiquette role_cible si Hugging Face ne répond pas (signalé dans « source »)."""
import json
import math
import os
import re
import ssl
import sys
import time
import urllib.parse
import urllib.request

import certifi

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
from commun import lire  # noqa: E402

MODELE = os.environ.get("HF_EMBEDDINGS_MODELE", "ibm-granite/granite-embedding-97m-multilingual-r2")
CTX = ssl.create_default_context(cafile=certifi.where())


def _embeddings(textes, jeton):
    url = f"https://router.huggingface.co/hf-inference/models/{MODELE}/pipeline/feature-extraction"
    req = urllib.request.Request(url, data=json.dumps({"inputs": textes}).encode(),
                                 headers={"Authorization": f"Bearer {jeton}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=120, context=CTX) as r:
        vecs = json.load(r)
    return [[sum(x) / len(v) for x in zip(*v)] if v and isinstance(v[0], list) else v for v in vecs]


def _cos(a, b):
    na, nb = math.sqrt(sum(x * x for x in a)) or 1.0, math.sqrt(sum(x * x for x in b)) or 1.0
    return sum(x * y for x, y in zip(a, b)) / (na * nb)


def meilleures_pages(poste, equipe, combien=5):
    debut = time.time()
    pages = [p for p in lire("wiki_pages?select=id,titre,espace,role_cible,tags,contenu") if not re.match(r"(?i)bienvenue", p["titre"])]
    outils = ", ".join(a["outil"] for a in lire(f"catalogue_acces?poste=eq.{urllib.parse.quote(poste)}&select=outil"))
    requete = f"Documents de l'espace {equipe} pour un nouveau {poste.lower()} : son équipe {equipe}, ses outils de travail ({outils}) et ses méthodes."
    jeton = os.environ.get("HF_TOKEN")
    try:
        if not jeton:
            raise RuntimeError("HF_TOKEN absent")
        textes = [f"Espace {p['espace']}. {p['titre']}. Mots-clés : {', '.join(p.get('tags') or [])}. {p['contenu']}" for p in pages]
        q, *docs = _embeddings([requete, *textes], jeton)
        top = sorted(((round(_cos(q, d), 3), p) for p, d in zip(pages, docs)), key=lambda x: -x[0])[:combien]
        return {"titres": [p["titre"] for _, p in top], "source": "huggingface", "modele": MODELE, "latence_ms": round((time.time() - debut) * 1000)}
    except Exception as e:  # noqa: BLE001
        repli = [p for p in pages if p["role_cible"] == poste] + [p for p in pages if p["role_cible"] == "Tous"]
        return {"titres": [p["titre"] for p in repli[:combien]], "source": f"repli_role_cible ({type(e).__name__})", "modele": MODELE,
                "latence_ms": round((time.time() - debut) * 1000)}
