# Ghost : H Company présent du début à la fin de l'audit

## Contexte et objectif
Les professeurs ont jugé l'idée de base de Ghost bonne, mais sa mise en œuvre insuffisante : H Company n'agit qu'à la fin (clic « Prouver »), le parcours est confus (trop d'onglets), les données sont en partie simulées et la finition est faible. Le PDF du hackathon note 30 % « Excellence technique et Agents API » et pose comme critère n°1 une démo live, sur un vrai cas, avec l'agent qui tourne. Objectif : refaire le site et le portail pour que H soit présent à trois moments (il observe, il propose, il agit après accord), dans une démo vendredi 20/11. Binta est CEO, avec Henriquet en collaboration étroite.

## Solution retenue
Ghost est un assistant présent pendant que la personne travaille, pas un écran de propositions affiché à la fin.

Parcours de démo (l'agent H doit être en action moins d'une minute après le début) :
1. **Accord par outil** : la personne coche chaque outil autorisé. Seuls ces outils sont observés, et seuls ces outils peuvent être utilisés par les agents H.
2. **Vocal facultatif** : un bouton visible permet d'expliquer en quelques phrases ce qu'elle fait. La démo fonctionne sans.
3. **Observation visible** : partage d'écran du navigateur dans le site Next.js, avec une pastille toujours affichée et un bouton pause. Holo lit les images. Rien n'est préenregistré.
4. **Intervention** : 10 s en général, 30 s au maximum après la reconnaissance de la tâche. Message du type « Tu refais la même chose, je m'en occupe ? ». Pas d'analyse en lot à la fin.
5. **Accord ou refus** : si elle refuse, elle continue son travail.
6. **Action en direct** : les agents H passent à l'action, on voit leurs écrans (vue en direct). Chaque action est vérifiée dans l'outil.
7. **Résultat chiffré**.

Persona et cas de démo : l'office manager ou la RH d'une PME de 50 personnes. Chaque arrivée lui prend environ 2 h dans 5 outils. Ghost l'observe préparer l'arrivée de Léa (développeuse). Quand la notification d'arrivée de Karim (commercial) apparaît dans l'espace RH de l'intranet, Ghost la lit à l'écran et propose : « Je prépare tout l'onboarding de Karim comme pour Léa ? ». Après accord, 3 agents H partent en parallèle :
- **Agent Accès** (logiciel RH et portail des badges) : fiche, accès adaptés au poste, demande de badge.
- **Agent Équipe** (messagerie d'entreprise façon Slack ou Teams) : message de bienvenue dans le bon canal, demande d'un parrain au manager, créneau pour le café d'accueil.
- **Agent Docs** (wiki interne façon Notion) : documents utiles à un commercial, page « Bienvenue Karim » avec checklist jour 1, semaine 1, mois 1.

Comportements de l'agent : il adapte tout au poste. Il pose une question quand une info manque (ex. manager non renseigné) au lieu d'inventer. Il s'arrête avant toute action irréversible (la commande de l'ordinateur attend la validation).

Choix de l'outil : API ouverte (Slack, Teams, Notion réels) → automatisation n8n ; pas d'API (logiciel RH, portail des badges, outils internes anciens) → agents H. Dans la démo, l'intranet de test est présenté comme un ensemble d'outils maison sans API, avec 3 espaces (RH et badges, messagerie, wiki), pas comme les vrais outils.

Valeur au-delà de l'onboarding : l'onboarding est le cas de démo ; Ghost détecte ensuite toute tâche multi-outils. C'est la réponse à la remarque « une PME de 50 personnes n'a que quelques arrivées par an ».

## Périmètre
**Inclus :**
- Refonte complète : site Next.js, portail client (connexion et audit du salarié), Supabase (schéma, auth, données), déploiement Vercel.
- Vue de la personne qui se connecte : le salarié audité.
- Pastille d'observation, bouton pause, accord par outil, vocal facultatif.
- Lecture des captures par Holo côté serveur et intervention en direct.
- 3 agents H en parallèle dans le navigateur hébergé de H, avec vue en direct.
- Intranet de test unique à 3 espaces, données 100 % fictives (Henriquet).
- Tableau de suivi qui se coche pendant l'exécution.
- Vidéo d'un vrai run complet enregistrée à l'avance (plan B et vidéo démo de 5 min).
- Teaser de quelques secondes de l'agent en action au tout début, facultatif.

**Exclu (pour l'instant) :**
- Agents H sur le poste local (`Client.local()`, desktop) et outils comme WhatsApp : roadmap.
- Région UE pour les appels H : non retenue pour vendredi.
- Plan de repli Belvédère : l'ancienne démo n'est pas le plan B ; les chiffres Belvédère (113 s, 244 s, 17 h/an, 66/100) ne sont pas réutilisés pour l'onboarding.
- Recorder Windows comme moteur de la démo.
- Dépense nouvelle ou abonnement.

## Comportements attendus
- Onboarding de Léa dans la démo : la personne fait vraiment 3 gestes clés dans les 3 espaces (fiche RH, canal de messagerie, page du wiki), environ 40 s, en direct. Ghost reconnaît le schéma ; le reste de l'onboarding de Léa est annoncé comme abrégé. Les 40 s comptent dans la minute avant l'action de l'agent.
- Le déclencheur de l'intervention est visible à l'écran (notification d'arrivée de Karim) : aucune proposition scénarisée hors de l'écran.
- Ghost ne propose que des actions qu'un agent H peut exécuter dans un outil coché ; sinon il décrit une automatisation à mettre en place sans l'exécuter.
- Si le manager est manquant : l'agent pose la question et la liste dans « décisions humaines ».
- Si un agent échoue : l'échec est affiché avec son cas ; aucun succès simulé.
- Si la limite H bloque : repli en série (voir hypothèses).
- Service d'agent sur Render Free : réveil avant la démo (environ 1 min).
- Chiffres affichés après le run :
  - actions faites et outils touchés (ex. 12 actions dans 3 outils) ;
  - checklist d'onboarding complète à 100 % ;
  - points en attente d'une décision humaine (ex. 2 : la commande de l'ordinateur, le manager manquant) ;
  - « Karim est prêt pour son jour 1 » (accès, badge, page de bienvenue, parrain) ;
  - durée des agents (parallèle) contre durée humaine de référence ;
  - taux de réussite et actions vérifiées dans l'outil ;
  - coût d'un onboarding (crédits H et tokens) ;
  - heures par an économisées pour une PME de 50 personnes.

## Alternatives écartées
- H agit à la minute 1 sans détection : incohérent avec « Ghost observe d'abord » ; remplacé par un teaser facultatif.
- Texte nettoyé envoyé à Holo : ne « voit » pas l'écran ; remplacé par des captures des outils cochés.
- Poste local avec Client.local() : non testé, trop risqué pour une nuit.
- Une seule proposition de type copie d'annonce : la variété voulue disparaissait.
- Recorder Windows pour la capture : nouvelle interface et installation sur le PC de démo ; le partage d'écran du site est plus rapide.
- n8n pour Équipe et Docs : écarté dans la démo parce que ces outils sont présentés comme sans API.
- Appel direct de l'API H depuis Vercel : écarté à cause des durées maximales de fonctions.

## Hypothèses assumées et risques
| Hypothèse | Ce qui ferait changer d'avis |
|---|---|
| Holo lit une capture et Ghost intervient en 10 à 30 s | Test avant 22h : au-delà de 30 s, espacer les captures ou réduire leur taille |
| La vue en direct de H peut s'afficher dans notre site | Test avant 22h : si elle n'est pas intégrable, lien vers la vue en direct dans un nouvel onglet |
| 3 agents H en parallèle tiennent dans les crédits et la concurrence | Test avant 22h : en cas de limite, agents lancés en série |
| Une arrivée prend environ 2 h dans 5 outils | Aucune mesure : à étiqueter « hypothèse » tant qu'elle n'est pas chronométrée sur le run de Léa |
| Les garanties de confidentialité cochées sont vraies | Vérification avant le deck, vendredi 12h ; sinon retirées du pitch |

Risques :
- Refonte complète en une nuit, sur un cas sans chiffre de référence (le PDF cite « trop large », « sur-concevoir », « ne pas mesurer »).
- Un agent qui bloque en live : plan B vidéo.
- Détection d'un processus multi-outils après une courte observation.
- Concurrence non documentée dans ce que la doc de H, lue ce soir, indique.
- Seul l'onglet partagé est visible : l'intranet de test doit tenir dans une fenêtre.
- Code poussé sans relecture : risque de conflits, atténué par des dossiers séparés.

## Critères de succès
- Un parcours de bout en bout en live : accord, observation, détection réelle, proposition, accord, 3 agents en action, vérification.
- Agent en action moins d'une minute après le début de l'observation ; intervention en 30 s maximum.
- Aucune étape préenregistrée dans la version live ; tout rejeu est annoncé comme tel.
- Les chiffres de la liste ci-dessus s'affichent à partir de mesures réelles.
- Minimum acceptable : 3 agents lancés, au moins l'Agent Accès vérifié dans l'outil, et la vidéo d'un run complet disponible.

## Contraintes
- Temps : nuit de jeudi 19 à vendredi 20/11 ; livrables vendredi 11h (prototype, fiche et repo, vidéo démo 5 min) puis deck 8 à 12 slides avant 15h, pitch 6 min et Q&A 4 min.
- Budget : aucune nouvelle dépense ; Render Free ; crédits H existants à vérifier.
- Équipe : Binta (CEO, porte le site) avec Henriquet (données, Supabase, vérification) et Alejandro (agents H) font tout ; Omar et Vladimir sont retirés du plan. Plan détaillé et prompts : `PROJET-ET-PLAN.md` et `PROMPTS-EQUIPE.md` dans ce dossier.
- Code : chacun pousse ses fichiers sans attendre de relecture, dans ses propres dossiers, et prévient le groupe avant de toucher un fichier partagé. Cette règle remplace la relecture préalable, à la demande de Binta.
- Aucune clé ni secret dans les fichiers.

## Actions avant démarrage
| Action | Responsable | Échéance |
|---|---|---|
| Tester la vue en direct de H et la lecture d'une capture par Holo | Binta, aidée de Henriquet | jeudi 19/11, avant 22h |
| Tester 3 sessions H en parallèle et vérifier les crédits restants | Alejandro | jeudi 19/11, avant 22h |
| Données fictives de l'intranet et schéma Supabase | Henriquet | jeudi 19/11, avant 23h |
| Vérifier les 3 garanties de confidentialité cochées (captures limitées aux outils cochés, pastille et pause, images non conservées) avant de les annoncer | Binta et Henriquet | vendredi 20/11, 12h |
| Chronométrer le run de Léa pour remplacer l'hypothèse « 2 h » | Binta | avant le deck, vendredi 13h |

## Prochaines étapes
1. Recevoir la documentation des autres membres et la lire.
2. Lancer les trois tests (vue en direct, Holo, 3 agents), puis appliquer le repli prévu en cas d'échec.
3. Construire l'intranet de test (3 espaces dans un seul onglet) et les données fictives.
4. Reconstruire le site Next.js, le portail, Supabase et Vercel.
5. Brancher la capture, Holo, la proposition, les 3 agents et le tableau de suivi.
6. Filmer un run complet comme plan B et vidéo démo.
7. Geler le code, déposer le repo et la fiche avant 11h, finir le deck avant 15h.

## Écarts avec le cadrage initial (mis à jour le 20/11/2026)
Ce qui est livré, et ce qui diffère de ce qui était prévu plus haut. Rien n'est annoncé qui n'ait été testé.

- **Équipe** : Binta et Henriquet. Alejandro n'est plus sur le projet ; Binta a repris les agents H et l'orchestration.
- **Détection** : Ghost lit la **notification d'arrivée** dans l'espace RH (Holo, en 1 à 2 s) et la confirme dans la base avant de proposer. Il **n'apprend pas** les gestes de Sophie : l'onboarding de Léa est le modèle fixe. Il note les espaces que Sophie parcourt pendant l'observation et ne le dit dans la proposition que si c'est vrai.
- **Vocal** : voix de Ghost et transcription par le navigateur (Chrome), commandes « oui » et « valide ». Pas de modèle vocal dédié.
- **Vue en direct** : la page de H interdit l'intégration en cadre ; le portail affiche donc **sa propre vue** (écran de chaque agent et ses clics, lus dans les événements de session).
- **Confidentialité** : images jamais conservées, pastille toujours visible, pause qui coupe l'envoi. **Les captures ne sont pas limitées aux outils cochés** : c'est l'onglet partagé en entier.
- **Orchestration** : service Python hébergé sur Render (offre gratuite, réveil jusqu'à une minute), pas sur Vercel.
- **Sessions mémoire, comparaison avec « 2 h »** : non réalisées ; la durée humaine reste une hypothèse.
- **Hugging Face** : classement des pages du wiki par embeddings (Agent Docs). Jeu de données public non publié.
