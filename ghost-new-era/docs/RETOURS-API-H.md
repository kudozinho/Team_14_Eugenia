# Retours sur l'API de H Company

Livrable du hackathon : ce qui a marché, ce qui a cassé, ce qui a surpris. À compléter au fil des tests ; on n'écrit que ce qui a été constaté.

## Holo (lecture d'écran), mesuré le 20/11/2026

- Modèle retenu : `holo4-27b`. Mesure sur 5 captures du site, 3 passages : 5 détections justes sur 5, latence médiane 1,8 à 1,9 s, maximum 3,8 s.
- `holo3-1-35b-a3b` : 4 détections justes sur 5 (déclenche à tort sur la fiche de Karim), latence médiane 2,3 s.
- Surprise : `holo4-27b` raisonne avant de répondre. Avec `max_tokens` à 400, il a été coupé avant d'écrire le JSON ; 1 200 règle le problème.
- Le champ « outils » renvoyé par Holo n'est pas fiable : la source de vérité reste les accords de la personne.
- Détail : [`agents/holo/README.md`](../agents/holo/README.md).

## Agents H, tests du 20/11/2026 (`agents/tests_h`, lecture seule sur l'intranet, agent `h/web-surfer-pro`, SDK `hai-agents`)

| Test | Résultat mesuré |
|---|---|
| **1. Une session** (fiche de Karim : poste et équipe) | Réponse juste (Commercial, Ventes), 33 s dont 11,5 s de démarrage |
| **2. Trois sessions en parallèle** (RH, messagerie, wiki) | Les 3 acceptées, démarrage en 0,5 s, **3 réponses justes sur 3**, 29 s au total contre 85 s de durées cumulées : le parallèle fonctionne, aucune limite rencontrée à 3 |
| **Vue en direct** | Lue dans la session côté H : champ `agent_view_url`, de la forme `https://platform.hcompany.ai/agents/sessions/<id>`. Page de la plateforme H : **non testée dans un cadre (iframe) de notre site** |
| **Crédits** | Quota de 60 000 000 de jetons sur le mois (16/11 au 16/12) ; 149 000 utilisés après ces tests. Environ 20 000 jetons d'entrée par session de 2 étapes |
| **3. Message envoyé à une session en cours** | Le message est accepté et la session repasse en « running », mais l'agent n'a produit **aucune nouvelle réponse** dans les 90 à 120 s, sur deux essais (demande hors du format de réponse, puis demande dans le format). **Non démontré** : le relais d'une question ou d'une réponse en cours de tâche reste à tester avec le vrai flux de l'Agent Accès |

## À explorer (non vérifié)

- L'état d'une session expose `pending_approvals` et `pending_tool_calls` : piste pour la **validation humaine** avant une action irréversible (commande de matériel).
- Statuts observés : `idle` (l'agent a répondu, la session reste ouverte pendant `idle_timeout_s`), puis `completed`.

## Ce qui a cassé / ce qui a surpris

- Le test 3 : voir ci-dessus.
- L'état de session (`status()`) ne contient pas l'adresse de la vue en direct : il faut relire la session avec `client.sessions.get_session(id)`.
