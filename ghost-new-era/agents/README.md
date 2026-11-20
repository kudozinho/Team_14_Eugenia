# Agents et lecture d'écran

| Dossier | Rôle | État |
|---|---|---|
| [`holo`](holo/README.md) | Lecture d'une capture d'écran par Holo (`holo4-27b`) : prompt validé, fonction serveur, mesures | Fait et mesuré (5 détections sur 5, environ 1,9 s) |
| [`hf`](hf/README.md) | Classement des pages du wiki par poste avec Hugging Face (agent Docs) | Fait et mesuré |
| [`tests_h`](tests_h/README.md) | Tests de l'API H : une session, trois en parallèle, vue en direct, quota | Fait (voir `docs/RETOURS-API-H.md`) |
| [`acces`](acces/README.md) | **Agent Accès** : fiche, accès du poste, badge, matériel en attente | Fait, vérifié dans la base (4 actions sur 4) |
| `equipe` | **Agent Équipe** : messages d'accueil, demande de parrain au manager, café d'accueil | Fait, vérifié dans la base (4 actions sur 4) |
| `docs` | **Agent Docs** : page « Bienvenue » (pages choisies par Hugging Face), checklist | Fait, vérifié dans la base (2 éléments sur 2) |
| `orchestrateur.py`, `serveur.py` | Lance les trois agents en parallèle dès qu'une proposition est acceptée ; `serveur.py` est le service hébergé (Render) | Orchestration testée ; hébergement à mettre en ligne |

## Orchestrateur

Le portail écrit `propositions.statut = acceptee` quand la personne dit oui. L'orchestrateur surveille la base, lance les agents en parallèle (un fil par agent), et chaque agent écrit ses événements dans `agents_evenements`. Le portail les affiche, avec la question de l'agent (`decisions_humaines`) et la validation de la commande de matériel. Il tourne sur un poste ou sur un service hébergé, **jamais sur Vercel** (durées maximales des fonctions).

```bash
cd ghost-new-era/agents
tests_h/.venv/bin/python -u orchestrateur.py                 # surveille en continu (clés dans acces/.env)
tests_h/.venv/bin/python -u orchestrateur.py --proposition <id> --manager "Claire Fontaine"   # test d'une proposition
```

Les agents n'agissent que dans les espaces de l'intranet autorisés par la session. Chaque action est vérifiée dans la base (vue `v_onboarding`). Aucune clé dans un fichier : variables d'environnement seulement.

## Hébergement (Render, offre gratuite)

Le service `serveur.py` surveille la base et lance les agents ; il répond aussi à `/sante` pour rester éveillé (le portail l'appelle pendant une session). Création : Render, « New Web Service », dépôt public `kudozinho/Team_14_Eugenia`, **Root Directory `ghost-new-era/agents`**, runtime Docker, offre gratuite. Variables d'environnement à saisir dans Render : `HAI_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `HF_TOKEN` (facultatif : sans lui, le classement des pages se replie sur le rôle cible et le dit).
