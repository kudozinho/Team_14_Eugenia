# Service H permanent — raccordement au dashboard

État : code prêt à intégrer ; hébergement et recette réelle non validés. Ne pas annoncer une disponibilité publique avant la recette.

## Architecture

Navigateur → Next `/api/prouver` → RPC Supabase `demander_agent` → worker Docker permanent → API H (navigateur hébergé) → portails fictifs A/B/C → vérification par `portails.py` → même ligne `executions_agent` → interface.

L’onglet `/agent-h` est en tête de navigation et accessible depuis l’accueil. Le Recorder reste sur le PC d’Henriquet : l’exécution H ne requiert plus le listener local. L’observation produit les consignes ; H exécute la tâche et le code vérifie les champs publiés. La vérification photo exacte de la PR #63 reste une dépendance à intégrer, ne pas présenter le contrôle actuel comme une comparaison de fichier.

## Activation

1. Henriquet : appliquer `commun/migrations/20261119_agent_heberge.sql` dans le projet Supabase existant. La RPC n’est exécutable que par `service_role`. Elle refuse si heartbeat absent depuis 20 s ou si une ligne est déjà en cours.
2. Vladimir : utiliser un hébergement de processus permanent (serveur ou service worker Docker), une seule réplique, sans mise en veille, redémarrage automatique. Construire depuis la racine : `docker build -f deploy/agent-h/Dockerfile -t ghost-agent-h .` puis lancer l’image avec les secrets injectés par l’hébergeur. Aucun secret dans Git ou dans les arguments publics. Vercel continue de servir Next ; ne pas y lancer cette boucle permanente.
3. Variables privées du worker : `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `HAI_API_KEY`, `TACHE_ID=tache_a1a0c7545c805f328eba1e25`. Facultatives : `PORTAIL_A_URL`, `PORTAIL_B_URL`, `PORTAIL_C_URL`. Ne pas donner `RESET_TOKEN` : le worker ne supprime pas les annonces.
4. Variables privées du dashboard Vercel : mêmes URL, service role et TACHE_ID ; `PROUVER_CODE` aléatoire de 16 caractères minimum, communiqué en privé au jury. La clé H reste exclusivement dans le worker. Redéployer le dashboard après fusion.
5. Couper l’ancien `attendre_prouver.py` pendant la recette pour éviter les essais parallèles historiques. Les demandes cloud sont marquées `CLOUD_PENDING`, donc non consommées par son filtre `resume IS NULL`.

## Recette nécessaire avant annonce

- Sans service : clic refusé, aucune simulation et aucune demande créée.
- Avec service et code invalide : refus ; avec code valide : un identifiant de demande, session H réelle, puis les publications créées après le clic et les valeurs exactes.
- Deux clics simultanés : une seule demande acceptée (verrou transactionnel en base).
- Fermer le PC d’Henriquet : la démonstration H doit encore fonctionner depuis un autre navigateur.
- Comparer chaque champ, vérifier la photo selon la PR #63, noter session et durée. Pas d’estimation annuelle présentée comme mesure de cet essai.
- Couper réseau/worker : pas de réussite inventée. La limite locale est de 600 s. Une session H distante peut encore finir après interruption : vérifier avant tout nouvel essai.

## Reprise après panne

Aucune relance automatique d’une tâche déjà prise : une publication a pu se produire. Après crash ou arrêt du conteneur, la ligne en cours peut rester bloquante. Alejandro vérifie la session H et les annonces, puis Henriquet clôt manuellement CET identifiant en `interrupted` et avec un résumé explicite avant une nouvelle demande. Ne jamais remettre la ligne en attente ni purger globalement les publications. Le heartbeat indique la présence du worker, pas la santé de l’API H.

## Répartition

- Vladimir : hébergement permanent, secrets, déploiement Next et URL/commit confirmés.
- Henriquet : migration, droits, recette depuis un PC sans listener local.
- Alejandro : session H, PR #63, limites et reprise après incident.
- Binta : parcours agent en premier, cohérence résultat/rapport, états d’attente et d’échec.
- Omar : consignes de la tâche réelle et provenance des données ; conserver les chiffres validés et les réserves sur les gains.
