# M-0142 · vérification CAIO avant le premier passage hébergé

Contrôle du 19 novembre 2026 à 15 h 18, heure de Paris, sur la [PR #66 au commit 2fb8770](https://github.com/kudozinho/Team_14_Eugenia/pull/66/files/2fb87704c44b335f6ecbd31647b0ed896437e7da). La vérification a consisté à lire la tâche dans Supabase et à construire la demande localement avec le code de cette version. Le lancement d’une session H et le dépôt d’annonces relèvent de la recette coordonnée.

## De la tâche à la demande

La lecture par ID unique de `taches_detectees` retrouve `tache_a1a0c7545c805f328eba1e25`, audit `aud_demo`, méthode `agent_h`, trois passages, durée humaine 244 s. Les huit champs comparés à la [qualification du 18 novembre](../2026-11-18-session1/tache-session1-qualifiee.json) concordent : ID, audit, méthode, occurrences, durée, consignes, empreinte et séquence. Empreinte du prompt de qualification : `f92dbff8c1459410`. SHA-256 du seul texte UTF-8 des consignes relues : `4f947ce1db9ee280347f55fa6c10522fac0674cd6e9bb3272132435e25b43ffe`.

Les consignes qualifiées par Holo demandent la copie exacte des champs du mandat fourni par le lanceur, la vérification de l’énergie et du prix, la photo sur C, la validation, le signalement des données manquantes et le retour des résultats. L’observation justifie ces consignes. La sélection explicite de M-0142 et des portails A, B, C vient du [worker](https://github.com/kudozinho/Team_14_Eugenia/blob/2fb87704c44b335f6ecbd31647b0ed896437e7da/deploy/agent-h/worker.py#L40).

Avec la ligne relue et les fonctions charger_mandat, construire_demande et consigne_texte de la PR, le contrôle local a retrouvé le texte des consignes, les URL de formulaire A/B/C et chacune des valeurs suivantes dans le message destiné à H. Les URL effectives restent configurables sur le service déployé.

| Champ | Valeur attendue sur chaque portail |
|---|---|
| Titre | Appartement T3 lumineux proche RER |
| Prix | 329 000 € (valeur numérique 329000) |
| Surface | 68 m² |
| Ville | Massy |
| Description | T3 au 2e étage avec ascenseur, séjour sur balcon exposé sud. Deux chambres, cuisine séparée, cave. À 6 minutes à pied du RER B Massy-Palaiseau. |

Classe énergie C pour le contrôle préalable. Les portails ne proposent pas ce champ. Sur C, l’identité de la photo de référence doit être vérifiée séparément. [Mandat source](https://github.com/kudozinho/Team_14_Eugenia/blob/2fb87704c44b335f6ecbd31647b0ed896437e7da/henriquet-cdo/donnees/agence-belvedere.json#L114)

## Sélection côté serveur et preuve à relever

La route publique construit la demande à partir de la configuration du serveur. Si TACHE_ID manque, le site utilise la fiche d’exemple. Le worker filtre les demandes avec son propre TACHE_ID. Confirmer le même identifiant réel des deux côtés avant le clic. [Sélection serveur](https://github.com/kudozinho/Team_14_Eugenia/blob/2fb87704c44b335f6ecbd31647b0ed896437e7da/binta-cpo/app/ghost-ui/lib/tache.ts#L6)

À la date du contrôle, les quatre exécutions enregistrées pour cette tâche dataient du 18 novembre. La lecture REST de agent_worker a renvoyé HTTP 404. L’activation de la migration et la présence d’un worker hébergé opérationnel restent à confirmer.

Pour la recette, relever l’heure du clic, l’ID de demande, l’ID de session H, le mandat effectivement chargé et la durée de ce passage. Pour chaque portail, identifier les nouvelles annonces de cette session, conserver les IDs, comparer les cinq valeurs au tableau et signaler les doublons ou écarts. Sur C, comparer la photo au fichier de référence du mandat. Si des publications concurrentes rendent l’attribution incertaine, le signaler. Relire le résultat affiché pour la même demande.

Dans la version examinée, le résumé provient du contrôle des annonces et les coches de portails utilisent la liste déclarée par H. Le statut technique completed peut accompagner une annonce incorrecte. Le contrôle de photo exact dépend de la #63. [Résultat du lanceur](https://github.com/kudozinho/Team_14_Eugenia/blob/2fb87704c44b335f6ecbd31647b0ed896437e7da/alejandro-cto/agent-h/lancer_agent.py#L269) · [Contrôle des champs](https://github.com/kudozinho/Team_14_Eugenia/blob/2fb87704c44b335f6ecbd31647b0ed896437e7da/alejandro-cto/agent-h/portails.py#L34)

## Références historiques pour le rapport

244 s est la moyenne arrondie des trois chronos manuels (428, 169, 134 s). La synthèse du rapport affiche une médiane agent de 113 s sur trois exécutions. Le clic historique de 98 s est un passage individuel. L’historique sur quatre exécutions affiche 219 s de médiane. La session 2 du Recorder a duré 515 s pour le lot ; les 172 s par mandat résultent de la division par trois. Les 17 h/an restent une estimation. La durée, le coût et le verdict du premier passage hébergé restent à relever sur sa propre session.

## Mise à jour du 19 novembre à 15 h 34 (Paris)

**Consignes.** Les huit champs de la tâche en base concordent encore avec la qualification du 18 novembre. Le mandat de démonstration est M-0142. Le serveur et le service HTTP doivent tous deux imposer `tache_a1a0c7545c805f328eba1e25` et refuser le lancement si la configuration manque ou diffère. La version 2fb8770 de la #66 utilise encore la fiche d’exemple comme repli côté site. Ce point relève du raccordement serveur.

**Mesures reproduites.** Les quatre lignes de cette tâche datent du 18 novembre. En appliquant aux lignes de Supabase le filtre de la synthèse (statut, durée, résumé), on retrouve 98, 113 et 325 s, donc 113 s de médiane. La vue historique comprend aussi 452 s, soit 219 s de médiane sur les quatre. La sélection du rapport ne certifie pas la conformité de la photo ni trois succès consécutifs. La référence humaine de 244 s vient des chronos manuels. Les 17 h/an du score dépendent d’hypothèses de fréquence, d’adoption et de contrôle. Le scénario d’exemple à 720 s par opération reste distinct de ces mesures. [Calcul du rapport](https://github.com/kudozinho/Team_14_Eugenia/blob/0e6554069ead2a608b8de62c5347c9d2ad5234b6/binta-cpo/app/ghost-ui/app/rapport/page.tsx#L61) · [Chronos humains](../2026-11-18-session1/README.md)

**Passage sur Render Free.** La cible est un Web Service Python qui se prépare à la demande. Dans le code relu de la #66, la boucle du worker est toujours permanente. À 15 h 34 la lecture de la table agent_worker a réussi et n’a retourné aucune ligne pour cloud. La capacité à recevoir un lancement, les crédits d’équipe disponibles et la première session hébergée restent à confirmer. La préparation doit précéder l’acceptation du clic et le service doit refuser de créer une session H si le budget est insuffisant ou inconnu. [Conditions de mise en veille Render](https://render.com/docs/free#spinning-down-on-idle)

**Preuve à livrer après le clic coordonné.** Depuis un autre appareil, PC d’Henriquet éteint, relever le passage « préparation » puis « prêt », un seul ID de demande accepté, l’ID de session H, l’heure de départ et l’heure de fin. Distinguer le temps d’attente du réveil et la durée d’exécution de H. Comparer chaque nouvelle annonce attribuable à la session au mandat ci-dessus, vérifier l’identité du fichier photo sur C, noter les erreurs et confronter le verdict au résultat affiché pour cette même demande. En cas d’interruption, vérifier les écritures existantes avant toute décision de relance.

**Texte proposé pour le jury avant la recette.** « Dans notre démonstration, la tâche confiée est de recopier le mandat M-0142 sur trois portails. Ghost a repéré cette répétition pendant une observation consentie et a transformé le diagnostic en consignes. Pour les interfaces sans API, H utilise le navigateur. Pour un outil avec API, le parcours prévu passe par n8n. Nous jugeons le résultat en relisant les annonces créées et en comparant leurs champs et la photo au mandat. » Après une recette concluante, compléter avec les identifiants, la durée et le nombre de portails effectivement vérifiés sur ce passage.
