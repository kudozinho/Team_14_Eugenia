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

## Agent Accès, premier run réel sur Karim (20/11/2026, `agents/acces`)

- **Question du manager** : manager vide, l'agent s'arrête en 22 s et pose la question au lieu d'inventer.
- **Reprise** : réponse humaine (Claire Fontaine) enregistrée, deuxième session H lancée avec la réponse : fiche créée en 27 s, accès demandés 16 s plus tard, badge 18 s plus tard, demande de matériel 24 s plus tard. Environ 85 s d'agent après la réponse.
- **Vérification** : 4 actions sur 4 confirmées dans la base (`v_onboarding` : fiche, accès, badge à vrai ; matériel en attente de validation humaine, jamais validé par l'agent). Aucun faux succès.
- Un seul run : à répéter pour avoir un taux de réussite.

## À explorer (non vérifié)

- L'état d'une session expose `pending_approvals` et `pending_tool_calls` : piste pour la **validation humaine** avant une action irréversible (commande de matériel).
- Statuts observés : `idle` (l'agent a répondu, la session reste ouverte pendant `idle_timeout_s`), puis `completed`.

## Ce qui a cassé / ce qui a surpris

- Le test 3 : voir ci-dessus.
- L'état de session (`status()`) ne contient pas l'adresse de la vue en direct : il faut relire la session avec `client.sessions.get_session(id)`.

## Constats du 20/11 (matin)

- **Vue en direct** : la page de vue de H interdit l'intégration en cadre (`X-Frame-Options: DENY`). Les événements de session contiennent en revanche chaque capture d'écran de l'agent (`observation_event`) et chaque action avec coordonnées et élément visé (`policy_event`, `tool_reqs`) : on peut reconstruire une vue en direct avec un point sur chaque clic. Les captures se lisent avec `sessions.get_session_resource`.
- **Agents personnalisés** : propres à chaque compte H. Un agent créé avec une clé n'existe pas avec la clé d'un autre compte (erreur 404) : prévoir un repli sur l'agent prêt à l'emploi.
- **Coffre-fort** : `vaults` (hébergé par H) accepte les champs `username`, `password`, `email`, `totp`, `api_key` ; les valeurs ne sont jamais relues (seules les métadonnées le sont), et un navigateur d'agent s'y lie par `vault_id`. Rattachement à une session d'agent non testé.
- **Quota** : 60 millions de jetons par mois ; environ 546 000 jetons par onboarding complet (3 agents).
- **Parallélisme** : trois sessions en parallèle acceptées sans limite rencontrée ; 9 runs complets réussis.
- **Cassé ou surprenant** : certificats SSL de Python sur macOS (utiliser `certifi`) ; clé API refusée (401) quand elle est mal collée ; envoi d'un message à une session en cours non démontré.
