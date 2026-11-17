# Ghost : roadmap, partie 1 : stratégie (points 1, 2, 3, 4, 17, 19)

Réponse au prompt `prompts/prompt-fable-roadmap.md`, rédigée lundi 16/11/2026 au soir. Cohérente avec `kit/` et `commun/architecture.md`.

**Les 7 documents de la roadmap**
| Fichier | Contenu | Pour qui |
|---|---|---|
| `commun/roadmap/01-strategie.md` | Résumé, critique, nom, concurrence, ICP, personae, valeur ajoutée, transparence | Assel, Binta |
| `commun/roadmap/02-offres-couts-pricing.md` | 3 modes en offres, coûts, pricing, budget 3 C | Assel, Binta |
| `commun/roadmap/03-mvp-demo-planning.md` | Architecture MVP, script de démo, planning jour par jour, organigramme de l'app | Tous |
| `commun/roadmap/04-equipe-chantiers.md` | Contrats ajoutés, 6 chantiers, RACI, prompts de départ | Tous |
| `commun/roadmap/05-conformite-roadmap-produit.md` | RGPD, AI Act, risques, questions du jury, roadmap 24 mois | Assel |
| `commun/roadmap/06-tests-agent-h.md` | Plan de tests de l'agent H, rapport de retours pour H | Alejandro, Vladimir, Assel |
| `commun/roadmap/07-fiche-scoring-base-immo-formulaire.md` | Fiche opportunité, scoring, base immobilier, formulaire, prompts 3 couches | Omar, Henriquet, Binta, Vladimir |

Convention : **[H]** = hypothèse non vérifiée, avec la personne à qui la poser en premier. Taux de change utilisé : 1 $ = 0,90 € **[H]**.

---

## 1. Résumé exécutif

Ghost observe le travail sur écran (logiciels autorisés par le salarié), détecte les tâches répétitives, fait exécuter l'une d'elles par l'agent H pour chronométrer le gain, puis livre un plan chiffré.
La preuve par l'exécution est votre seul vrai différenciant : les concurrents montrent des cartes de process, vous montrez la tâche faite en 95 secondes.
Votre coût n'est pas l'IA (1 à 11 € par poste) mais le temps humain (environ 850 € par client). Le prix se fixe là-dessus.
Le risque n°1 est juridique : la CNIL a sanctionné en 2024 une société **du secteur immobilier**, votre tête de pont, pour des captures d'écran régulières.
Cette semaine, une seule chose compte : la boucle capture → détection → agent H → chrono tourne en live. Tout le reste est décor.

## Corrections de vos données de départ

| Votre donnée | Ce que disent les sources | Conséquence |
|---|---|---|
| Offres H en tokens (60 M / 1 Md / 10 Md) | La page prix parle de **sessions** : Free environ 60/mois, Builder environ 1 000, Startup environ 10 000. Concurrence 3 / 10 / 100 confirmée. Dépassement au coût du modèle + 20 % confirmé. | Raisonnez en sessions. Une session coûte environ 0,02 à 0,30 $. |
| Prix Claude | Confirmés par plusieurs sources secondaires. Piège : Haiku 5.5 passe à 0,50 $ / 2,50 $ au-delà de 100 000 tokens par prompt. | Omar découpe en lots de moins de 100 000 tokens. |
| Holo4 27B non commercial | Confirmé (CC BY-NC 4.0). Holo4 35B-A3B et Holo3.1 sont en Apache 2.0. Via l'API H, le 27B reste utilisable commercialement. | Auto-hébergement commercial : 35B-A3B uniquement. |
| 5 à 35 € d'IA par poste | Avec OCR local et capture sur événement : **0,8 à 11 €**. 35 € correspond à une capture toutes les 10 secondes envoyée en image. | Votre architecture actuelle est 3 à 40 fois moins chère que votre estimation. |
| Consultant IA junior à 1 000-2 000 €/jour | Les grilles publiques donnent 300-500 € (junior), 600-900 € (confirmé), 1 000-1 800 € (senior). | Ne mettez pas ce chiffre sur une slide sans écrire « source : notre professeur ». Comparez plutôt à un audit de 5 à 15 jours. |
| « PME sans IA » | 40 % des TPE-PME utilisent déjà une solution d'IA en 2026 (53 % des PME). | Reformulez : « PME qui utilisent ChatGPT mais n'ont automatisé aucun process ». |
| Multidiffusion d'annonces à la main | Les logiciels de transaction diffusent déjà vers les portails par passerelle. | Le cas de démo doit être reformulé (voir risque 2). |

## Critique d'entrée : les 3 plus gros risques

### Risque 1 : vous vendez de la capture d'écran de salariés dans le secteur que la CNIL vient de sanctionner
- La sanction de 40 000 € du 19/12/2024 visait une entreprise du secteur immobilier : captures toutes les 3 à 15 minutes et mesure de l'« inactivité ».
- Votre « volontariat » ne suffit pas comme base légale. Entre un salarié et son employeur, le consentement est rarement jugé libre. La base réaliste est l'intérêt légitime de l'employeur, avec le volontariat comme garantie. **[H] à valider avec un juriste ou un DPO.**
- **Autoriser « Chrome » autorise toute la vie perso dans Chrome** (webmail, banque). Votre feature clé a un trou. Pour un navigateur, l'autorisation doit se faire par site (liste blanche de domaines), pas par application.
- Dans une agence de 5 personnes, « agrégé par tâche » ne protège personne : il y a une seule assistante.
- **Comment le retourner.** Présentez Ghost comme le contre-modèle point par point de la sanction : pas d'intervalle fixe, pas de mesure d'inactivité, pas de donnée individuelle pour le gérant, floutage avant envoi, liste blanche par site. Dites la sanction vous-mêmes avant que le jury ne la sorte. Et gardez le mode vocal : c'est l'offre sans aucun risque de surveillance.

### Risque 2 : votre tâche de démo est déjà résolue par les logiciels métier
- La multidiffusion vers les grands portails est une fonction standard des logiciels de transaction et des passerelles. Un juré qui connaît l'immobilier le dira en 10 secondes.
- Beaucoup de négociateurs sont des agents commerciaux indépendants, souvent sur le terrain. Les réseaux de mandataires pèsent environ 29 % du marché. Le « 0,75 h par jour pour 10 personnes » n'est vérifié nulle part. **[H] à vérifier auprès de 3 gérants d'agence.**
- Chiffré tâche par tâche, on trouve environ **205 h/an sur 3 tâches**, pas 990 h (voir `07`). L'écart est de 1 à 5.
- **Comment le retourner.** Gardez les 3 faux portails, mais présentez-les comme « 3 sites secondaires sans passerelle » (site de la commune, réseau local, site vitrine d'un partenaire). Et faites dire à Ghost : « pour les grands portails, activez la passerelle de votre logiciel : gain immédiat, sans IA ». Un audit qui recommande parfois de ne rien acheter est crédible. La règle devient votre message : **API disponible → n8n. Pas d'API → agent H. Déjà couvert par l'outil → rien à construire.**

### Risque 3 : le périmètre est trop large pour 4 jours et pour 6 personnes
- Application Mac + extension Chrome + Windows + 3 modes + 3 profils + n8n + sous-agents + comparaison Hugging Face + formulaire + 3 couches de prompts. Le jury note un agent qui tourne, pas une liste.
- Promesse dangereuse : « même entrée → même analyse ». Un LLM n'est pas strictement déterministe. Si un juré relance, il peut voir une différence.
- **Comment le retourner.** Coupez franchement (liste en `03`). Dites « reproductible à 9 fois sur 10, mesuré sur 5 relances », avec le chiffre. La limite assumée et mesurée rapporte des points sur le critère « apprentissages » (25 %).

Deux faiblesses secondaires : votre marge dépend du temps humain par client (17 h), et vos concurrents annoncent eux aussi la génération d'agents. Votre avance tient au prix, au délai et à la conformité française, pas à la technologie.

---

## 2. Nom et slogan : risques et parades

| Risque | Niveau | Parade |
|---|---|---|
| **Marque existante.** « Ghost » est une marque enregistrée de la Ghost Foundation (plateforme de publication), au moins aux États-Unis en classes 35, 38 et 42. Le mot est très utilisé dans le logiciel. | Élevé pour un dépôt, nul pour le hackathon | Je n'ai pas vérifié les bases INPI et EUIPO : faites une recherche en classes 9 et 42 avant tout dépôt. Prévoyez un nom composé (« Ghost Audit », « GhostWork ») et un nom de domaine distinct. |
| **Connotation « espion ».** Un fantôme observe sans être vu. C'est l'opposé de votre promesse. « To ghost someone » veut aussi dire ignorer quelqu'un. | Élevé devant un salarié ou un CSE | Retournez le sens : le fantôme n'est pas celui qui regarde, c'est celui qui fait la tâche à votre place. Phrase à dire : « Ghost ne vous observe pas en cachette. Il fait le travail ingrat à votre place, et il porte une clochette. » |
| **Slogan en anglais** pour des gérants d'agence français | Moyen | Sous-titre français sur toutes les slides : « Voir le travail. Faire disparaître la corvée. » |
| **Icône** | Moyen | Icône toujours visible, colorée quand la capture est active, grise en pause. Jamais d'icône masquable. |

---

## 3. Analyse concurrentielle

| Acteur | Cible | Prix public | Méthode | Livrable | Limite | Notre angle |
|---|---|---|---|---|---|---|
| **Mimica** | Grandes entreprises, banque-assurance, finance | Non publié (devis) | Enregistrement du poste, cartes de process par IA | Cartes, classement des automatisations, agents générés | Vente longue, pas fait pour 10 salariés | Prix affiché, 5 jours, preuve en live |
| **KYP.ai** | Grandes entreprises, centres de services | Non publié (abonnement sur devis) | Capture du poste + données systèmes | Opportunités classées par ROI, code d'agent | Déploiement lourd, logique de productivité des équipes | Aucune mesure individuelle, vocabulaire métier |
| **Skan.ai** | Grands comptes | Non publié (devis) | Observation sans intégration | Graphe du travail | Idem, pas de PME | Idem |
| **UiPath Task Mining** | Clients UiPath | Sur devis, dans les offres plateforme | Enregistrement + lien vers les robots | Candidats à l'automatisation | Suppose d'acheter UiPath | Indépendant de l'outil recommandé |
| **Celonis Task Mining** | Grands comptes avec ERP | Sur devis (réputé le plus cher) | Journaux d'événements + poste | Analyse de process | Demande des données propres et une équipe data | Zéro intégration |
| **Microsoft Power Automate (process et task mining)** | Entreprises sous Microsoft 365 | **15 $/utilisateur/mois** (Premium) | L'utilisateur enregistre lui-même une tâche | Analyse + flux | Il faut déjà savoir quelle tâche enregistrer et savoir lire le résultat | Ghost trouve la tâche à la place du client |
| **Fluency** | Équipes qui documentent des procédures | À partir de **19 $/utilisateur/mois** | Enregistrement d'une procédure | Mode opératoire rédigé | Documente, ne chiffre pas et n'exécute pas | Chiffrage + exécution |
| **Consultants et ESN IA (France)** | PME, ETI | 300 à 1 800 €/jour selon séniorité ; audit de 5 à 15 jours annoncé entre 8 et 22 k€ (une source commerciale) | Entretiens, ateliers | Rapport, feuille de route | Repose sur du déclaratif, cher, dépend du consultant | Observation réelle, 5 à 10 fois moins cher, plan prêt à déployer. À terme, partenaires plutôt que rivaux |
| **Ne rien faire** | Tout le monde | 0 € | - | - | Le temps perdu continue, invisible | Questionnaire gratuit pour rendre le coût visible |
| **L'éditeur du logiciel métier** (concurrent oublié) | Ses clients | Inclus ou en option | Fonctions intégrées (passerelles, relances) | - | Ne couvre que son propre logiciel | Ghost couvre ce qui se passe **entre** les logiciels |

**Positionnement en 3 phrases**
1. Ghost est l'audit d'automatisation des petites équipes : 5 jours, un prix affiché, aucun projet informatique.
2. Il ne se contente pas de montrer où part le temps : il exécute la tâche devant vous et chronomètre.
3. Il est conçu contre la surveillance : le salarié choisit ce qui est vu, le gérant ne voit que des tâches, jamais des personnes.

---

## 4. ICP et personae

### 4.1 Analyse des ICP

| | 1. Agences immobilières 3-30 | 2. Cabinets comptables 5-50 | 3. Indépendants | 4. ETI et grands comptes |
|---|---|---|---|---|
| **Verdict** | Validé comme tête de pont, sous 2 conditions (ci-dessous) | À garder en n°2, pas avant l'AIPD | **À attaquer en parallèle, tout de suite** | Plus tard, par partenaires |
| **Taille France** | Environ 30 000 agences ; 41 741 cartes T en 2022 ; environ 160 000 personnes. Segment 3-30 : **[H] 12 000 à 15 000**, à vérifier avec l'INSEE (code 6831Z par tranche d'effectif) ou la FNAIM | 19 490 sociétés d'expertise comptable, 21 611 experts-comptables. Environ 80 % ont moins de 10 collaborateurs, donc segment 5-50 : **[H] 4 000 à 6 000** | 3,62 millions d'indépendants actifs (Urssaf, T1 2026) ; environ 1,3 million de freelances | Environ 6 000 ETI et 300 grandes entreprises **[H]** |
| **Douleur n°1** | Ressaisies entre logiciel, sites secondaires, tableur et messagerie ; relances oubliées | Relance des pièces, saisie, pression de la facture électronique | « Je fais tout moi-même, je ne sais pas par où commencer » | Savoir où déployer des agents, avec un dossier chiffré |
| **Déclencheur** | Départ d'une assistante, baisse des ventes, changement de logiciel | Échéances de septembre 2026 (réception) et septembre 2027 (émission pour PME et TPE), difficulté à recruter | Surcharge, perte d'un client | Budget IA voté, pression de la direction |
| **Décideur** | Le gérant, seul | Les associés (décision collégiale, lente) | Lui-même | Direction des opérations ou DSI, plus achats et juridique |
| **Budget probable [H]** | 1 000 à 3 000 € ponctuels | 3 000 à 8 000 € | 0 à 30 €/mois | 20 000 € et plus |
| **Canal** | Éditeurs de logiciels de transaction et passerelles, réseaux de franchise, FNAIM et UNIS, salon RENT, LinkedIn local | Ordre des experts-comptables, congrès de l'Ordre, éditeurs comptables | LinkedIn, communautés de freelances, bouche-à-oreille | Consultants IA et ESN en marque blanche |
| **Frein** | Sanction CNIL dans le secteur ; négociateurs indépendants et peu à leur bureau | Secret professionnel ; outils de saisie automatique déjà en place | Faible panier | Cycle de 6 à 12 mois |

**Les 2 conditions pour valider l'immobilier**
1. Visez l'**assistante commerciale et l'administration des ventes**, pas le négociateur. Ce sont elles qui passent la journée devant l'écran. La gestion locative et le syndic sont encore plus administratifs que la transaction. **[H] à vérifier auprès de 3 agences.**
2. Entrez par le **mode vocal**, pas par l'écran. Dans le secteur de la sanction, l'écran se vend après la confiance.

**Lequel attaquer en premier, et pourquoi.** Deux fronts, pas un.
- **Indépendants, dès maintenant** : aucun rapport de subordination, donc presque pas de risque CNIL. Cycle de vente d'un jour. C'est votre laboratoire pour régler la détection sur de vrais écrans.
- **Agences immobilières, comme premier marché payant** : décideur unique, tâches visibles, bon récit pour la démo.

**Séquence d'élargissement**
1. Mois 0-6 : indépendants (gratuit puis 9 €/mois) + 3 agences pilotes en mode vocal puis écran.
2. Mois 6-12 : agences (transaction, puis gestion locative et syndic) via un éditeur ou un réseau partenaire.
3. Mois 12-18 : cabinets comptables, avec un profil métier durci et l'AIPD faite.
4. Mois 18-24 : autres PME de services administratives, puis ETI par des consultants partenaires.

Règle de passage : on n'ouvre un secteur que si le précédent a 10 clients payants et une base de connaissances chargée.

### 4.2 Personae

| Persona | Douleur | Objection principale | Déclencheur d'achat |
|---|---|---|---|
| **Sophie, 47 ans, gérante d'une agence de 10 personnes** (acheteuse) | « Mes équipes passent leur temps à recopier, je ne sais pas combien ça me coûte. » | « Mon logiciel fait déjà ça » et « je ne veux pas d'ennuis avec mes salariés » | Une assistante part. Elle voit la tâche faite en 95 secondes. |
| **Karim, 29 ans, négociateur** (observé) | Relances et comptes rendus le soir, après les visites | « C'est pour me fliquer ? » | Il voit en direct ce qui est capté, peut couper, et reçoit ses propres gains |
| **Nadia, 38 ans, assistante commerciale** (observée, vraie cible) | Ressaisies toute la journée | « Si on automatise mon travail, on me garde ? » | Le gérant dit par écrit à quoi sert le temps libéré (accueil, suivi des dossiers) |
| **Bertrand, 55 ans, associé d'un cabinet comptable de 20 personnes** (2e cible) | Relance des pièces, recrutement impossible | « Secret professionnel : rien ne sort du cabinet » | Échéance de la facture électronique ; traitement local prouvé |
| **Léa, 31 ans, consultante indépendante** (usage personnel) | Facturation, relances, administratif le dimanche | « Je n'ai pas le temps d'installer un outil » | Questionnaire gratuit en 5 minutes, premier gain le jour même |
| **Marc, 50 ans, dirigeant d'une PME de services de 60 personnes** (marché suivant) | « Tout le monde me parle d'IA, je ne sais pas par où commencer. » | « Encore un audit qui finit dans un tiroir » | Le plan est livré avec les workflows prêts et une tâche déjà exécutée |

---

## 17. Notre valeur ajoutée

**La phrase pour le jury**
> « Chaque brique existe déjà. Ce qui n'existait pas, c'est la chaîne complète : voir le travail sans surveiller les gens, choisir le bon outil pour chaque tâche, et prouver le gain en l'exécutant. »

| Brique | Ce que l'outil fait seul | Ce que nous ajoutons |
|---|---|---|
| **Agent H** | Exécute une tâche qu'on lui décrit | Nous lui disons **quelle** tâche, avec des consignes écrites à partir du travail réel, et nous mesurons avant/après |
| **Claude** | Analyse un texte qu'on lui donne | Il ne reçoit que 5 tâches candidates, déjà nettoyées, avec 3 couches de contexte. 90 % du travail est fait par du code, gratuit et répétable |
| **Hugging Face** | Fournit des modèles | Floutage des noms en local, avant tout envoi. C'est la garantie, pas la consigne donnée à l'IA |
| **n8n** | Exécute un workflow qu'on a construit | Le workflow sort pré-rempli de l'audit, sans consultant pour l'écrire |
| **Supabase** | Stocke | Schéma pensé pour supprimer : tout l'audit part en cascade à la fin |
| **Notre code** | - | Capture par logiciel et par site, règles par métier, détection des séquences, scoring, arbitrage « agent, n8n, outil existant ou rien » |

Les 3 choses que personne ne vous donne toute faite : le **profil métier** (ce qu'il faut flouter et comment nommer les tâches), l'**arbitrage** entre outils, la **preuve chronométrée**.

---

## 19. Transparence sur ce qui est simulé

| Élément | Vendredi | Ce qu'on dit |
|---|---|---|
| Capture des logiciels autorisés sur Mac | **Réel, en live** | « C'est notre application, sur cette machine. » |
| Floutage local | **Réel, en live** | On montre le texte avant et après. |
| Détection de la tâche répétée | **Réel**, sur les sessions enregistrées mercredi | « Calculé à partir de 2 sessions de 15 minutes jouées par Henriquet. » |
| Exécution par l'agent H | **Réel, en live** | Sur nos 3 sites de test. |
| Chrono avant/après | **Réel** : humain mesuré mercredi, agent mesuré en direct | On donne le nombre de mesures (ex. 5 essais). |
| L'agence, ses mandats, ses prospects | **Fictif** | « Agence inventée, aucune donnée réelle. » |
| Les 5 jours d'audit | **Simulé** : 30 minutes de sessions jouées | « Nous avons compressé 5 jours en 2 sessions. » |
| Les 3 portails | **Sites de test** | « Jamais sur de vrais portails : conditions d'utilisation. » |
| Gain annuel de l'agence | **Extrapolation** | Hypothèses affichées sur la slide. |
| Paiement, comptes, version Windows, extension Chrome | **Maquette** | « Maquette, non développé. » |
| Profils comptable et avocat | **Données chargées, non testées** | « Chargés en base, pas encore éprouvés. » |

**Comment traduire une session simulée en conclusion crédible**
1. Écrire chaque hypothèse sur la slide : « nous supposons 4 personnes concernées, 150 opérations par an ».
2. Séparer 3 niveaux : **mesuré** (durée humaine et durée de l'agent sur nos sites), **calculé** (gain par opération), **supposé** (fréquence, adoption).
3. Dire ce qu'on mesurerait en vrai : fréquence réelle sur 5 jours, taux d'adoption à 30 jours.
4. Dire chez qui : 3 agences pilotes volontaires, en commençant par le mode vocal.

**La phrase à dire au jury**
> « Ce que vous voyez tourner est réel : la capture, le floutage, la détection et l'agent. Ce qui est simulé, c'est l'agence et la durée : nous avons joué 30 minutes de travail au lieu de 5 jours. Nos chiffres de gain sont donc des extrapolations, et nos hypothèses sont écrites sur la slide. »

**Ce qui doit absolument tourner en vrai** : l'agent H qui remplit les 3 sites, et le chrono. Si un seul élément est réel, c'est celui-là.

---

## Sources
- [H Company, prix](https://hcompany.ai/pricing) · [Holo Models API, prix par modèle](https://hcompany.ai/holo-models-api) · [Modèles Holo et licences](https://hcompany.ai/research/models) · [Holo4-35B-A3B sur Hugging Face](https://huggingface.co/Hcompany/Holo4-35B-A3B)
- Prix Claude (sources secondaires, à confirmer sur la page officielle d'Anthropic) : [Maxim](https://www.getmaxim.ai/articles/claude-api-pricing/), [Fastero](https://fastero.com/blog/claude-api-pricing)
- [CNIL, sanction du 19/12/2024](https://www.cnil.fr/fr/surveillance-excessive-des-salaries-sanction-de-40-000-euros-entreprise-secteur-immobilier)
- [Baromètre France Num 2026](https://www.entreprises.gouv.fr/espace-presse/barometre-france-num-2026-quatre-tpe-pme-sur-dix-utilisent-desormais-lintelligence)
- Tarifs des consultants IA : [Studeria](https://www.studeria.fr/articles-de-blog/tjm-consultant-ia-2026-tarifs-grille), [Comparateur IA](https://comparateur-ia.com/ai-consultants/)
- Multidiffusion par passerelle : [Appvizer](https://www.appvizer.fr/magazine/construction/promoteurs/multidiffusion-annonces-immobilieres), [Immofacile](https://www.lafabriquedunet.fr/logiciel/immofacile)
- Marché immobilier : [Modèles de business plan](https://modelesdebusinessplan.com/blogs/infos/marche-agences-immobilieres-chiffres), [Propulse by CA](https://propulsebyca.fr/idees-business/agence-immobiliere/modele-etude-marche-agence-immobiliere), [OPCO EP, cartes professionnelles](https://regions.opcoep.fr/ressources/centre-ressources/branches/immobilier/panorama-immobilier-opcoep.pdf)
- Expertise comptable : [Les experts-comptables](https://les-experts-comptables.fr/ressources/nombre-experts-comptables-france), [Option Finance](https://www.optionfinance.fr/entreprise-finance/experts-comptables-un-marche-en-mutation.html)
- Indépendants : [L'Essentiel de l'éco, baromètre Urssaf](https://lessentieldeleco.fr/9079-le-salariat-recule-le-nombre-dauto-entrepreneurs-explose/), [Régie Portage](https://www.regie-portage.fr/blog/freelance/nombre-de-freelances-en-france/)
- Facture électronique : [Service-public](https://entreprendre.service-public.gouv.fr/actualites/A15683)
- Concurrents : [KYP.ai, comparatif](https://kyp.ai/which-next-gen-process-intelligence-solution-is-right-for-you/), [Skan, prix](https://erpresearch.com/erp-add-ons/process-mining/skan-ai/pricing), [Power Automate, prix](https://powerautomate.microsoft.com/pricing), [Fluency](https://usefluency.com/blog/top-10-scribe-alternatives), [Bardeen, process mining](https://www.bardeen.ai/best/process-mining-tools)
- Marque : [Ghost Foundation, politique de marque](https://ghost.org/trademark), [enregistrement USPTO](https://markinton.com/trademark/ghost-97049806)
