# Ghost : roadmap, partie 6 : tests de l'agent H et rapport de retours (points 14, 16)

Objectif : des retours qu'un ingénieur de H Company peut utiliser lundi matin. Donc des chiffres, des identifiants de session, et des cas qu'il peut rejouer.

**Répartition** : Alejandro pilote et écrit le script. Vladimir lance les séries et construit les sites. Assel rédige le rapport. Chacun remplit le journal dès qu'il touche à l'API.

## 1. Règles de mesure (à respecter, sinon les chiffres ne valent rien)
1. **10 essais par cas.** Moins de 10, on écrit « indicatif ».
2. **La réussite est vérifiée par notre code**, pas par l'agent : les annonces existent dans `annonces_portails`, tous les champs sont justes. Un agent qui dit « terminé » alors que c'est faux est le défaut le plus grave : on le compte à part.
3. **Mêmes entrées à chaque essai** : les 3 mêmes mandats, la même consigne, la base des sites vidée avant chaque essai.
4. **Une seule variable change à la fois** (le site, ou le modèle, ou la consigne).
5. **Limites sur chaque session** : nombre d'étapes et durée maximum. Une session sans limite peut coûter cher.
6. **Tout est écrit** dans `tests_agent` (format §12 de `04`), avec l'identifiant de session.

## 2. Les tests, par difficulté croissante

| Niveau | Cas | Ce qu'on apprend | Quand | Essais |
|---|---|---|---|---|
| **1** | 1 annonce sur le site A (formulaire simple, 5 champs) | L'agent sait-il faire la base ? Combien coûte une session ? | Mardi midi (5 essais), jeudi (10) | 15 |
| **2** | 1 annonce sur A puis B (noms de champs différents) | Tient-il quand les libellés changent ? | Mercredi | 10 |
| **3** | Site C : 2 étapes, menu déroulant, case à cocher | Formulaires réalistes | Mercredi | 10 |
| **4** | Site C avec envoi d'une photo | L'envoi de fichier marche-t-il dans le navigateur hébergé ? | Jeudi matin | 10 |
| **5** | Site D « piège » : bandeau de cookies, champ obligatoire peu visible, message d'erreur à corriger | Reprise sur erreur | Jeudi après-midi | 10 |
| **6** | Les 3 sites à la suite, 1 annonce (**le cas de la démo**) | Durée et réussite du parcours complet | Jeudi matin | 10 |
| **7** | Cas 6, **consignes générées par Ghost** contre consignes écrites à la main | Notre chaîne dégrade-t-elle l'agent ? | Jeudi matin | 10 + 10 |
| **8** | L'interface change entre 2 essais (bouton renommé, champs dans un autre ordre) | Robustesse face à une mise à jour du site : l'argument contre un script figé | Jeudi après-midi | 10 |
| **9** | 1 agent chef + 3 sous-agents (1 par site) contre 1 agent seul | Gain de temps, surcoût, pannes de coordination | Jeudi après-midi, si le test n°2 est passé | 10 + 10 |
| **10** | Logiciel de bureau en local : recopier 5 lignes d'un tableur vers le site A | L'environnement `desktop` sur un Mac de l'équipe | Bonus | 5 |
| **11** | 3 annonces × 3 sites (9 dépôts) dans une seule session | Tenue sur une tâche longue | Bonus | 5 |

Total prévu : environ 250 sessions, soit 25 à 75 $ selon la longueur. Ordre de priorité si le temps manque : 1, 6, 2, 3, 7, 4, 5, 8, puis le reste. Vladimir passe les niveaux 1 à 5, Alejandro les niveaux 6 et suivants.

### Variables à comparer (une à la fois, sur le cas 6)
| Variable | Valeurs | Essais |
|---|---|---|
| Modèle | Holo4 35B-A3B contre Holo4 27B | 10 + 10 |
| Agent prêt à l'emploi | `h/web-surfer-flash` contre `h/web-surfer-pro` | 10 + 10 |
| Consigne | 2 lignes contre étapes numérotées détaillées | 10 + 10 |
| Réponse structurée | Avec contre sans | 5 + 5 |

## 3. Grille de mesure

| Mesure | Comment | Seuil visé pour la démo |
|---|---|---|
| **Taux de réussite vérifié** | Annonces justes en base ÷ essais | 9 sur 10 sur le cas 6 |
| **Faux succès** | L'agent dit « terminé », la base dit non | 0 |
| **Durée** | Médiane et pire cas, mesurés par notre code | Médiane sous 2 minutes |
| **Étapes** | Nombre d'actions | - |
| **Coût par session** | Lu dans le tableau de bord H ou calculé à partir des tokens | Sous 0,30 $ |
| **Gain face à l'humain** | Durée chronométrée d'Henriquet ÷ durée de l'agent | Plus de 5 fois |
| **Stabilité** | Écart entre le meilleur et le pire essai | - |

**Types d'erreur** (un code par échec)
| Code | Erreur |
|---|---|
| E1 | Élément non trouvé ou mauvais clic |
| E2 | Bon élément, mauvaise valeur (champ inversé, prix mal saisi) |
| E3 | Boucle (répète la même action) |
| E4 | Dépassement de la durée ou du nombre d'étapes |
| E5 | Réponse structurée absente ou invalide |
| E6 | **Faux succès** |
| E7 | Blocage (bandeau, fenêtre, fichier) |
| E8 | Infrastructure (erreur de l'API, session non démarrée) |

## 4. Comparaison avec les alternatives (sur le cas 6 uniquement)

| Alternative | Pourquoi la tester | Essais | Ce qu'on mesure en plus |
|---|---|---|---|
| **Appel direct par n8n** (nos sites ont une base derrière) | La référence quand une API existe : montre que l'agent n'est pas toujours le bon choix | 10 | Temps de construction du workflow |
| **Script d'automatisation écrit à la main** | Rapide et gratuit à l'exécution, mais cassé au premier changement d'interface | 10, puis 10 après le changement du test 8 | Temps d'écriture, réussite après changement |
| **Un autre agent computer-use** (celui que vous avez sous la main) | Situer H | 5 | Réussite, durée, coût |
| **Petit Holo3.1 en local** (poids ouverts sur Hugging Face) | Lire un écran sans rien envoyer : utile à la confidentialité | 5 écrans | Est-il capable de décrire un écran ? Temps par écran sur un Mac |

Tableau final attendu (à mettre sur la slide 11) :
| Méthode | Réussite | Durée médiane | Coût par exécution | Temps de mise en place | Tient après un changement d'interface |
|---|---|---|---|---|---|
| À la main | - | (mesure d'Henriquet) | (coût horaire) | 0 | oui |
| n8n direct | | | | | oui, si l'API ne change pas |
| Script à la main | | | | | |
| Agent H | | | | | |
| Autre agent | | | | | |

C'est ce tableau qui prouve la règle « API → n8n, pas d'API → agent ».

## 5. Journal de retours, à remplir pendant la semaine (point 14)

Un tableau partagé, une ligne par observation. On écrit à chaud : 2 minutes par ligne.

| Date, heure | Qui | Ce que j'essayais de faire | Ce que j'attendais | Ce qui s'est passé | Type (marche / casse / surprise / doc) | Gravité (1 à 3) | Identifiant de session | Contournement | Suggestion pour H |
|---|---|---|---|---|---|---|---|---|---|
| mar. 11h40 | Alejandro | Premier appel à l'agent rapide | Réponse en moins d'une minute | | | | | | |

Rappel du soir (5 minutes au point de 18h30) : chacun donne 1 chose qui a marché, 1 qui a cassé, 1 qui l'a surpris.

**Points à vérifier dès mardi** (repérés en lisant la documentation, à confirmer ou à infirmer)
| Point | Pourquoi ça compte |
|---|---|
| Le coût d'une session est-il renvoyé par l'API, ou seulement visible dans le tableau de bord ? | Sans lui, impossible de chiffrer le coût de run |
| La page de prix parle de « sessions environ » : combien de tokens derrière ? | Prévision de budget |
| La réponse structurée s'appelle-t-elle `answer_format` ou `answer_schema` selon l'endroit ? | Friction de démarrage |
| Existe-t-il un bureau hébergé, ou seulement le bureau local ? | Limite notre cas « logiciel installé » |
| Envoi de fichier dans le navigateur hébergé | Photos d'annonces |
| Peut-on voir l'agent en direct (flux vidéo ou captures) pour la démo ? | Effet sur le jury |
| Comportement à 3 sessions simultanées en offre gratuite | Séries de tests |
| Que renvoie l'agent face à un champ qu'il ne trouve pas : échec net ou faux succès ? | Confiance |

## 6. Modèle du rapport de retours pour H Company (point 16)

À rendre vendredi. 2 pages maximum, plus une annexe de données.

```
RETOURS SUR L'AGENT API : équipe Ghost (Team 14), hackathon Build The Future, novembre 2026

1. CE QUE NOUS AVONS CONSTRUIT (5 lignes)
   Le cas d'usage, le rôle de l'agent dans notre chaîne, la version du SDK, les modèles utilisés.

2. NOS CHIFFRES
   Sessions lancées : ___   Dépense totale : ___ $   Coût médian par session : ___ $
   Tableau : niveau | cas | modèle | essais | réussite vérifiée | faux succès | durée médiane | étapes | coût

3. CE QUI A MARCHÉ (3 à 5 points, chacun avec un chiffre)
   Ex. « Changement de libellés entre 2 sites : __ sur 10, sans modifier la consigne. »

4. CE QUI A CASSÉ (3 à 5 points)
   Pour chacun : le cas, la fréquence (__ sur 10), le type d'erreur, 1 identifiant de session à rejouer,
   ce que nous attendions.

5. CE QUI NOUS A SURPRIS (en bien et en mal)

6. CE QUE NOUS AVONS DÛ AJOUTER NOUS-MÊMES, ET POURQUOI
   Tableau : besoin | ce que l'API ne faisait pas (ou pas assez bien) | notre contournement | temps passé
   Ex. « Vérifier le résultat : nous relisons notre base, car la réponse de l'agent ne suffit pas. »
   Ex. « Lire les écrans sans les envoyer : modèle local, car ___. »

7. COMPARAISON
   Tableau de la section 4 (à la main, n8n, script, agent H, autre agent).
   Notre conclusion : quand l'agent H est le bon choix, quand il ne l'est pas.

8. DOCUMENTATION ET SDK
   Ce qui nous a fait perdre du temps au démarrage. Ce qui nous en a fait gagner.

9. NOS SUGGESTIONS, CLASSÉES PAR IMPACT
   Tableau : suggestion | problème résolu | impact pour nous (fort / moyen / faible)

10. CE QUE NOUS TESTERIONS AVEC UNE SEMAINE DE PLUS

ANNEXE : export de la table tests_agent, consignes exactes, adresses des sites de test.
```

**Ce qui rend ce rapport « d'expert »**
- Chaque affirmation a un chiffre ou un identifiant de session.
- On sépare ce qui vient de l'agent de ce qui vient de nos consignes (test 7).
- On dit où l'agent n'est **pas** le bon outil. C'est le retour le plus utile pour une équipe produit, et le plus crédible devant un jury.
- On ne conclut rien sur moins de 10 essais.

## Sources
- [Agents API : démarrage](https://hub.hcompany.ai/agents-api/overview#quickstart) · [environnements](https://hub.hcompany.ai/agents-api/environments/overview) · [exécution locale](https://hub.hcompany.ai/agents-api/local-runtime) · [navigateur hébergé](https://hub.hcompany.ai/agents-api/browser/configuration#browser-profiles)
- [SDK Python](https://pypi.org/project/hai-agents/1.2.4/) · [SDK TypeScript](https://github.com/hcompai/hai-agents-ts)
- [Prix H](https://hcompany.ai/pricing) · [Modèles Holo](https://hcompany.ai/research/models)
