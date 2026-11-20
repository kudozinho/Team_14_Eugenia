# GHOST New Era : où on en est et qui fait quoi

Mis à jour le 20/11/2026. Alejandro ne travaille plus sur le projet : **Binta reprend ses tâches (agents H, orchestration)** et se répartit le travail avec Henriquet.

## Ce que le projet contient (trois choses distinctes)

| # | Quoi | À quoi ça sert | Adresse |
|---|---|---|---|
| 1 | **Le site Ghost** (public) | Le produit : landing, tarifs, inscription, paiement en mode démo, questionnaire, portail de la personne | https://ghost-new-era.vercel.app |
| 2 | **L'intranet d'Atelier Nova** (faux) | Les outils internes de la PME fictive. Ce n'est PAS un site vitrine : ce sont les outils dans lesquels Sophie travaille et dans lesquels les agents H cliquent. Trois espaces : RH et badges, messagerie, wiki | `/intranet/rh` (fait), `/intranet/messagerie` et `/intranet/wiki` (Henriquet) |
| 3 | **Le cerveau** | Holo lit l'écran, 3 agents H agissent, la base prouve que l'action est réelle | routes `/api/...`, Supabase, service d'agents |

Atelier Nova n'a donc pas de site vitrine : seul l'intranet existe. Il n'y a pas de logo Atelier Nova (le bandeau écrit « Atelier Nova · Espace RH et badges »). Un faux logo est facultatif.

## Le parcours de bout en bout

1. Landing, puis « Commencer » : inscription (compte), paiement démo (aucune donnée bancaire), questionnaire.
2. Connexion de Sophie (compte de démo déjà créé) : arrivée directe au portail.
3. Portail : accord outil par outil, puis l'intranet s'affiche dans un cadre, avec le panneau Ghost et la pastille (pause).
4. « Partager mon onglet » : une image part toutes les 4 secondes vers Holo (côté serveur, aucune image conservée, seulement le résumé).
5. Holo lit « Nouvelle arrivée : Karim Benali » et la base confirme une arrivée « nouvelle » : Ghost propose « Je prépare l'onboarding de Karim comme pour Léa ? ».
6. Si Sophie dit oui : 3 agents H (Accès, Équipe, Docs) agissent dans l'intranet. **Pas encore fait.**
7. Chaque action est vérifiée dans la base (vue `v_onboarding`), puis le rapport chiffré s'affiche. **Pas encore fait.**

## Fait et en ligne

- Landing, tarifs de démonstration (49 et 149 euros par mois, valeurs d'exemple, prix réel à décider), inscription, connexion.
- Paiement démo (écrit dans `abonnements`) et questionnaire (écrit dans `profils`).
- Intranet RH avec les vraies données : notification d'arrivée de Karim, liste des personnes, fiche, accès, badge, matériel (la validation de la commande est réservée à une personne).
- Portail : accord outil par outil (tables `sessions_audit`, `consentements`), pastille avec pause, partage d'onglet, lecture par Holo (`captures_lues`), proposition (`taches_detectees`, `propositions`).
- Compte de démo de Sophie (mot de passe transmis en privé, jamais dans le dépôt).
- Déploiement automatique : tout ce qui est fusionné dans `main` met le site à jour (Vercel relié à GitHub).

## Pas testé

- L'appel réel à Holo en production (variable `HAI_API_KEY` à vérifier dans Vercel).
- Le parcours complet en Sophie dans Chrome (partage d'écran compris).
- Les écritures de l'intranet RH par un vrai agent.

## À faire, dans l'ordre

1. Vérifier `HAI_API_KEY` dans Vercel et faire le test complet : connexion Sophie, accord, partage, notification de Karim, proposition.
2. **Tests H** (reprise des tâches d'Alejandro) : une session H avec vue en direct (dans un cadre de notre site ?), trois sessions en parallèle, envoi d'un message à une session en cours, crédits restants.
3. **Agent Accès** : fiche de Karim, accès du poste, badge, matériel en attente. Consigne dans le message pour Alejandro (ci-dessous, à réutiliser).
4. **Orchestration** : lancer les 3 sessions, écrire chaque événement dans `agents_evenements`, renseigner `agents_runs`, relayer la question de l'agent et la validation (`decisions_humaines`).
5. **Agent Équipe** (messagerie : bienvenue, parrain, café) et **Agent Docs** (wiki : page « Bienvenue Karim » et checklist), selon la répartition avec Henriquet.
6. Portail : tableau de suivi qui se coche, 3 vues en direct, question de l'agent (manager manquant), bouton de validation de la commande, rapport final chiffré.
7. **Enregistrements** : « sessions mémoire » (vraies sessions enregistrées avant, `memoire = true`), run complet filmé (plan B et vidéo de 5 minutes), chiffres réels (durée, actions vérifiées, taux de réussite, coût).
8. Livrables : fiche projet, README, dépôt avant 11 h 00 ; deck avant 15 h 00.

## Répartition proposée (à valider par Binta et Henriquet)

- **Binta** : agents H (tests, Agent Accès, orchestration), assemblage, run filmé, fiche et deck.
- **Henriquet** : messagerie et wiki, Holo (fait), Hugging Face (classement du wiki), vocal, sessions mémoire, vérifications finales. Il peut aussi prendre l'Agent Équipe.

## Contrat des événements (pour les agents)

Tables d'Henriquet, noms fixes (`supabase/schema.sql`) : `agents_runs` (un run par agent), `agents_evenements` (statut : en_cours, ok, echec, question, attente_validation), `decisions_humaines` (questions et validations). Une action n'est comptée qu'après vérification dans `v_onboarding`.
