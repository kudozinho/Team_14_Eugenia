# Ghost · Éléments CAIO pour le checkpoint du mercredi 18 novembre

## Journal du Recorder

| Texte de démonstration avant floutage | Texte après floutage |
|---|---|
| Portail B - Nouvelle annonce | Portail B - Nouvelle annonce |
| Visite avec Jean-Pierre Dupont | Visite avec [NOM] |

Assel a validé ces deux cas sur le Mac de démo le 17 novembre. [Correctif du floutage](https://github.com/kudozinho/Team_14_Eugenia/pull/34)

## Session jouée sur Windows le 18 novembre

Henriquet a joué une session avec trois mandats fictifs. L’analyse en lecture seule de l’audit `aud_demo` couvre la fenêtre de 14 h 28 inclus à 14 h 44 exclu, heure de Paris. Elle utilise les adresses des pages autorisées. Le texte lu sur les écrans et les images ne sont pas nécessaires.

| Mesure | Résultat |
|---|---|
| Événements dans Supabase | 139, dont 78 autorisés et 61 hors périmètre |
| Captures des formulaires | 15 sur A, 17 sur B, 26 sur C |
| Autres captures autorisées | 20 consultations de fiches d’annonces |
| Ordre des formulaires | A → B → C observé 3 fois |
| Sorties du périmètre entre le premier et le dernier formulaire de chaque passage | 26, 16 et 12 |
| Étape source (feuille ImmoGest) | Aucune capture autorisée identifiable dans cette fenêtre |
| Durée complète déterminée automatiquement | Inconnue |
| Chronos humains communiqués par Henriquet | 7 min 08, 2 min 49 et 2 min 14. Moyenne arrondie de 4 min 04, médiane de 2 min 49 |

**Phrase pour le Loom.** « Sur la session Windows, Ghost retrouve trois fois les formulaires A, B puis C. L’enregistrement comporte des interruptions. Pour la durée complète, nous disposons séparément des trois chronos relevés par Henriquet. »

## Passage de relais

La simulation de qualification retrouve des fragments de quelques secondes. Après validation d’Assel à 15 h 35, la tâche tache_a1a0c7545c805f328eba1e25 a été qualifiée par Holo, insérée et relue dans aud_demo. Elle reprend trois passages observés et la moyenne de 244 s chronométrée à la main. Les consignes indiquent cette provenance. Son identifiant a été communiqué à l’équipe après notification préalable de Vladimir. À la vérification, l’audit contient encore la tâche d’exemple à 720 secondes. Henriquet rapporte des publications sur chaque portail. À 15 h 24, il explique que le lancement de secours avec RESET_TOKEN à 14 h 59 a vidé les portails après sauvegarde des 11 annonces manuelles. Sauvegarde reçue par mail et vérifiée contre le CSV fictif. Elle comporte 11 identifiants distincts, couvre les neuf couples mandat/portail, documente deux doublons et un écart de prix sur M-0142, portail C, à 328 981 € contre 329 000 €. Titres, surfaces et villes correspondent au CSV. Les descriptions et photos sont absentes du fichier. Il confirme avoir consulté les mandats ailleurs que dans la feuille ImmoGest pendant cette session, ce qui explique la source invisible et les interruptions. Il propose une nouvelle session vers 16 h 30 avec ImmoGest et les mandats M-0145, M-0146 et M-0148.

Le correctif CAIO est enregistré sur `omar/caio`, commit `ab0e8f7`. Les 72 tests CAIO passent. Le cas de référence du dépôt conserve trois répétitions et 745 secondes de moyenne sur les deux occurrences entièrement chronométrées. Ces 745 secondes appartiennent au jeu d’exemple.

Assel a validé la moyenne manuelle pour ce test. Le score relève d’Henriquet. Le départ de l’alerte J2 et l’exécution de l’agent sur ce nouvel identifiant restent à confirmer par les responsables. Le changement vers la clé d’équipe sur le poste de démo reste à vérifier. La qualification a utilisé l’accès personnel précédemment configuré. Les preuves JSON, le prompt avec son empreinte et la sauvegarde des annonces sont dans [preuves/2026-11-18-session1](../preuves/2026-11-18-session1/README.md). [Branchement Supabase](https://github.com/kudozinho/Team_14_Eugenia/pull/48)

## Cinq limites pour la slide d’Assel

- Un nom inhabituel ou mal lu à l’écran peut échapper au floutage local.
- Un nouveau libellé d’interface peut être masqué par erreur et doit être testé sur le poste de démo.
- Des formulaires visités trois fois dans le même ordre prouvent une répétition. La réussite d’une publication se vérifie dans les sites.
- Une interruption ou une étape invisible empêche d’attribuer la durée entière d’un parcours au travail observé.
- Trois chronos sur des mandats fictifs décrivent cet essai. Le gain annuel dépend aussi de la fréquence du travail en agence.
