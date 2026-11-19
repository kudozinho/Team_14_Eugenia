# Recette CAIO du portail Mon audit · 19 novembre

Refs #20. Relecture du compagnon et du portail de la PR #61, branche codex/client-audit-portal, commit 0e35fe907b16c3c6c4d6c4d76ac054fe97edd5dd. La recette Windows complète reste à effectuer sur le PC d’Henriquet après installation de cette PR et de sa migration.

## Modèle et dépendances

Configurer GHOST_ANALYSIS_MODEL=holo3-1-35b-a3b sur le PC. C’est l’identifiant utilisé dans la qualification réelle de session1 du 18 novembre. Sa présence dans le catalogue H a été revérifiée le 19 novembre avec l’accès personnel configuré. L’accès de la clé d’équipe à ce modèle reste à confirmer par Alejandro.

Le compagnon lance analyser_audit.py avec le même interpréteur Python, --audit suivi de l’identifiant de la session, --modele suivi de GHOST_ANALYSIS_MODEL, --ecrire et --env pointant sur le .env à la racine du dépôt.

L’analyse CAIO utilise la bibliothèque standard Python. Elle n’exige aucun SDK H ni Anthropic. pytest est utilisé pour ses tests. Le Recorder et le compagnon utilisent leurs propres dépendances, notamment requests, python-dotenv, les modules de capture/OCR Windows et spaCy. Installer les dépendances du Recorder dans l’interpréteur utilisé par LANCER-PORTAIL.cmd. La recette locale a été exécutée sous Python 3.14. La CI du dépôt utilise Python 3.12. La validation de l’environnement Windows reste nécessaire.

HAI_API_KEY doit exister dans l’environnement du compagnon pour être héritée par son sous-processus. config.py charge alejandro-cto/recorder/.env puis le .env racine. Une clé placée seulement dans alejandro-cto/agent-h/.env ne sera pas chargée par ce compagnon. La clé Supabase est chargée depuis le .env racine ou l’environnement. Les deux secrets du portail ont leurs rôles distincts, conformément au guide de la PR #61.

## Cas vérifiés localement

79 tests CAIO réussis le 19 novembre, dont sept nouveaux cas sur l’entrée utilisée par le compagnon. Les services sont remplacés en mémoire pour ces sept cas.

- Un audit vide produit un JSON avec taches et inserees vides, code de sortie 0.
- Une session d’un événement produit la même sortie, sans clé ni appel Holo.
- Deux audits fictifs distincts produisent des tâches rattachées à leur propre audit, avec des identifiants disjoints.
- Des événements d’un autre audit sont rejetés avant qualification.
- Une réponse texte invalide, une réponse perdant les candidates et une erreur fournisseur échouent sans insertion.

Le correctif CAIO diffère l’initialisation du fournisseur jusqu’au premier appel utile. Avant ce correctif, la CLI exigeait HAI_API_KEY même sans candidate.

La route Mon audit filtre ses résultats par audit_id de la session courante. Le composant affiche « Aucune tâche répétitive qualifiée dans cette session » lorsque le compagnon annonce completed et que la liste est vide. Cette lecture du code confirme la liaison attendue. La capture réelle et l’affichage dans un navigateur connecté au portail restent à tester.

Une courte session peut tout de même produire une répétition si elle contient assez d’actions distinctes répétées. Le critère est l’observation de répétitions, pas une durée minimum.

## Délai de trois minutes et erreurs

Selon portail.py de la PR #61, le compagnon surveille le sous-processus et le tue si l’analyse dépasse 180 secondes au prochain contrôle. Il publie alors actual=error et « Analyse trop longue. Les événements sont conservés. ». Le seuil concerne le processus d’analyse complet, y compris lecture Supabase, appel Holo et insertion.

Un code de sortie non nul devient actual=error et « Analyse indisponible. Les événements sont conservés ; contactez l’équipe. ». Si GHOST_ANALYSIS_MODEL manque, l’arrêt affiche que le modèle doit être configuré. Une session sans candidate se termine normalement après le correctif CAIO, même sans accès H.

Le fournisseur H attend au plus 90 secondes pour sa requête réseau. La CLI renvoie un code non nul sur les erreurs réseau et les sorties JSON refusées. Le compagnon masque stdout et stderr ; le message client reste générique. Un diagnostic de configuration doit donc être réalisé sur le PC, en conservant les secrets privés.

Une interruption au moment de l’écriture peut laisser un résultat déjà validé par Supabase. Avant une relance, relire les tâches de cet audit. Les identifiants déterministes limitent les doublons et l’insertion conserve une tâche déjà présente. Une relance ne met pas à jour ses mesures ni son score. Le statut error ne suffit donc pas à conclure que la base est vide.

Les validations locales de cette livraison ne simulent pas une expiration réelle du compagnon Windows. Les branches de délai et d’échec ci-dessus sont documentées par relecture du code.

## Recette restant à réaliser sur le poste de présentation

Après coordination avec Assel, Henriquet et Alejandro, installer la PR #61 et la migration, configurer les accès privés et lancer le compagnon. Pour un nouvel audit autorisé, relever l’identifiant affiché au démarrage, puis confirmer le même audit_id dans les événements et les tâches. Vérifier l’affichage de ces tâches dans Mon audit après arrêt.

Faire ensuite une session courte sans répétition et confirmer zéro tâche et le message honnête de fin. Vérifier les états d’erreur et de dépassement dans un environnement de recette coordonné. Aucun test local de cette livraison n’a créé ou modifié d’audit dans la base partagée.

## Limites à conserver pour le Loom

La session2 historique donne 515 secondes écoulées pour le lot et 172 secondes par mandat par division. Elle ne fournit pas trois durées individuelles. La somme de 442 secondes dans les événements reste une mesure distincte à expliquer.

L’affichage public historique peut encore montrer des exemples. Le résultat du nouvel audit est celui présenté dans Mon audit pour sa session. Le contexte métier du script CAIO reste le jeu fictif de l’Agence Belvédère. Le parcours multi-clients avec des profils et contextes propres demande un branchement supplémentaire.

Un test passant avec les services remplacés localement démontre le comportement du code dans ces cas. La qualification réelle sur une nouvelle capture du portail reste à valider sur Windows avec la clé d’équipe. Les coûts par modèle exigent les consommations et tarifs réellement applicables.
