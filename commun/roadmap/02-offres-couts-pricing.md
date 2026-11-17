# Ghost : roadmap, partie 2 : offres, coûts, pricing, budget (points 5, 6, 7)

Tous les montants sont hors taxes. Taux utilisé : 1 $ = 0,90 € **[H]**. Les calculs ont été refaits par script ; les hypothèses sont listées en fin de document.

**À retenir en 4 lignes**
- L'IA coûte **0,8 à 11 € par poste** pour un audit écran de 5 jours. Le temps humain coûte **environ 850 € par client**. Votre prix dépend du second, pas du premier.
- Hackathon : **70 à 130 € au total**, dont l'essentiel est couvert par vos 300 € de crédits H. Vous êtes à 15-25 €/jour, pas à 200 €/jour.
- Prix proposés : questionnaire gratuit, vocal 290 €, audit écran 1 900 € (10 postes), continu 29 €/poste/mois, personnel 9 €/mois.
- Point mort : **1 audit par mois** couvre les coûts fixes hors salaires ; **5 audits par mois** paient 2 fondateurs.

---

## 5. Les 3 modes d'analyse, présentés comme 3 offres

| | **1. Questionnaire** « Ghost Flash » | **2. Vocal** « Ghost Voix » | **3. Écran 5 jours** « Ghost Audit » |
|---|---|---|---|
| **Expérience** | Un lien, 15 questions, 5 minutes, rien à installer | Le salarié raconte un process (5 à 15 min). Ghost reformule en étapes numérotées. Il valide ou corrige. Les solutions arrivent ensuite. | Installation, choix des logiciels et des sites, travail normal pendant 5 jours, alerte dès J2, rapport à J6 |
| **Ce que l'IA produit** | 3 à 5 pistes classées, avec un gain « déclaré » | Process structuré validé, solutions par tâche (agent H, n8n, outil existant, gain sans IA), démonstration par l'agent en option | Tâches mesurées (fréquence et durée réelles), scoring, fiches opportunité, preuve par l'agent, workflows pré-remplis |
| **Fiabilité** | Faible : déclaratif. Les durées déclarées sont souvent surestimées. À afficher comme « estimation ». | Moyenne : déclaratif mais validé par la personne. Bonne sur les étapes, faible sur les durées. | Forte sur les durées et les fréquences. Limite : ce qui se passe hors écran reste invisible. |
| **Risque RGPD** | Très faible | Faible. Attention à la voix (donnée personnelle) et aux noms cités : transcription puis filtres, audio supprimé après validation. | **Élevé.** AIPD nécessaire, information individuelle, CSE s'il existe. |
| **Prix** | Gratuit | 290 € jusqu'à 5 personnes | 1 900 € jusqu'à 10 postes |
| **Rôle commercial** | Attirer | Créer la confiance, sans surveillance | Vendre la mise en place et le mode continu |

### Parcours d'autorisation des logiciels (mode écran)
1. **Installation** : le salarié installe lui-même l'application (jamais un déploiement silencieux par l'employeur). macOS demande « Enregistrement de l'écran » et « Accessibilité ».
2. **Écran d'accueil** : 3 boutons : Questionnaire, Vocal, Écran. Rappel en une phrase : « Votre responsable ne verra jamais vos captures ni vos résultats individuels. »
3. **Choix des logiciels** : liste des applications ouvertes, **toutes décochées par défaut**. Le salarié coche (ex. Excel, ImmoGest).
4. **Navigateur : par site.** S'il coche Chrome, il doit choisir les sites autorisés (liste blanche). Tout autre onglet n'est pas capté. La navigation privée n'est jamais captée.
5. **Icône** dans la barre des menus : colorée = capture active, grise = pause, barrée = fenêtre non autorisée au premier plan.
6. **Pause** en un clic : 15 minutes, 1 heure, jusqu'à demain.
7. **« Ce qui a été capté »** : journal local, lisible avant tout envoi. Chaque ligne montre le texte nettoyé. Bouton « supprimer cette ligne ».
8. **Fin d'audit** : écran « vos données ont été supprimées », avec la date.

### Montée en gamme
- Questionnaire → Vocal : « Vous déclarez 6 h perdues par semaine. En 15 minutes à la voix, on vous dit laquelle de ces tâches vaut le coup. »
- Vocal → Écran : « Vos durées sont des estimations. 5 jours de mesure donnent le chiffre réel et la preuve par l'agent. »
- Écran → Mise en place : audit déduit à 50 % si le client signe la mise en place dans les 30 jours.
- Mise en place → Continu : « Vos process changent. Ghost continue de repérer les nouvelles tâches répétitives. »

---

## 6. Coûts et pricing

### a) Coût du hackathon, jour par jour

| Jour | Sessions agent H [H] | Crédits H consommés | API Claude | Transcription, infra | Total |
|---|---|---|---|---|---|
| Lundi | 0 | 0 € | 0 € | 0 € | 0 € |
| Mardi | 20 (premiers essais) | 3 à 5 € | 2 à 4 € | 0 € | **4 à 9 €** |
| Mercredi | 80 (mise au point, test n°1) | 11 à 22 € | 4 à 9 € | moins de 1 € | **15 à 31 €** |
| Jeudi | 250 (plan de tests, test n°2) | 34 à 68 € | 7 à 14 € | moins de 1 € | **41 à 82 €** |
| Vendredi | 30 (répétitions, démo) | 4 à 8 € | 2 à 4 € | 0 € | **6 à 12 €** |
| **Total** | **380** | **51 à 103 €** | **15 à 31 €** | **1 €** | **67 à 133 €** |

- **Vos 300 € de crédits H suffisent largement** : ils couvrent environ 1 100 à 2 200 sessions à 0,15-0,30 $.
- **Argent réellement sorti** : 15 à 30 € d'API Claude, plus 10 € si vous prenez un nom de domaine. Supabase, Vercel et n8n restent sur leurs offres gratuites ou d'essai. **[H] : à confirmer pour n8n si vous n'utilisez pas une instance déjà existante.**
- Votre estimation de 20 à 60 € était juste pour l'argent sorti, un peu basse si on compte les crédits H.
- **Le seul scénario à 200 €/jour** : un agent qui boucle sans limite. Parade obligatoire : `max_steps` et `max_time_s` sur chaque session, et un plafond de dépense sur le compte.
- **La vraie limite n'est pas l'argent, c'est la concurrence** : 3 sessions simultanées en offre gratuite, 10 en Builder (20 $/mois). Pour passer 250 sessions jeudi, prenez Builder. **[H] : demandez lundi soir aux mentors H si vos crédits s'appliquent à l'offre et aux dépassements.**

Coût d'une session agent (estimation par calcul, à remplacer par vos mesures dès mardi) :
| Modèle | 20 étapes | 40 étapes | 80 étapes |
|---|---|---|---|
| Holo4 35B-A3B (0,30 $ / 2,00 $ par million de tokens) | 0,04 $ | 0,11 $ | 0,26 $ |
| Holo4 27B (0,40 $ / 3,00 $) | 0,05 $ | 0,15 $ | 0,36 $ |

Repères publics : H annonce 0,08 $ par tâche sur le banc d'essai OSWorld pour le 27B, et environ 1 000 sessions pour 20 $ en Builder (soit 0,02 $ la session simple).

### b) Coût unitaire par mode d'analyse

**Hypothèses de capture [H]** (à mesurer mercredi sur les sessions d'Henriquet) : 7 h de travail, capture sur changement d'écran, doublons supprimés par empreinte → **300 écrans utiles par jour et par poste**. Le texte est lu en local (OCR gratuit) : 250 tokens par écran. Une image 1280×800 vaut environ 1 400 tokens.

**Mode écran, 5 jours, par poste**
| Poste de coût | Économique | Équilibré | Premium |
|---|---|---|---|
| Principe | Texte seul, Haiku partout, Sonnet pour le rapport | Texte + 25 % des écrans en image (Haiku), synthèses en Sonnet | Tous les écrans en image (Sonnet), synthèses et rapport en Opus |
| Description des écrans, par jour | 0,014 $ | 0,027 $ | 1,20 $ |
| Synthèse quotidienne | 0,004 $ | 0,09 $ | 0,28 $ |
| **Sous-total 5 jours** | **0,09 $** | **0,59 $** | **7,40 $** |
| Rapport final | 0,14 $ | 0,20 $ | 0,72 $ |
| Génération des workflows et skills | 0,17 $ (3 tâches) | 0,35 $ (5 tâches) | 1,34 $ (8 tâches) |
| Sessions agent H (preuve) | 0,45 $ (3 sessions) | 0,75 $ (5) | 2,50 $ (10, modèle 27B) |
| Stockage (30 Mo) | négligeable | négligeable | négligeable |
| **Total par poste** | **0,84 $ = 0,76 €** | **1,89 $ = 1,70 €** | **11,96 $ = 10,77 €** |

- **Votre fourchette « 5 à 35 € » est le haut du premium.** Le pire cas (une image toutes les 10 secondes envoyée à Sonnet) coûte 50 $ par poste. C'est aussi exactement le dispositif que la CNIL a sanctionné.
- **Recommandation : scénario équilibré.** La qualité vient de l'étage déterministe et du contexte, pas du modèle le plus cher.

**Mode vocal, par enregistrement de 15 minutes**
| Poste | Coût |
|---|---|
| Transcription (0,003 à 0,006 $/min selon le service ; 0 $ en local avec Whisper) | 0,05 à 0,09 $ |
| Reformulation (Haiku) | 0,001 $ |
| Solutions (Sonnet) | 0,04 $ |
| **Total** | **environ 0,10 $ = 0,09 €** (0,23 € avec une démonstration par l'agent) |

**Questionnaire** : 0,001 $ avec Haiku, 0,02 $ avec Sonnet. Quelques dixièmes de centime à 2 centimes.

**API H ou Holo auto-hébergé sur Hugging Face ?**
| Carte (Hugging Face, AWS) | Prix | Coût mensuel allumé en continu | Seuil de rentabilité face à l'API (0,10 $/session) |
|---|---|---|---|
| L4 24 Go (modèle très compressé) | 0,80 $/h | 584 $ | 8 sessions/heure, soit 5 840/mois |
| L40S 48 Go | 1,80 $/h | 1 314 $ | 18 sessions/heure, soit 13 140/mois |
| A100 80 Go | 2,50 $/h | 1 825 $ | 25 sessions/heure, soit 18 250/mois |

- Un audit consomme 3 à 10 sessions. Il faudrait **plus de 1 300 audits par mois** pour rentabiliser une carte. **Conclusion : API H, sans hésiter.**
- Deux seules raisons d'auto-héberger : un client qui exige que rien ne sorte de chez lui, ou l'analyse d'écrans en local avec un petit Holo3.1 (0,8 à 9 milliards de paramètres, Apache 2.0). C'est un bon test pour le rapport de retours, pas un choix de production.
- **Licences** : Holo4 35B-A3B et Holo3.1 en Apache 2.0 (usage commercial permis). Holo4 27B en CC BY-NC 4.0 et Holo3 122B réservés à la recherche : pas d'auto-hébergement commercial, mais usage possible via l'API H. Holo2 et Holo1.5 : non commercial.

### c) Coût fixe mensuel de run

« Client » = un client abonné en mode continu, 10 postes en moyenne. Montants arrondis, **[H]** sauf Supabase, Vercel et H.

| Poste | MVP | 10 clients | 50 clients | 200 clients |
|---|---|---|---|---|
| Vercel (Pro, 20 $/siège) | 18 € | 18 € | 36 € | 54 € |
| Supabase (Pro 25 $, puis puissance en plus) | 23 € | 23 € | 68 € | 135 € |
| n8n (cloud, puis offre supérieure ou auto-hébergé) | 24 € | 24 € | 60 € | 40 € (auto-hébergé) |
| Abonnement H (Builder 20 $, puis Startup 200 $) | 18 € | 18 € | 180 € | 180 € |
| Nom de domaine, messagerie | 7 € | 7 € | 7 € | 15 € |
| Supervision, support client | 0 € | 0 € | 48 € | 180 € |
| **Sous-total technique** | **90 €** | **90 €** | **400 €** | **600 €** |
| Structure : assurance, comptable, DPO externe, juridique | 450 € | 450 € | 700 € | 900 € |
| **Total fixe mensuel** | **540 €** | **540 €** | **1 100 €** | **1 500 €** |
| IA variable (4 €/poste/mois en continu) | 0 € | 400 € | 2 000 € | 8 000 € |

Le coût technique ne bouge presque pas entre 0 et 10 clients. Ce qui grandit avec les clients, c'est l'IA variable et le support.

### d) Temps humain par client (PME de 10 postes, audit écran)

| Étape | Heures |
|---|---|
| Vente (2 rendez-vous, devis) | 4 |
| Lecture du formulaire, réglage des prompts | 2 |
| Installation à distance, séance d'information des salariés | 3 |
| Suivi pendant les 5 jours | 1 |
| Relecture et correction du rapport | 4 |
| Restitution | 2 |
| Support | 1 |
| **Total** | **17 h** |

**Valorisation : 50 €/h [H].** Justification : un profil junior à 35 000 € bruts par an coûte environ 49 000 € chargés ; sur 1 600 heures dont 65 % réellement productives, cela donne environ 47 €/h. **17 h × 50 € = 850 € par client.** À vérifier sur vos 3 premiers pilotes, chronomètre en main.

**Le levier de marge est ici** : passer de 17 h à 8 h (formulaire automatique, rapport relu en 1 h, restitution enregistrée) fait monter la marge de 53 % à 76 %.

### e) Pricing

**Entreprise**
| Offre | Prix | Coût IA | Temps humain | Paiement | **Coût de revient** | **Marge brute** | % |
|---|---|---|---|---|---|---|---|
| Ghost Flash (questionnaire) | 0 € | 0,02 € | 0 | 0 | 0,02 € | - | - |
| Ghost Voix (jusqu'à 5 personnes, restitution de 30 min) | **290 €** | 0,75 € | 1,5 h = 75 € | 4,60 € | **80 €** | **210 €** | 72 % |
| Ghost Audit (écran 5 jours, jusqu'à 10 postes, preuve par l'agent, plan) | **1 900 €** | 17 € | 17 h = 850 € | 28,75 € | **896 €** | **1 004 €** | 53 % |
| Poste supplémentaire | 120 € | 1,70 € | 0,5 h = 25 € | 2 € | 29 € | 91 € | 76 % |
| Ghost Continu (abonnement, minimum 5 postes) | **29 €/poste/mois** | 4 €/poste | 0,5 h/client/mois | 1,5 % | 70 €/mois pour 10 postes | 220 €/mois | 76 % |
| Mise en place par un consultant partenaire | 600 à 1 500 € par automatisation, facturés par le partenaire | - | - | - | - | commission de 15 % **[H]** | - |

- **Audit déduit** : 50 % du prix de l'audit est déduit si la mise en place est signée sous 30 jours.
- **Grands comptes (plus tard)** : au poste, 90 à 150 €, minimum 50 postes, vendu par un partenaire.
- Avec le scénario premium, la marge de l'audit ne tombe qu'à 48 %. Le choix du modèle pèse 90 € sur 1 900 €.

**Personnel**
| Offre | Prix | Coût de revient | Marge brute | % |
|---|---|---|---|---|
| Gratuit : questionnaire + 1 vocal par mois | 0 € | 0,10 € | - | - |
| Audit écran ponctuel de 5 jours, sans accompagnement | **29 €** | 1,40 € | 27,60 € | 95 % |
| Abonnement Solo (continu, alertes, 5 exécutions d'agent par mois) | **9 €/mois** | 1,90 € | 7,10 € | 79 % |

Risque CNIL bien plus faible : la personne s'audite elle-même, sans employeur. Restent les données de ses propres clients à l'écran : le floutage local s'applique de la même façon.

**Point mort**
| Cas | Calcul | Résultat |
|---|---|---|
| Coûts fixes seuls (540 €/mois) | 540 ÷ 1 004 € de marge | **0,54 audit par mois : 1 audit suffit** |
| Coûts fixes + 2 fondateurs payés (8 400 €/mois chargés) | 8 940 ÷ 1 854 € de contribution | **4,8 audits par mois, soit 5** (82 h de travail : tenable à deux) |
| Avec le personnel seul | 540 ÷ 7,10 € | 76 abonnés Solo |

### f) Comparaison de valeur

**Face à un consultant**
| | Ghost Audit | Consultant IA |
|---|---|---|
| Prix | 1 900 € | 3 jours de diagnostic à 600-900 €/jour = 1 800 à 2 700 € ; audit de 5 à 15 jours annoncé entre 8 et 22 k€ |
| Méthode | Mesure sur 5 jours | Entretiens (déclaratif) |
| Preuve | Tâche exécutée et chronométrée | Aucune |
| Suite | Workflows pré-remplis, fiches prêtes | Jours de mise en place en plus |

Ne dites pas « moins cher qu'un junior à 1 000-2 000 €/jour » : les grilles publiques ne confirment pas ce tarif pour un junior. Dites : « au prix de 2 à 3 jours de consultant, avec la mesure et la preuve en plus ».

**Gain client, agence fictive de 10 personnes**
| Lecture | Calcul | Heures par an |
|---|---|---|
| Formule du professeur (du haut vers le bas) | 10 × 220 jours × 0,75 h × 60 % d'adoption | **990 h** |
| Avec la part réellement récupérée (70 % **[H]**) | 990 × 70 % | **693 h** |
| Tâche par tâche, 3 tâches chiffrées (voir `07`) | 49 + 84 + 72 | **205 h** |

L'écart de 1 à 5 est le point à assumer. Le 0,75 h/jour est déclaratif et s'applique à 10 personnes dont certaines sont peu devant l'écran. **Affichez le chiffre tâche par tâche. Présentez 990 h comme le plafond théorique.** L'audit sert précisément à mesurer la réalité.

**Coût du projet pour le client [H]**
| | An 1 | Années suivantes |
|---|---|---|
| Audit | 1 900 € | 0 € |
| Mise en place de 3 automatisations (3 × 1 200 €) | 3 600 € | 0 € |
| Conduite du changement (10 personnes × 2 h × 30 €) | 600 € | 600 € (maintenance, rappels) |
| **Total sans abonnement** | **6 100 €** | **600 €** |
| Option Ghost Continu (10 postes) | + 3 480 € | + 3 480 € |
| **Total avec abonnement** | **9 580 €** | **4 080 €** |

**Coût par heure gagnée** (à comparer à 30 €/h chargés **[H]**)
| | Sur 693 h | Sur 205 h |
|---|---|---|
| An 1, sans abonnement | 8,80 €/h | 29,80 €/h |
| Années suivantes, sans abonnement | 0,90 €/h | 2,90 €/h |
| An 1, avec abonnement | 13,80 €/h | 46,70 €/h |

Lecture honnête : sur les seules 3 tâches chiffrées, l'an 1 est à l'équilibre et le gain vient à partir de l'an 2. L'abonnement continu ne se justifie que si l'audit trouve plus que ces 3 tâches. Autre lecture pour un gérant : une seule vente de plus dans l'année couvre tout le projet. **[H] à vérifier auprès d'un gérant : honoraires moyens par vente.**

**Phrases types**
> Client : « Le projet coûte 6 100 € la première année, puis 600 € par an. Il fait gagner 205 heures par an sur 3 tâches si 50 à 70 % des utilisateurs l'adoptent, et jusqu'à 693 heures si l'audit confirme 45 minutes par jour et par personne. »

> Ghost : « Ghost coûte environ 20 000 € la première année hors salaires, puis environ 170 000 € par an avec 2 salaires. Il est à l'équilibre à 5 audits par mois. »

### g) Tableaux récapitulatifs pour les slides

**Slide « Business model »**
| Offre | Pour qui | Prix | Coût de revient | Marge brute |
|---|---|---|---|---|
| Flash (questionnaire) | Tous | Gratuit | 0,02 € | acquisition |
| Voix (vocal) | Équipe de 5 | 290 € | 80 € | 210 € (72 %) |
| Audit (écran 5 jours) | PME de 10 postes | 1 900 € | 896 € | 1 004 € (53 %) |
| Continu | PME | 29 €/poste/mois | 7 €/poste | 22 €/poste (76 %) |
| Solo | Indépendant | 9 €/mois | 1,90 € | 7,10 € (79 %) |
| Mise en place | Via partenaires | 600 à 1 500 € par automatisation | - | commission de 15 % |

Point mort : 1 audit par mois (coûts fixes), 5 audits par mois (2 salaires). Audit déduit à 50 % si mise en place signée.

**Slide « Estimation du coût de run »**
| | Montant |
|---|---|
| IA par poste, audit de 5 jours | 0,76 € (économique) · **1,70 € (retenu)** · 10,77 € (premium) |
| IA par enregistrement vocal | 0,09 € |
| Une exécution de l'agent H | 0,04 à 0,36 $ selon la longueur |
| Temps humain par client | 17 h, soit 850 € |
| Coûts fixes mensuels | 540 € (MVP) · 1 100 € (50 clients) · 1 500 € (200 clients) |
| Coût de la semaine de hackathon | 67 à 133 €, couverts par les crédits H sauf 15 à 30 € |

Message de la slide : « L'IA représente 2 % de notre coût de revient. Notre coût, c'est l'humain. Notre roadmap consiste à l'automatiser. »

---

## 7. Budget 3 C de la startup

| | An 1 | An 2 | Détail |
|---|---|---|---|
| **Construire** | **6 000 €** | **25 000 €** | An 1 : création de la société (1 000), CGV, contrat de sous-traitance et AIPD avec un juriste (3 500), marque (230), comptes développeur et signature des applications (400), outils (720). An 2 : version Windows (10 000), test d'intrusion (5 000), juridique (4 000), refonte de l'application (6 000). |
| **Consommer** | **8 400 €** | **26 700 €** | Technique (90 puis 400 €/mois), structure (450 puis 900 €/mois), IA variable (1 200 puis 8 200 €), frais de paiement. |
| **Conduire le changement** | **6 000 €** | **20 000 €** | An 1 : 3 pilotes gratuits (2 550 € de temps valorisé), salon, contenus, guides d'adoption pour les salariés, formation de 2 consultants partenaires. An 2 : salons, programme partenaires, suivi des clients. |
| **Total hors salaires** | **20 400 €** | **71 700 €** | |
| Salaires (2 fondateurs) | 0 € (non payés) | 100 000 € | |
| **Total** | **20 400 €** | **171 700 €** | |
| **Revenus [H]** | **55 900 €** | **191 100 €** | An 1 : 24 audits, 10 packs Voix, 3 clients en continu sur 6 mois, 40 abonnés Solo sur 6 mois. An 2 : 60 audits, 30 packs Voix, 15 clients en continu, 150 abonnés Solo. |

Lecture : l'an 1 est finançable sans levée si les fondateurs ne se paient pas. L'an 2 n'est à l'équilibre que si le volume d'audits est multiplié par 2,5. **[H] à vérifier en premier : le prix de 1 900 € est-il accepté ? Auprès de 5 gérants d'agence, avant d'écrire une ligne de code de plus.**

---

## Hypothèses à vérifier, et auprès de qui

| Hypothèse | Qui interroger en premier |
|---|---|
| 300 écrans utiles par jour et par poste | Mesure sur les sessions d'Henriquet mercredi |
| 0,10 à 0,30 $ par session d'agent | Mesure d'Alejandro mardi ; tableau de bord H |
| Crédits H utilisables pour l'offre Builder et les dépassements | Mentors H Company |
| 17 h de temps humain par client | Vos 3 premiers pilotes |
| 1 900 € acceptés par un gérant d'agence | 5 gérants (réseau d'Assel, FNAIM locale) |
| 0,75 h par jour et par personne | 3 agences, par chronométrage |
| 30 €/h chargés, part récupérée de 70 % | Un gérant et son expert-comptable |
| Prix n8n, assurance, DPO | Devis réels |

## Sources
- H Company : [offres](https://hcompany.ai/pricing), [prix des modèles](https://hcompany.ai/holo-models-api), [licences](https://hcompany.ai/research/models), [annonce Holo4](https://datanorth.ai/news/h-company-releases-holo4)
- Claude (sources secondaires, à confirmer sur la page officielle) : [Maxim](https://www.getmaxim.ai/articles/claude-api-pricing/), [TeamoRouter](https://teamorouter.com/blogs/claude-code-pricing-guide)
- Transcription : [Voxtral](https://www.eesel.ai/blog/voxtral-3-pricing), [ElevenLabs Scribe](https://saaspricealerts.com/guides/elevenlabs-pricing-per-minute/), [comparatif par heure](https://www.digitalapplied.com/blog/ai-audio-video-processing-cost-per-hour-models-2026)
- [Hugging Face, prix des Inference Endpoints](https://huggingface.co/docs/inference-endpoints/en/pricing)
- [Supabase, prix](https://toolradar.com/tools/supabase/pricing) · Vercel Pro à 20 $ par siège et n8n à partir de 20 € : sources secondaires, à confirmer
- Tarifs consultants : [Studeria](https://www.studeria.fr/articles-de-blog/tjm-consultant-ia-2026-tarifs-grille), [Comparateur IA](https://comparateur-ia.com/ai-consultants/)
- [CNIL, sanction du 19/12/2024](https://www.cnil.fr/fr/surveillance-excessive-des-salaries-sanction-de-40-000-euros-entreprise-secteur-immobilier)
