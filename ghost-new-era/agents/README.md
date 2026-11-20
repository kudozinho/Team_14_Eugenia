# Agents et lecture d'écran

| Dossier | Rôle | État |
|---|---|---|
| [`holo`](holo/README.md) | Lecture d'une capture d'écran par Holo (`holo4-27b`) : prompt validé, fonction serveur, mesures | Fait et mesuré (5 détections sur 5, environ 1,9 s) |
| [`hf`](hf/README.md) | Classement des pages du wiki par poste avec Hugging Face (agent Docs) | Fait et mesuré |
| [`tests_h`](tests_h/README.md) | Tests de l'API H : une session, trois en parallèle, vue en direct, quota | Fait (voir `docs/RETOURS-API-H.md`) |
| [`acces`](acces/README.md) | **Agent Accès** : fiche, accès du poste, badge, matériel en attente | Fait, vérifié dans la base (4 actions sur 4) |
| `equipe`, `docs` | Agents Équipe (messagerie) et Docs (wiki) | **À faire** (jamais simulés) |
| `orchestrateur.py` | Lance les agents dès qu'une proposition est acceptée dans le portail | Fait pour l'Agent Accès |

## Orchestrateur

Le portail écrit `propositions.statut = acceptee` quand la personne dit oui. L'orchestrateur surveille la base, lance les agents en parallèle (un fil par agent), et chaque agent écrit ses événements dans `agents_evenements`. Le portail les affiche, avec la question de l'agent (`decisions_humaines`) et la validation de la commande de matériel. Il tourne sur un poste ou sur un service hébergé, **jamais sur Vercel** (durées maximales des fonctions).

```bash
cd ghost-new-era/agents
tests_h/.venv/bin/python -u orchestrateur.py                 # surveille en continu (clés dans acces/.env)
tests_h/.venv/bin/python -u orchestrateur.py --proposition <id> --manager "Claire Fontaine"   # test d'une proposition
```

Les agents n'agissent que dans les espaces de l'intranet autorisés par la session. Chaque action est vérifiée dans la base (vue `v_onboarding`). Aucune clé dans un fichier : variables d'environnement seulement.
