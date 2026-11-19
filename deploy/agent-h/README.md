# Agent H sur service HTTP gratuit — mise en ligne

Le raccord est du code, pas une preuve de déploiement. La recette H réelle reste nécessaire. Aucun test ci-dessous ne doit recharger des crédits ou purger les annonces. Les compléments agent/photo de la PR #63 sont repris ici ; son reste Recorder et ses supports restent distincts.

## Architecture et parcours

Vercel `/agent-h` → API Next protégée par PROUVER_CODE → `/ready` du service HTTP Render Free → RPC privée `demander_agent_http` → `/run` → navigateur distant H → vérification des valeurs et de l’empreinte photo → même demande Supabase → interface.

Le Recorder reste local pour observer avec consentement. L’exécution H ne requiert aucun poste allumé après déploiement Render. Le service HTTP se réveille sur trafic ; aucune boucle permanente de scrutation n’est nécessaire. Le navigateur relit sa demande toutes les 5 s. Les limites du gratuit sont explicites : sommeil, premier réveil et redémarrages possibles. Pas de garantie de disponibilité permanente.

## Déploiement par Vladimir et Henriquet

1. Relire/appliquer d’abord `commun/migrations/20261119_agent_heberge.sql` (déjà appliquée selon Henriquet), puis **`commun/migrations/20261119_agent_http.sql`**. Les ajouts conservent l’historique. Toutes les commandes sont service_role uniquement. La fonction historique reste pour compatibilité mais n’est pas utilisée par le nouveau site.
2. Créer un **Web Service Free** depuis le dépôt, avec le `render.yaml` racine (ou Dockerfile `deploy/agent-h/Dockerfile`, contexte racine). Auto-déploiements désactivés. Ne pas choisir un Background Worker payant. Le fichier fixe `plan: free`. Pas de disque, base ou cron supplémentaire. Si la plateforme demande de payer, arrêter et signaler le blocage. [Déployer](https://render.com/deploy?repo=https://github.com/kudozinho/Team_14_Eugenia) — après fusion sur main, ou sélectionner explicitement la branche #66 pour la prérecette.
3. Secrets Render : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, HAI_API_KEY, GHOST_WORKER_TOKEN (nouveau secret aléatoire ≥32 caractères). TACHE_ID doit être exactement `tache_a1a0c7545c805f328eba1e25`. Ne pas fournir RESET_TOKEN. La photo M-0142.jpg est copiée dans l’image.
4. Variables serveur Vercel : SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, TACHE_ID identique, PROUVER_CODE (≥16 caractères), **GHOST_WORKER_URL** (URL HTTPS Render sans chemin), **GHOST_WORKER_TOKEN** identique. Aucun préfixe NEXT_PUBLIC, aucune clé H sur Vercel. Préserver les variables du portail client existant. Redéployer après revue/fusion.
5. `/healthz` confirme seulement que le processus HTTP écoute. `/ready`, protégé par le secret, vérifie le raccord Supabase et renouvelle le heartbeat. Aucun de ces endpoints n’appelle H. Un site non configuré refuse le lancement ; il ne simule jamais de réussite.

## Budget : fermé par défaut

La migration initialise `agent_worker.remaining_runs` à 0 et `credits_confirmed_until` à null. Aucun clic ne peut alors appeler H (402). Le système ne recharge rien, mais il ne peut pas prouver seul le solde ni l’absence d’auto-recharge chez H.

Après vérification humaine du solde H existant, des plafonds et de l’absence de recharge, le responsable peut autoriser un nombre limité d’essais et une courte fenêtre via Supabase privée. Exemple **à exécuter uniquement après cette confirmation et coordination**, pas pendant l’installation :

```sql
update public.agent_worker
set remaining_runs=1, credits_confirmed_until=now()+interval '30 minutes'
where id='cloud';
```

Chaque nouvelle clé réserve un essai dans la même transaction que la demande. Retrouver la même clé ne réserve rien de plus. Les corrections internes H peuvent consommer plusieurs actions ; ce compteur est un plafond d’essais, pas un solde en euros. Si le crédit est inconnu, laisser 0. Ne jamais augmenter automatiquement ce budget après erreur.

## Reprise et sécurité

- Une clé UUID conservée dans la session navigateur identifie l’intention ; le code d’accès reste en mémoire seulement. Après rechargement : ressaisir le code puis « Retrouver ma demande ». Le POST retrouve d’abord la demande ; un GET par clé protégé existe aussi.
- Le verrou transactionnel, l’unicité de cle_demande et la prise atomique HTTP_PENDING empêchent les doubles exécutions. L’ancien worker CLOUD_PENDING ne peut pas prendre ces demandes. Couper néanmoins les anciens listeners et le worker PC pendant la recette indépendante des postes.
- Après timeout/crash, aucune reprise d’une demande déjà prise. La session H peut continuer à distance. Une ligne en_cours ou review_required bloque les nouvelles demandes jusqu’à revue humaine. Inspecter la session et les annonces ; clôturer CET identifiant et lever review_required seulement après contrôle, sans remise en attente ni purge globale.
- Durée du sous-processus bornée à 600 s. Les étapes session/contrôle sont écrites dans la même ligne. Un résultat n’est completed/verification=ok que si les champs des trois portails et la photo exacte sont prouvés. Stockage photo illisible = non vérifié, jamais succès.

## Recette avant annonce publique

1. Configuration absente, mauvais code, tâche différente, crédit inconnu : refus sans H.
2. Réveil d’un service endormi : attente visible, aucune simulation.
3. Deux appels avec la même clé, réponse perdue et reprise : même ID, un seul essai débité et une seule prise. Deux clés simultanées : une seule admission.
4. Après autorisation coordonnée d’un essai sur les crédits existants : relever ID de demande, session, heure, valeurs publiées et SHA-256 photo, durée. Omar contre-vérifie les preuves.
5. Éteindre les PC exécuteurs locaux ; le lancement depuis un autre appareil doit encore fonctionner.
6. Couper le service pendant une exécution : aucun succès inventé ni relance automatique. Vérifier la procédure de reprise.

Tests locaux : `python -m pytest deploy/agent-h/test_worker.py alejandro-cto/agent-h/tests` ; dans ghost-ui `node tests/prouver.cjs`, TypeScript et build. Les tests utilisent des doubles : ils ne prouvent ni l’application de la migration dans Supabase, ni l’image Docker, ni le déploiement Render, ni un appel H réel. Le scénario SQL a aussi passé sur PostgreSQL embarqué PGlite, dans une base temporaire en mémoire (sans test multi-connexion). Les nouveaux tests passent localement. Le jeton GitHub ne permet pas de modifier les workflows : `ci-verifications.patch` est fourni pour un mainteneur autorisé. `test_queue.sql` doit être exécuté sur une base PostgreSQL jetable vide, jamais sur Supabase partagé ; il vérifie migration rejouable, droits, budget et récupération de clé. La CI existante continue de compiler les applications.
