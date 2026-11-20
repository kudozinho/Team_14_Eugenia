# Tests H (lecture seule)

Vérifie ce dont les agents ont besoin avant d'écrire l'Agent Accès : une session, trois sessions en parallèle, l'adresse de la vue en direct, l'envoi d'un message à une session en cours, la durée et les erreurs. Les tests ne modifient aucune donnée de l'intranet.

```bash
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
cp .env.example .env   # coller HAI_API_KEY (jamais dans un commit ni un message)
.venv/bin/python tests_h.py 1   # une session
.venv/bin/python tests_h.py 2   # trois en parallèle
.venv/bin/python tests_h.py 3   # message à une session en cours
```

Résultats à reporter dans [`docs/RETOURS-API-H.md`](../../docs/RETOURS-API-H.md).
