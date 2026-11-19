# Éléments CAIO · jeudi 19 novembre

Mesures d’exécution vérifiées à 1 h 18, heure de Paris. Connexion du portail relue au commit 7bd2c9a après le mail d’Assel de 1 h 34. Support préparatoire au Loom et au retour d’équipe. Le parcours réel du nouveau portail Mon audit reste à tester sur le PC Windows.

## Texte court utilisable dans le Loom

« Ghost nettoie les observations sur le poste avant leur transmission. Sur la première session jouée, nous retrouvons trois passages sur les formulaires. La tâche qualifiée par Holo a été écrite puis relue dans Supabase. Le test du bouton rapporté par Henriquet a exécuté l’agent sur trois portails en 98 secondes, contre une moyenne de 244 secondes sur trois chronos manuels. Le gain sur cet essai est d’environ 60 %. La conformité de la photo exacte et la fiabilité sur plusieurs passages restent à vérifier. »

Le passage de 98 secondes est un essai identifié. L’essai ultérieur a duré 325 secondes. Sa conformité attend une confirmation. Les trois réussites consécutives ne sont pas établies par les seules lignes de la base.

## Preuves disponibles

| Élément | Preuve et portée |
|---|---|
| Nettoyage et libellés conservés | PR #34 et #43 fusionnées, validation Mac rapportée par Assel |
| Tâche qualifiée et écrite | PR #56 fusionnée, preuves JSON versionnées de session1 |
| Nouvelle commande du compagnon | Relecture de la PR #61, pas encore une validation Windows |
| Audit vide ou sans répétition | PR #62, sept nouveaux cas locaux, 79 tests CAIO réussis et trois contrôles GitHub verts |
| Passage du bouton | Mail Henriquet du 18 novembre à 17 h 33 et ligne Supabase de 98 s, référence 244 s |
| Session2 | Sauvegarde et diagnostic versionnés, 515 s écoulées sur le lot, moyenne calculée de 172 s par mandat |

- [PR #56](https://github.com/kudozinho/Team_14_Eugenia/pull/56)
- [Preuves de session1](https://github.com/kudozinho/Team_14_Eugenia/tree/main/omar-caio/preuves/2026-11-18-session1)
- [Preuves de session2](https://github.com/kudozinho/Team_14_Eugenia/tree/main/omar-caio/preuves/2026-11-18-session2)
- [PR #62 et recette du portail](https://github.com/kudozinho/Team_14_Eugenia/pull/62)

## Cinq limites prêtes pour une slide

- Le nettoyage local peut laisser passer un nom inhabituel ou mal lu à l’écran. Les tests couvrent les cas documentés.
- Le détecteur trouve des séquences répétées contiguës. Les étapes dispersées d’un même mandat peuvent rester des fragments.
- Les 244 secondes de référence proviennent de trois chronos manuels. Les 172 secondes de session2 sont une division du temps de lot et les trois durées individuelles sont inconnues.
- Une publication correcte exige la vérification des champs et de la photo attendue dans les portails. Un statut completed ne suffit pas.
- Les mesures portent sur des mandats et des portails fictifs. La fréquence de travail, le gain annuel et la fiabilité nécessitent des hypothèses explicites et des essais supplémentaires.

## Relevé des coûts connus

Le contrôle Supabase relie les quatre exécutions de la tâche CAIO à leurs session_id. Aucune n’a de coût associé dans tests_agent lors de cette lecture. Un relevé local CAIO-couts-verifies-19-novembre.json conserve cette lecture limitée de la base. Les identifiants permettent de rapprocher ensuite les consommations du compte H utilisé sur le poste de démo.

| Exécution | Durée | Résultat connu | Coût disponible |
|---|---:|---|---|
| Session ee9dd852… | 452 s | Non conforme selon Henriquet, titre altéré | 0,46 USD rapporté dans son mail, à rapprocher du relevé H |
| Session cc6692cb… | 113 s | Trois portails vérifiés selon Henriquet | Inconnu dans les preuves consultées |
| Session 84d9b043… | 98 s | Passage au clic rapporté par Henriquet, réserve sur le fichier photo | Inconnu dans les preuves consultées |
| Session 5560aec5… | 325 s | Statut completed en base, conformité non confirmée | Inconnu dans les preuves consultées |
| Qualification Holo de la tâche session1 | Non relevée | JSON validé, accès personnel utilisé | Coût et usage tokens non conservés dans la preuve de cet appel |

Le prix de 0,10 USD de l’ancien essai de 99 secondes est une autre mesure. Il ne renseigne pas le coût du passage de 98 secondes. Un coût absent reste inconnu et ne peut pas être totalisé comme zéro.

## Retours H Company à étayer

Le titre exact est fragile d’après les contrôles de l’équipe. Un retour d’exécution ou un résumé annonçant une publication complète demande une vérification indépendante. La photo attendue sur C a rencontré un 403 et une image différente a été utilisée selon Henriquet. Le retour technique doit préciser l’identifiant de session, l’entrée attendue, le résultat réellement constaté, le coût et le contournement essayé.

L’essai de 325 secondes dépasse la référence humaine de 244 secondes. Sa durée est un constat et ne permet pas de conclure sur sa conformité. Son résultat doit être relu par les responsables du test avant de l’intégrer au taux de réussite.

## Prochaine validation CAIO

Restent à obtenir la confirmation d’accès au modèle holo3-1-35b-a3b avec la clé d’équipe et la disponibilité du portail #61 sur Windows. La recette devra relever un nouvel audit, confirmer le rattachement des événements et tâches, vérifier l’affichage et le cas zéro tâche. Les tests locaux de la PR #62 utilisent des services remplacés en mémoire.

Le correctif de la PR #62 est intégré à la branche du portail. La connexion personnelle utilise Supabase Auth avec saisie du code par Assel. La procédure RECETTE_PORTAIL.md décrit les preuves à relever pour les succès, les sessions sans candidate, les échecs et le dépassement de trois minutes. Au contrôle de 14 h 06, la #61 est fusionnée dans main et la #62 reste ouverte. Le poste Windows signale son état prêt. La capture du nouvel audit et sa qualification restent à vérifier. Voir le [rapprochement de la session 2](preuves/2026-11-18-session2/README.md) pour la différence entre 515 s écoulées et les champs de durée de l’ancien Recorder.
