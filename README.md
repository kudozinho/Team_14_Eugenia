# GHOST New Era

**Ghost est un assistant visible qui travaille avec vous.** Il observe votre écran, uniquement dans les outils que vous autorisez, repère une tâche répétée et propose : « Je m'en occupe ? ». Après votre accord, des agents H Company agissent en direct, clic après clic, et chaque action est vérifiée dans l'outil.

Projet de l'équipe 14, hackathon *Build The Future* (Eugenia x H Company), 16 au 20 novembre 2026.

| | Adresse |
|---|---|
| **Prototype : le site Ghost** (landing, tarifs, compte, portail) | https://ghost-new-era.vercel.app |
| **Intranet de test d'Atelier Nova** (outils de la PME fictive que les agents utilisent) | https://atelier-nova-intranet.vercel.app/intranet/rh |

## Le problème

Dans une PME de 50 personnes, préparer l'arrivée d'un nouveau salarié oblige l'office manager ou la RH à jongler entre plusieurs outils (fiche RH, accès, badge, messagerie, wiki). Chaque étape est simple, mais l'ensemble prend du temps (environ 2 h par arrivée : **hypothèse non encore chronométrée**) et un oubli se voit dès le premier jour : le nouveau arrive sans accès ni badge.

## La solution

Ghost agit à trois moments, et la personne décide à chaque fois :

1. **Il observe** : partage d'un onglet, uniquement dans les outils cochés. Une pastille toujours visible, avec un bouton pause. Holo (H Company) lit les images, qui ne sont jamais conservées.
2. **Il propose** : quand il voit la notification d'arrivée de Karim, il propose « Je prépare l'onboarding de Karim comme pour Léa ? ». Il ne propose que si la base confirme une arrivée « nouvelle ».
3. **Il agit après accord** : trois agents H en parallèle dans l'intranet de test (Accès, Équipe, Docs), vérification de chaque action dans la base, rapport chiffré.

### Le cas de démo

Atelier Nova (PME fictive, données 100 % fictives). Sophie, office manager, a préparé l'arrivée de Léa, développeuse. Karim, commercial, arrive ensuite (son manager est volontairement vide : l'agent doit poser la question). Les trois agents :

- **Accès** : fiche, accès adaptés au poste, demande de badge (la commande de matériel attend une validation humaine).
- **Équipe** : message de bienvenue dans le bon canal, demande de parrain, créneau café.
- **Docs** : documents utiles et page « Bienvenue Karim » avec checklist jour 1, semaine 1, mois 1.

## Stack

- **H Company** : Holo (lecture d'écran, modèle `holo4-27b`) et agents H (navigateur hébergé).
- **Hugging Face** : classement des pages du wiki par poste (agent Docs), embeddings.
- **GitHub** : ce dépôt. **Vercel** : deux déploiements séparés. **Supabase** : authentification et base (23 tables).
- **Next.js** (App Router, TypeScript) pour le site et pour l'intranet.

## Architecture

Deux sites distincts, une base commune. Voir [le schéma détaillé](ghost-new-era/docs/ARCHITECTURE.md).

```
Navigateur de Sophie ── Site Ghost (Vercel) ──► Holo (lit les captures)
        │                      │
        │ cadre                └──► Supabase (comptes, sessions, consentements, propositions, événements d'agents)
        ▼                                   ▲
Intranet d'Atelier Nova (Vercel) ───────────┘  les actions de l'intranet écrivent dans la base,
  RH · Messagerie · Wiki                        ce qui permet de les vérifier
        ▲
        └── agents H (clic dans l'intranet), un par espace
```

## Contenu du dépôt

| Dossier | Contenu |
|---|---|
| [`ghost-new-era/site`](ghost-new-era/site/README.md) | Site Ghost : landing, tarifs, compte, paiement démo, questionnaire, portail, routes de lecture Holo |
| [`ghost-new-era/intranet`](ghost-new-era/intranet/README.md) | Intranet fictif d'Atelier Nova : espace RH, messagerie, wiki |
| [`ghost-new-era/agents`](ghost-new-era/agents/README.md) | Holo, Hugging Face et agents H |
| [`ghost-new-era/supabase`](ghost-new-era/supabase/README.md) | Schéma de la base et sécurité |
| [`ghost-new-era/donnees`](ghost-new-era/donnees) | Données fictives d'Atelier Nova |
| [`ghost-new-era/docs`](ghost-new-era/docs/README.md) | Specs, dossier d'équipe, charte graphique, architecture, état d'avancement, retours sur l'API de H |

## Comment tester

1. Ouvre https://ghost-new-era.vercel.app : landing, tarifs de démonstration (aucun paiement réel, aucune donnée bancaire).
2. Connecte-toi avec le **compte de démonstration de Sophie** (identifiants communiqués à part par l'équipe, jamais dans le dépôt).
3. Facultatif : **Connexions** (Notion, Slack, Gmail, comptes de sites) : chaque personne connecte ses propres outils, gardés dans le coffre-fort hébergé par H.
4. Portail : coche les outils, « Commencer l'observation », « Partager mon onglet » (Onglet Chrome), laisse l'accueil de l'espace RH visible. Quand la notification « Nouvelle arrivée : Karim Benali » est lue, Ghost propose ; dis « oui » ou clique.
5. Onglet **Agents en direct** : trois agents (Alma, Nino, Lia), leur écran et leurs clics ; réponds à la question sur le manager, valide la commande, puis lis le rapport final.
6. L'intranet seul (public, données fictives) : https://atelier-nova-intranet.vercel.app/intranet/rh

Avant un nouvel essai, remettre Karim à zéro (`docs/PLAN-DE-DEMO.md`). Le service des agents (Render, offre gratuite) peut mettre une minute à se réveiller.

### Ce qui n'est pas testé ou pas annoncé
Slack, Gmail et Notion (connexion réelle), une connexion automatique d'un agent sur un site, le taux de réussite (une dizaine de runs seulement), la durée humaine de référence (hypothèse de 2 h, non chronométrée).

## Lancer le projet en local

Chaque application a son propre `package.json` et son propre `.env.example`. Les clés vont uniquement dans un fichier `.env.local`, ignoré par git.

```bash
cd ghost-new-era/site && npm install && npm run dev        # http://localhost:3000
cd ghost-new-era/intranet && npm install && npm run dev    # http://localhost:3000 (autre terminal : PORT=3001 npm run dev)
```

## Équipe

Binta Kande (CEO : site, intranet, agents H, assemblage), Henriquet Makiadi (données, Supabase, messagerie, wiki, Holo, Hugging Face), Alejandro Mendoza (démarrage du projet), avec Assel Alla, Omar Medkouri et Vladimir Pilioua, qui ont contribué à la première version (voir la branche `archive-avant-new-era`).

## Ancien projet

Le premier projet (Ghost v1 : audit de tâches pour l'agence fictive Belvédère) est conservé avec tout son historique dans la branche [`archive-avant-new-era`](../../tree/archive-avant-new-era).
