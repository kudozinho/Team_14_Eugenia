"""Test Hugging Face (GHOST New Era, Henriquet) : classer les pages du wiki selon le poste, par embeddings.

Lancement (PowerShell, depuis C:\\Users\\henri\\Ghost-demo-Windows) :
    .\\.venv\\Scripts\\python.exe holo_test\\test_hf_wiki.py

Le jeton HF_TOKEN est lu dans le fichier .env, jamais affiché.
Essaie plusieurs modèles d'embeddings multilingues via le routeur Hugging Face (Inference Providers),
garde ceux qui répondent, et mesure s'ils retrouvent les bonnes pages pour un commercial et une développeuse.
Résultat : tableau à l'écran et holo_test\\resultats_hf_wiki.json (sans jeton).
"""
import json
import math
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent
MODELES = [
    ("intfloat/multilingual-e5-large", "e5"),
    ("ibm-granite/granite-embedding-97m-multilingual-r2", "brut"),
]
# La requête est construite à partir des données de la base : poste, équipe et outils du catalogue d'accès.
POSTES = {
    "Commercial": {"equipe": "Ventes", "outils": ["CRM", "Devis", "Agenda partagé"]},
    "Développeuse": {"equipe": "Tech", "outils": ["Dépôt de code", "VPN", "Suivi de tickets"]},
}


def requete(poste, infos):
    return (f"Documents de l'espace {infos['equipe']} pour un nouveau {poste.lower()} : "
            f"son équipe {infos['equipe']}, ses outils de travail ({', '.join(infos['outils'])}) et ses méthodes.")


def jeton():
    if os.environ.get("HF_TOKEN"):
        return os.environ["HF_TOKEN"]
    for ligne in (RACINE / ".env").read_text(encoding="utf-8").splitlines():
        if ligne.startswith("HF_TOKEN="):
            return ligne.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("HF_TOKEN introuvable dans .env")


def embeddings(modele, textes, tok):
    url = f"https://router.huggingface.co/hf-inference/models/{modele}/pipeline/feature-extraction"
    req = urllib.request.Request(
        url,
        data=json.dumps({"inputs": textes}).encode("utf-8"),
        headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as rep:
            vecs = json.load(rep)
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HTTP {e.code} : {e.read().decode('utf-8', 'replace')[:200]}") from None
    sortie = []
    for v in vecs:  # certains modèles renvoient un vecteur par mot : on fait la moyenne
        if v and isinstance(v[0], list):
            v = [sum(c) / len(v) for c in zip(*v)]
        sortie.append(v)
    return sortie


def cosinus(a, b):
    na = math.sqrt(sum(x * x for x in a)) or 1.0
    nb = math.sqrt(sum(x * x for x in b)) or 1.0
    return sum(x * y for x, y in zip(a, b)) / (na * nb)


def main():
    tok = jeton()
    pages = json.loads((ICI / "wiki_pages.json").read_text(encoding="utf-8"))
    pages = [p for p in pages if not p["titre"].lower().startswith("bienvenue")]
    resultats = {}
    for modele, style in MODELES:
        prefixe_doc = "passage: " if style == "e5" else ""
        prefixe_req = "query: " if style == "e5" else ""
        docs = [f"{prefixe_doc}Espace {p['espace']}. {p['titre']}. Mots-clés : {', '.join(p['tags'])}. {p['contenu']}" for p in pages]
        debut = time.time()
        try:
            vecs = embeddings(modele, docs, tok)
            latence_pages = round((time.time() - debut) * 1000)
        except Exception as e:
            print(f"{modele} : indisponible ({e})")
            resultats[modele] = {"erreur": str(e)}
            continue
        r = {"latence_16_pages_ms": latence_pages, "dimension": len(vecs[0]), "postes": {}}
        for poste, infos in POSTES.items():
            t = time.time()
            q = embeddings(modele, [prefixe_req + requete(poste, infos)], tok)[0]
            scores = sorted(
                ((round(cosinus(q, v), 4), p["titre"], p["role_cible"]) for v, p in zip(vecs, pages)), reverse=True
            )
            top5 = scores[:5]
            justes = sum(1 for _, _, role in top5 if role == poste)
            r["postes"][poste] = {
                "latence_requete_ms": round((time.time() - t) * 1000),
                "top5": [{"titre": ti, "score": s, "role": ro} for s, ti, ro in top5],
                "pages_du_bon_role_dans_top5": justes,
            }
            print(f"\n{modele} · {poste} : {justes}/5 pages du bon rôle")
            for s, ti, ro in top5:
                print(f"   {s:.3f}  {ti}  ({ro})")
        print(f"   latence : {latence_pages} ms pour {len(pages)} pages, dimension {r['dimension']}")
        resultats[modele] = r
    (ICI / "resultats_hf_wiki.json").write_text(json.dumps(resultats, ensure_ascii=False, indent=2), encoding="utf-8")
    print("\nRésultats écrits dans holo_test\\resultats_hf_wiki.json")


if __name__ == "__main__":
    main()
