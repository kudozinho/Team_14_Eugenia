# Ghost : roadmap, partie 5 : conformité et roadmap produit (points 12, 13)

Je ne suis pas juriste. Ce qui suit est une lecture argumentée, à faire valider par un avocat ou un DPO avant le premier client. Les points incertains sont marqués **[H]**.

## 12. Conformité

### Le fait à connaître par cœur
Le 19 décembre 2024, la CNIL a infligé 40 000 € à une société **du secteur immobilier**. Son logiciel comptait des périodes d'« inactivité » et faisait des captures d'écran toutes les 3 à 15 minutes. La CNIL juge aussi disproportionnés l'enregistreur de frappes et le partage permanent de l'écran d'un salarié en télétravail.
Conséquence : Ghost doit être l'inverse de ce logiciel, point par point, et vous devez le montrer.

### Qui est responsable de quoi
| Offre | Responsable du traitement | Rôle de Ghost |
|---|---|---|
| Entreprise | L'employeur (l'agence) | Sous-traitant : contrat de sous-traitance, instructions écrites, suppression en fin d'audit |
| Personnel | Ghost | Responsable du traitement, vis-à-vis de l'indépendant |

### Les 4 questions du RGPD
| Question | Réponse pour Ghost |
|---|---|
| **Quelles données ?** | Texte lu à l'écran après floutage, nom de l'application, titre de fenêtre, adresse du site, horodatage. Voix puis transcription (mode vocal). Réponses au formulaire. Poste de la personne, pas son identité au-delà du compte. **Données de tiers** (prospects, propriétaires, locataires) qui passent à l'écran : floutées en local, jamais stockées. Jamais : frappes au clavier, webcam, fenêtres non autorisées, temps d'inactivité. |
| **Quelle base légale ?** | Entreprise : **intérêt légitime de l'employeur** (améliorer ses process), avec mise en balance écrite. Le volontariat est une garantie, pas la base : le consentement d'un salarié à son employeur est rarement considéré comme libre. **[H]** Personnel : exécution du contrat. |
| **Quelle finalité ?** | Une seule : repérer des tâches répétitives pour les automatiser. Écrit noir sur blanc dans le contrat : **aucune évaluation individuelle, aucun contrôle du temps de travail, aucune sanction possible à partir de Ghost.** |
| **Quelle durée ?** | Images : jamais envoyées ; miniature floutée gardée en local 7 jours. Événements bruts : supprimés à la remise du rapport, au plus tard 30 jours après la fin de l'audit (15 jours en comptabilité, 7 chez les avocats). Audio : supprimé dès que la reformulation est validée. Rapport (tâches, sans données personnelles) : conservé pendant la relation commerciale. |

### Les obligations autour
| Obligation | Ce que Ghost fournit |
|---|---|
| **AIPD** | Nécessaire : surveillance possible de salariés, technologie nouvelle. Ghost fournit un modèle pré-rempli à l'employeur. C'est un argument de vente. |
| **Information individuelle** | Aucune collecte sans information préalable du salarié. Ghost fournit la notice, signée avant l'installation. |
| **CSE** | S'il existe : information, et consultation selon la taille (articles L2312-8 et L2312-38 que vous citez). Une agence de moins de 11 salariés n'a pas de CSE. Ghost fournit la note de présentation. **[H] seuils à confirmer.** |
| **Registre des traitements** | Fiche prête à copier. |
| **Sous-traitants ultérieurs** | H Company (France, point d'accès européen visible dans la documentation), Supabase (choisir une région UE), Vercel, Anthropic (États-Unis : seul du texte nettoyé part ; clauses de transfert à prévoir). **[H]** |
| **Droits des personnes** | Journal « ce qui a été capté », suppression ligne par ligne, retrait de l'audit en un clic. |

### Données de l'agence immobilière
- L'agence est responsable des données de ses prospects et propriétaires (coordonnées, budget, situation familiale, pièces d'identité). Ghost ne doit pas en créer une copie.
- Parade technique : floutage local avant envoi + liste de champs jamais stockés + pas d'image envoyée.
- **Limite à dire** : un floutage n'est jamais parfait. Un nom rare peut passer. Mesurez le taux d'oubli sur le jeu de 20 phrases pièges d'Omar et affichez-le. Un chiffre honnête (« 18 sur 20 ») vaut mieux qu'un « 100 % » que personne ne croira.
- Les agences ont aussi des obligations de vigilance contre le blanchiment : certains dossiers contiennent des justificatifs sensibles. Les logiciels où ils se trouvent ne doivent pas être cochés. À mettre dans le profil métier.

### Secret professionnel (cabinets comptables, 2e cible)
- L'expert-comptable ne peut pas laisser sortir des informations sur ses clients. Un texte flouté envoyé à un tiers reste discutable.
- Conditions pour y aller : traitement entièrement local ou dans une infrastructure dédiée, aucun contenu de pièce, AIPD faite, avis de l'Ordre ou d'un avocat. **[H] à vérifier auprès de l'Ordre des experts-comptables.**
- En attendant : mode vocal uniquement pour ce secteur. Personne ne lit d'écran, le collaborateur décrit son process sans nommer de client.

### Niveau AI Act
| Question | Lecture |
|---|---|
| Ghost est-il « à haut risque » ? | L'annexe III (point 4) vise les systèmes qui surveillent ou évaluent les performances et le comportement des travailleurs. **Ghost y échappe seulement s'il ne produit aucune information par personne pour l'employeur.** Notre lecture : risque limité, sous cette condition. **[H]** |
| Et si un client détourne l'outil ? | Il basculerait dans le haut risque. Parades : la donnée par personne n'existe pas côté employeur (technique), et le contrat interdit l'usage à des fins d'évaluation (juridique). |
| Calendrier | Les règles du haut risque de l'annexe III ont été reportées au 2 décembre 2027. Le RGPD, lui, s'applique déjà. |
| Transparence | Le mode vocal dit clairement que la reformulation vient d'une IA. Le rapport indique ce qui est généré. |
| Agent H | Il agit sur des logiciels : la mise en production reste sous validation humaine (aucun envoi d'e-mail ni publication réelle sans accord). |

### 5 risques notés
Probabilité et impact de 1 à 5. Score = P × I.

| Risque | P | I | Score | Parade | Responsable |
|---|---|---|---|---|---|
| Ghost perçu ou utilisé comme outil de surveillance (plainte, CNIL) | 3 | 5 | **15** | Pas de donnée par personne pour l'employeur, volontariat, icône, journal, contrat ; AIPD fournie | Assel |
| Une donnée de tiers passe le floutage et sort du poste | 3 | 4 | **12** | Double filtre (motifs + noms), pas d'image envoyée, taux d'oubli mesuré, suppression rapide | Omar |
| L'agent H échoue pendant la démo | 3 | 4 | **12** | Sites de test maîtrisés, limites de temps, 3 passages de suite jeudi, vidéo de secours | Alejandro |
| Détection fausse ou instable (tâche inventée, résultat qui change) | 3 | 3 | **9** | Étage code avant l'IA, sortie structurée, 5 relances sur 10 cas, score de confiance affiché | Omar |
| Fuite de clés ou de la base (clé de service exposée) | 2 | 4 | **8** | Clés dans `.env` hors dépôt, clé de service côté serveur seulement, données fictives cette semaine | Alejandro, Henriquet |
| Marque « Ghost » indisponible | 3 | 2 | 6 | Recherche INPI et EUIPO avant dépôt, nom composé | Assel |

### La slide « Conforme à la CNIL dès la conception »
Titre : **« Le contre-modèle de la sanction CNIL de 2024 »**

| Ce que la CNIL a sanctionné | Ce que fait Ghost |
|---|---|
| Captures à intervalle fixe | Capture sur changement d'écran, texte seulement, flouté sur le poste |
| Mesure de l'« inactivité » | Aucune mesure de temps par personne |
| Tout l'écran | Seulement les logiciels et les sites cochés par le salarié |
| Imposé | Volontaire, pause en un clic, retrait possible |
| Opaque | Icône visible, journal de ce qui est capté |
| Résultats individuels pour l'employeur | Le gérant voit des tâches, jamais des personnes |
| Conservation longue | Suppression à la remise du rapport |

Ligne du bas : « 3 modes, du plus léger au plus complet. Le mode vocal ne regarde aucun écran. » Et une ligne d'honnêteté : « Reste à faire : AIPD validée par un DPO, floutage mesuré à 18/20. »

### 5 questions difficiles du jury, et vos réponses
**1. « C'est un logiciel espion avec une jolie icône. La CNIL vient de sanctionner exactement ça, non ? »**
« Oui, et dans l'immobilier, notre premier marché. C'est pour ça que Ghost fait l'inverse sur 7 points : pas d'intervalle fixe, pas d'inactivité, pas de donnée par personne. Et pour ceux qui ne veulent aucun écran, il y a le mode vocal. Ce qu'il nous reste à faire : une AIPD validée par un DPO avant le premier client. »

**2. « Dans une agence de 5 personnes, tout le monde sait qui est l'assistante. Votre anonymat ne tient pas. »**
« Vous avez raison, l'agrégation ne protège pas dans une petite équipe. Notre protection est ailleurs : le rapport décrit des tâches et des outils, pas des rythmes ni des erreurs. Et c'est le salarié qui choisit ce qu'il montre. En dessous de 3 participants sur une tâche, nous n'affichons aucune répartition par personne. »

**3. « Votre agent réussit combien de fois sur 10 ? Et sur un vrai portail ? »**
« Sur nos sites de test : X sur 10 au niveau simple, Y sur 10 avec envoi de photo. Durée médiane : Z secondes. Sur un vrai portail, nous n'avons pas testé : leurs conditions d'utilisation l'interdisent sans accord. C'est notre prochaine étape, avec un éditeur partenaire. » (Chiffres de jeudi.)

**4. « Les logiciels immobiliers diffusent déjà les annonces. Quel est votre problème réel ? »**
« Exact pour les grands portails. Ghost le dit lui-même dans le rapport : activez votre passerelle. Notre terrain, c'est ce qui se passe entre les logiciels : les sites sans passerelle, les tableurs, les relances. Et nous ne le savons qu'en regardant, c'est tout l'intérêt de l'audit. »

**5. « Tout existe déjà : H, Claude, n8n. Que reste-t-il de vous si H sort la même chose ? »**
« H fournit un agent qui exécute. Il ne sait pas quelle tâche mérite d'être exécutée dans une agence de Massy. Notre valeur : le profil métier, le choix de l'outil et la preuve chronométrée. 90 % de notre chaîne est du code à nous. Et un audit qui recommande parfois de ne rien acheter, un vendeur d'agents ne le fera pas. »

Question bonus : **« Vos 990 heures, d'où sortent-elles ? »** « C'est le plafond théorique d'une formule déclarative. Tâche par tâche, nous en justifions 205. L'audit sert à mesurer le reste. »

---

## 13. Roadmap produit en 4 étapes, sur 24 mois

Règle : le critère du jalon est écrit **avant** l'étape. Trois issues : go, go sous conditions, stop.

| Étape | Dates | Ce qu'on fait | Livrables | Jalon : critère écrit avant |
|---|---|---|---|---|
| **1. Cadrer** | Décembre 2026 à février 2027 | 15 entretiens (10 agences, 5 indépendants). Chronométrage de 3 tâches chez 2 agences. Avis d'un DPO. Recherche de marque. Budget. | Périmètre écrit, AIPD lancée, point de départ mesuré, grille de prix testée | **Go si** : 5 gérants sur 10 citent une tâche répétitive hors de leur logiciel **et** 3 acceptent un pilote **et** le DPO ne voit pas d'obstacle bloquant. **Go sous conditions** : pilote en mode vocal seulement. **Stop** : moins de 3 gérants intéressés. |
| **2. Prouver** | Mars à juin 2027 | Prototype sur 30 cas réels anonymisés (sessions d'indépendants volontaires). Agent testé sur 3 logiciels réels avec accord. Application Mac signée. | Prototype noté : justesse de la détection, taux d'oubli du floutage, taux de réussite de l'agent | **Go si** : détection juste sur 80 % des 30 cas, floutage à 95 %, agent à 8 sur 10 sur 2 logiciels. **Sous conditions** : agent à 6 sur 10 → on vend l'audit sans la preuve live. **Stop** : détection sous 60 %. |
| **3. Piloter** | Juillet à décembre 2027 | 3 agences pilotes (vocal, puis écran), 50 indépendants. Mesure de l'usage et du gain. Premier partenaire pour la mise en place. | Usage et gain mesurés sur un groupe réduit, 2 témoignages, coût humain réel par client | **Go si** : 60 % des volontaires actifs à 30 jours, 1 automatisation en service par pilote, gain mesuré d'au moins 50 % de l'estimé, 2 pilotes sur 3 paient. **Stop** : aucun pilote ne paie. |
| **4. Passer à l'échelle** | Janvier à novembre 2028 | Vagues : 10 agences, puis 30, puis ouverture des cabinets comptables (profil durci). Version Windows. Partenaires. | Suivi mensuel : clients, marge, temps humain par client, incidents | **Point mensuel.** On continue si le temps humain par client descend sous 10 h et la marge brute reste au-dessus de 60 %. On gèle une vague au premier incident de données. |

### Plan d'adoption (chez le client)
| Sujet | Ce qu'on fait |
|---|---|
| **Utilisateurs** | D'abord les volontaires, jamais toute l'équipe d'office. On commence par le poste le plus administratif. |
| **Ambassadeurs** | 1 personne par agence, souvent l'assistante la plus à l'aise. Elle teste la première, montre son journal aux autres, reçoit ses gains en premier. |
| **Réfractaires** | Trois réponses : le mode vocal (aucun écran), le droit de ne pas participer sans avoir à se justifier, la preuve par le journal (« voilà exactement ce que Ghost a vu »). On ne force jamais. |
| **À quoi sert le temps libéré** | Écrit par le gérant avant l'audit, dans le formulaire : accueil des clients, suivi des dossiers, visites, formation. **Pas à supprimer des postes** : c'est une clause de la charte signée avec le client. |
| **2 indicateurs d'usage** | 1) Part des volontaires encore actifs à 30 jours. 2) Nombre d'automatisations réellement en service 60 jours après le rapport. |
| **Indicateur de gain** | Durée de la tâche chronométrée avant et après, sur 10 occurrences. Pas de déclaratif. |

## Sources
- [CNIL, sanction du 19/12/2024](https://www.cnil.fr/fr/surveillance-excessive-des-salaries-sanction-de-40-000-euros-entreprise-secteur-immobilier) · [CNIL, contrôle de l'activité des personnes employées](https://cnil.fr/fr/node/168328)
- AI Act : [calendrier pour les CSE](https://www.cse-guide.fr/?p=35073), [Éditions Tissot, report au 2 décembre 2027](https://www.editions-tissot.fr/espace-presse/ia-act-quelles-sont-les-obligations-des-entreprises-face-aux-prochaines-echeances), [annexe III](https://www.regulation-ai.eu/fr/annex-iii/)
- Obligations des agences : [DGCCRF](https://www.economie.gouv.fr/node/3232350), [formation à la lutte contre le blanchiment](https://kohenavocats.fr/2026/06/12/agent-immobilier-tracfin-2026-controle-dgccrf-mandat-honoraires-annonces/)
- [Agents API, point d'accès européen](https://hub.hcompany.ai/agents-api/browser/configuration#browser-profiles)
