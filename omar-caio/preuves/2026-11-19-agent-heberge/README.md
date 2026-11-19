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
