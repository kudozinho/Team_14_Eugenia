"""Test Holo (GHOST New Era, Henriquet) : lecture de 5 captures de l'intranet par le modèle de H Company.

Lancement (PowerShell, depuis C:\\Users\\henri\\Ghost-demo-Windows) :
    .\\.venv\\Scripts\\python.exe holo_test\\test_holo.py

La clé HAI_API_KEY est lue dans le fichier .env, jamais affichée ni écrite ailleurs.
Résultat : un tableau à l'écran et le fichier holo_test\\resultats_holo.json (sans clé).
"""
import base64
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent
URL = "https://api.hcompany.ai/v1"
MODELE = os.environ.get("HOLO_MODELE", "holo3-1-35b-a3b")

# Attendu pour chaque capture : la seule qui doit déclencher, c'est la notification de Karim.
CAPTURES = {
    "1_landing_haut.jpg": None,
    "2_landing_exemple_karim.jpg": None,
    "3_rh_notification_karim.jpg": "arrivee_karim",
    "4_rh_fiche_lea.jpg": None,
    "5_rh_fiche_karim.jpg": None,
}


def cle():
    if os.environ.get("HAI_API_KEY"):
        return os.environ["HAI_API_KEY"]
    for ligne in (RACINE / ".env").read_text(encoding="utf-8").splitlines():
        if ligne.startswith("HAI_API_KEY="):
            return ligne.split("=", 1)[1].strip().strip('"').strip("'")
    sys.exit("HAI_API_KEY introuvable dans .env")


def appel(route, cle_api, charge=None, delai=120):
    donnees = json.dumps(charge).encode("utf-8") if charge is not None else None
    req = urllib.request.Request(
        URL + route,
        data=donnees,
        headers={"Authorization": f"Bearer {cle_api}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=delai) as rep:
            return json.load(rep)
    except urllib.error.HTTPError as e:
        corps = e.read().decode("utf-8", "replace")[:300]
        raise RuntimeError(f"HTTP {e.code} : {corps}") from None


def extraire_json(texte):
    texte = texte.strip()
    texte = re.sub(r"^```(?:json)?|```$", "", texte, flags=re.M).strip()
    debut, fin = texte.find("{"), texte.rfind("}")
    return json.loads(texte[debut : fin + 1])


def main():
    cle_api = cle()
    modeles = sorted(m["id"] for m in appel("/models", cle_api, delai=30)["data"])
    print("Modèles accessibles :", ", ".join(modeles))
    if MODELE not in modeles:
        sys.exit(f"Le modèle {MODELE} n'est pas accessible avec cette clé.")

    prompt = (ICI / "prompt_holo.txt").read_text(encoding="utf-8")
    resultats = []
    for nom, attendu in CAPTURES.items():
        image = base64.b64encode((ICI / nom).read_bytes()).decode()
        charge = {
            "model": MODELE,
            "temperature": 0,
            "max_tokens": 1200,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": prompt},
                        {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{image}"}},
                    ],
                }
            ],
        }
        debut = time.time()
        ligne = {"capture": nom, "attendu": attendu}
        try:
            rep = appel("/chat/completions", cle_api, charge)
            ligne["latence_ms"] = round((time.time() - debut) * 1000)
            texte = rep["choices"][0]["message"]["content"] or ""
            ligne["usage"] = rep.get("usage")
            try:
                obj = extraire_json(texte)
                ligne["json_valide"] = set(obj) == {"tache", "outils", "confiance", "declencheur", "resume"}
                ligne["reponse"] = obj
                ligne["declencheur_correct"] = obj.get("declencheur") == attendu
            except Exception:
                ligne["json_valide"] = False
                ligne["reponse_brute"] = texte[:500]
                ligne["declencheur_correct"] = False
        except Exception as e:
            ligne["latence_ms"] = round((time.time() - debut) * 1000)
            ligne["erreur"] = str(e)[:300]
            ligne["json_valide"] = False
            ligne["declencheur_correct"] = False
        resultats.append(ligne)
        print(
            f"{nom:32} {ligne['latence_ms']/1000:6.1f} s  JSON {'ok' if ligne['json_valide'] else 'NON'}  "
            f"déclencheur {'ok' if ligne['declencheur_correct'] else 'FAUX'}"
            + (f"  ERREUR {ligne['erreur']}" if "erreur" in ligne else "")
        )

    latences = sorted(r["latence_ms"] for r in resultats if "erreur" not in r)
    bilan = {
        "modele": MODELE,
        "captures": len(resultats),
        "json_valides": sum(r["json_valide"] for r in resultats),
        "declencheurs_corrects": sum(r["declencheur_correct"] for r in resultats),
        "latence_mediane_ms": latences[len(latences) // 2] if latences else None,
        "latence_max_ms": max(latences) if latences else None,
    }
    print("\nBILAN :", json.dumps(bilan, ensure_ascii=False))
    (ICI / f"resultats_holo_{MODELE}.json").write_text(
        json.dumps({"bilan": bilan, "resultats": resultats}, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    print("Résultats écrits dans holo_test\\resultats_holo.json")


if __name__ == "__main__":
    main()
