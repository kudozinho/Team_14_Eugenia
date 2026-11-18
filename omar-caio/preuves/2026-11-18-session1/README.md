# Session Windows du 18 novembre · Livrable CAIO

Refs #20

## Résultat livré

La tâche `tache_a1a0c7545c805f328eba1e25`, audit `aud_demo`, a été insérée puis relue le 18 novembre à 15 h 39, heure de Paris. Elle contient trois passages observés A → B → C, la méthode `agent_h`, des consignes et une moyenne de 244 secondes chronométrée à la main. Assel a validé cette provenance à 15 h 35 pour le test d’intégration. Les chronos d’Henriquet sont 428, 169 et 134 secondes. La médiane vaut 169 secondes.

| Fichier | Ce qu’il permet de contrôler |
|---|---|
| [tache-session1-qualifiee.json](tache-session1-qualifiee.json) | Tâche qualifiée, séquence, méthode, durée et consignes |
| [preuve-qualification-session1.json](preuve-qualification-session1.json) | Diagnostic agrégé, modèle appelé, prompt exact et empreinte |
| [preuve-ecriture-session1.json](preuve-ecriture-session1.json) | Identifiant retourné à l’insertion, date et tous les champs relus |
| [annonces_session1_sauvegarde.json](annonces_session1_sauvegarde.json) | Sauvegarde transmise par Henriquet avant réinitialisation des portails |
| [tests.txt](tests.txt) | Résultat de la suite CAIO sur cette livraison |

La qualification réelle par Holo 3.1 35B-A3B a passé la validation JSON contractuelle. Elle a utilisé l’accès personnel précédemment configuré. La provenance manuelle reste inscrite dans les consignes. Le gain et la fréquence hebdomadaires restent inconnus.

## Captures et limites de durée

Le diagnostic porte sur les événements depuis le 18 novembre à 14 h 28 inclus jusqu’à 14 h 44 exclu, heure de Paris. Il compte 139 événements, dont 61 hors périmètre. Les 78 observations autorisées comprennent 58 captures de formulaires et 20 fiches d’annonces. Les formulaires A, B, C apparaissent dans cet ordre trois fois. Les interruptions entre les observations de formulaires s’élèvent à 26, 16 et 12 par passage.

Henriquet a confirmé avoir lu les mandats hors de la feuille ImmoGest pendant cette session. La durée complète du parcours reste donc inconnue à partir du Recorder. L’emploi de 244 secondes repose sur les chronos humains et l’accord d’Assel. Le diagnostic en lecture seule est reproductible avec la commande décrite dans [INTEGRATION.md](../../INTEGRATION.md).

## Publications sauvegardées

Le fichier transmis par Henriquet comporte 11 identifiants distincts et couvre les neuf couples des mandats M-0142, M-0143, M-0144 sur A, B, C. La comparaison au [CSV de référence](../../../henriquet-cdo/sessions/immogest_mandats.csv) confirme les titres, surfaces et villes.

Deux lignes supplémentaires correspondent aux doublons de M-0142 sur A et M-0143 sur B. Un écart de prix concerne M-0142 sur C, à 328 981 € contre 329 000 €. Les horaires déclarés vont de 14 h 33 min 01 à 14 h 41 min 05. Les descriptions et photos sont absentes du fichier.

D’après Henriquet, le lancement de secours de l’agent à 14 h 59 a réinitialisé les portails après sauvegarde. La pièce jointe est la source du contrôle des publications à ce stade.

## Passage de relais

Vladimir a été averti avant insertion. L’identifiant et la tâche ont été envoyés dans le fil d’équipe à Assel, Henriquet, Alejandro, Binta et Vladimir après relecture.

Restent à confirmer, avec leurs responsables, le départ de l’alerte J2, le score, l’affichage et l’exécution de l’agent sur ce nouvel identifiant. Henriquet a proposé une nouvelle session complète vers 16 h 30. La capture effective de cette session et le passage à la clé H d’équipe sur le poste de démo restent à vérifier.

La tâche `tache_001` constitue l’exemple historique à 720 secondes. Le cas de test synthétique du détecteur retrouve 745 secondes de moyenne sur ses deux occurrences à durée complète. Ces valeurs appartiennent à leurs jeux de données respectifs.
