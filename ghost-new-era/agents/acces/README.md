# Agent Accès

Prépare l'arrivée d'une personne dans l'espace RH de l'intranet d'Atelier Nova : fiche, accès du poste, badge, demande de matériel. Chaque action est **vérifiée dans la base** (vue `v_onboarding`) pendant que l'agent travaille, et écrite dans `agents_runs`, `agents_evenements` et `decisions_humaines`.

```bash
cd ghost-new-era/agents/acces
cp .env.example .env     # HAI_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (jamais dans un commit)
../tests_h/.venv/bin/python -u acces.py --personne karim-benali --reset
```

- `--reset` remet Karim (données fictives de test) à zéro. `--manager "Claire Fontaine"` fournit le manager d'avance.
- Si le manager est vide, l'agent **pose la question** au lieu d'inventer : elle est enregistrée dans `decisions_humaines`. La réponse humaine (colonnes `statut = validee` et `reponse`) relance l'agent dans une deuxième session.
- L'agent ne valide **jamais** la commande de matériel : une décision humaine est créée.
