# Session 2 Windows du 18 novembre

Refs #20

Le diagnostic porte sur aud_demo entre 16 h 04 min 21 inclus et 16 h 13 min 03 exclu, heure de Paris. Les événements sont lus directement dans Supabase. La sauvegarde des annonces a été fournie par Henriquet après la session.

## Vérifications

- 125 événements, dont 47 lectures identifiables d’ImmoGest et sept sorties du périmètre.
- Les champs de durée des sorties du périmètre totalisent 40 secondes. Leur cause, fenêtre de choix de la photo, est rapportée par Henriquet. Le contenu des événements hors périmètre est ignoré.
- Neuf identifiants d’annonce distincts couvrent M-0145, M-0146 et M-0148 sur A, B et C. Titres, prix, surfaces et villes correspondent exactement au CSV des mandats. Descriptions et photos absentes de la sauvegarde.
- La première capture ImmoGest est horodatée à 16 h 04 min 21. La dernière publication déclarée dans la sauvegarde est à 16 h 12 min 56. Leur différence donne 515 secondes, soit 8 min 35 pour le lot et 171,67 secondes par mandat en divisant par trois.
- Les champs duree_s des 125 événements totalisent 442 secondes. Cette somme porte sur la fenêtre de capture complète, jusqu’à 16 h 13 min 02. Elle diffère du temps écoulé aux horodatages. L’origine de cet écart reste à qualifier avec le Recorder. La borne finale des 515 secondes provient de la sauvegarde des publications.
- Les publications de la sauvegarde apparaissent dans l’ordre A, B, C, C, C, B, B, A, A. Cet ordre ne constitue pas trois cycles A → B → C distincts.

## Résultat du détecteur

Le détecteur extrait des séquences répétées de quelques secondes entre ImmoGest et les formulaires. Il ne reconstitue pas trois recopies complètes et ne produit aucune candidate multiportails avec la méthode agent_h pour cette fenêtre. Les détails figurent dans [diagnostic.json](diagnostic.json).

La valeur 171,67 s décrit une durée écoulée de lot divisée par trois. Trois durées individuelles et leur médiane ne peuvent pas être déduites de ce calcul.

La tâche de session 1 déjà validée et inscrite reste documentée séparément à 244 secondes, durée moyenne manuelle. Une éventuelle nouvelle tâche issue du lot demande de conserver explicitement la provenance du calcul.

## État du passage de relais

Analyse en lecture seule et contrôle de la sauvegarde terminés. La qualification Holo et l’écriture d’une tâche session 2 restent à faire après choix de la méthode de mesure par l’équipe. L’analyse n’a modifié ni les tâches ni les gains annuels.

[annonces_session2_sauvegarde.json](annonces_session2_sauvegarde.json) est la copie de la pièce jointe. Son empreinte SHA-256 est enregistrée dans le diagnostic.

La PR #56 a passé les contrôles GitHub Python et les deux compilations Next.js au moment de ce diagnostic.

## Consigne d’Assel à 16 h 19

Le regroupement complet reste hors des résultats vérifiés de ce détecteur. Les étapes d’un mandat sont dispersées et les titres ImmoGest ne suffisent pas à les rattacher à trois cycles complets. Le repli autorisé conserve 515 secondes pour l’ensemble du lot. La tâche d’intégration tache_a1a0c7545c805f328eba1e25 garde sa référence manuelle de 244 secondes.

Assel attend le clic réel sur Prouver et la bonne référence de durée dans le rapport avant fusion. Ces confirmations relèvent d’Henriquet, Alejandro, Vladimir et Binta. Les contrôles GitHub de la PR #56 sont verts lors de la vérification du 18 novembre.

## Validation d’Assel à 16 h 29

Assel valide 515 secondes de temps écoulé pour le lot, de la première capture ImmoGest à la dernière publication. La valeur de 172 secondes par mandat est obtenue en divisant par trois et en arrondissant. Les trois durées individuelles sont inconnues. L’écart avec les 442 secondes cumulées dans les événements reste à éclaircir.

La référence du bouton Prouver reste la moyenne manuelle de 244 secondes sur la tâche tache_a1a0c7545c805f328eba1e25. Le gain annuel attend une validation distincte.
