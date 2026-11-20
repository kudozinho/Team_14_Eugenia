# Agents et lecture d'écran

| Dossier | Rôle | État |
|---|---|---|
| [`holo`](holo/README.md) | Lecture d'une capture d'écran par Holo (`holo4-27b`) : prompt validé, fonction serveur, mesures | Fait et mesuré (5 détections sur 5, environ 1,9 s) |
| [`hf`](hf/README.md) | Classement des pages du wiki par poste avec Hugging Face (agent Docs) | Fait et mesuré |
| `acces`, `equipe`, `docs` | Les trois agents H qui agissent dans l'intranet | **À faire** |
| orchestration | Lancer les trois sessions en parallèle, écrire les événements, relayer questions et validations | **À faire** |

Les agents n'agissent que dans les espaces de l'intranet autorisés par la session. Chaque action est vérifiée dans la base (vue `v_onboarding`). Aucune clé dans un fichier : variables d'environnement seulement.
