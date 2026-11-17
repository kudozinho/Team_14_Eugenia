# Ghost : roadmap, partie 3 : MVP, démo, planning, organigramme (points 8, 9, 10, 15)

## 8. Architecture du MVP hackathon

### Ce qu'on coupe (décision à prendre ce soir)
| Coupé cette semaine | Pourquoi | Ce qu'on en dit au jury |
|---|---|---|
| Extension Chrome | L'adresse de l'onglet actif se lit depuis l'application Mac (AppleScript). L'extension n'apporte rien à la démo. | « Prévue pour le contexte fin des champs web. » |
| Windows | Une seule plateforme qui marche vaut mieux que deux qui plantent. | « Même principe avec l'API de capture par fenêtre de Windows. » |
| Tauri ou Electron | Vous avez déjà choisi Python. On n'y revient pas. | - |
| Paiement, comptes, invitations | Hors du chemin critique. | Maquette. |
| Profils comptable et avocat | Ils restent en base, non testés. | « Ajouter un métier, c'est une ligne. » On le montre en 10 secondes. |
| Sous-agents, Holo en local | Bonus de jeudi, seulement si le test de bout en bout n°2 passe. | Résultats dans le rapport de retours. |

### Schéma des briques
```
 Formulaire avant audit ──► n8n ──► Supabase (contexte entreprise, postes)
                                          │
                                          ▼
                                 Prompt système 3 couches
                                 (métier + entreprise + poste)
                                          │
[Mac du salarié]                          │
 Ghost Recorder (Python)                  │
  1. applis et sites autorisés            │
  2. capture sur événement ──► OCR local ──► filtres du profil ──► événement nettoyé
  3. icône, pause, journal local                                        │
 Mode vocal : audio ──► transcription ──► filtres ──► reformulation     │
                                                                        ▼
                                                              Supabase (evenements)
                                                                        │
                                              Détection : étage code (séquences, durées)
                                                         puis étage LLM (5 candidates)
                                                                        │
                                                    Scoring + fiche opportunité
                                                          │                 │
                                             consignes agent H        modèle n8n pré-rempli
                                                          │
                                        Agent API H (navigateur hébergé) ──► 3 sites de test (Vercel)
                                                          │
                                              durée mesurée par notre code
                                                          ▼
                                    Interface Next.js (Vercel) : tableau de bord, rapport, bouton « Prouver »
```

### Stack finale : réel ou simulé

| Brique | Techno recommandée | Vendredi |
|---|---|---|
| Application de capture | **Python sur macOS** : `rumps` (icône de barre des menus), `pyobjc` (application au premier plan, changement d'application), commande système `screencapture -l <id de fenêtre>` | **Réel** |
| Adresse de l'onglet | AppleScript sur Chrome | **Réel** |
| Lecture du texte | Apple Vision en local (via `pyobjc` ou `ocrmac`) : gratuit, bon en français | **Réel** |
| Doublons | Empreinte perceptuelle (`imagehash`) | **Réel** |
| Filtres | Expressions régulières du profil + reconnaissance de noms (`camembert-ner`) | **Réel** |
| Transcription | Whisper `large-v3-turbo` en local (l'audio ne sort pas du poste). Repli : API Voxtral si l'installation prend plus de 30 minutes | **Réel**, sur un enregistrement |
| LLM | Haiku 5.5 pour décrire, Sonnet 5.5 pour analyser et rédiger. Opus inutile ici. Lots de moins de 100 000 tokens. | **Réel** |
| Détection | Python : séquences répétées au moins 3 fois + regroupement par similarité | **Réel**, sur sessions jouées |
| Agent | Agent API H, `hai-agents`, navigateur hébergé (`kind: "web"`), réponse structurée | **Réel, en live** |
| Workflows | n8n : 3 modèles, 1 déclenché en vrai (alerte J2) | **1 réel, 2 montrés** |
| Base | Supabase (schéma du kit + ajouts de `04`) | **Réel** |
| Interface et sites de test | Next.js sur Vercel | **Réel** |
| Formulaire avant audit | Google Forms → n8n → Supabase | **Réel** sur 1 réponse préparée |
| Extension Chrome, Windows, paiement | - | **Maquette** |

### Capture par logiciel : comment ça marche

**macOS**
- **Application au premier plan** : `NSWorkspace` donne l'application active et prévient à chaque changement.
- **Fenêtre** : la liste des fenêtres donne le titre et l'identifiant de chacune. Il faut la permission « Enregistrement de l'écran » (sans elle, pas de titres) et « Accessibilité ».
- **Capture d'une seule fenêtre** : `screencapture -l <id>` pour cette semaine. La voie propre ensuite : ScreenCaptureKit, dont le filtre de contenu accepte une liste d'applications ou une fenêtre précise.
- **[H] à vérifier mardi matin par Alejandro** : le comportement exact dépend de la version de macOS des machines de démo (rappels de permission réguliers sur les versions récentes). Testez sur la machine de vendredi.

**Windows (plus tard)**
- Fenêtre active : `GetForegroundWindow`, et un abonnement aux changements de premier plan.
- Capture d'une fenêtre : Windows Graphics Capture, qui capture une fenêtre précise et affiche une bordure visible autour d'elle. Cette bordure sert votre transparence.

**Fenêtre non autorisée au premier plan**
- Règle : **pause automatique**. On ne capture rien, on n'enregistre même pas le titre de la fenêtre. L'icône passe en « barré ».
- On enregistre seulement un événement vide « hors périmètre » avec sa durée, pour que les temps restent justes.
- Si une fenêtre non autorisée recouvre une fenêtre autorisée : la capture par fenêtre ne voit que la fenêtre autorisée. Avec le plan B (écran entier), on met en pause.

**Navigateur : liste blanche par site**
- Chrome coché sans site choisi = rien n'est capté.
- À chaque changement d'onglet, on lit l'adresse. Domaine dans la liste : capture. Sinon : pause.
- Navigation privée : jamais captée.

**Fréquence**
- Déclencheurs : changement d'application, changement de titre de fenêtre, changement d'adresse, puis au plus une vérification toutes les 5 secondes qui ne garde l'image que si l'empreinte a changé.
- Jamais d'intervalle fixe d'envoi. Jamais de mesure d'inactivité.
- Plafond : 1 capture gardée toutes les 3 secondes, 600 par jour.
- L'image n'est jamais envoyée dans le scénario retenu : seul le texte nettoyé part. Une miniature floutée reste en local pour le journal du salarié.

**Faisable en 4 jours** : macOS, 2 applications autorisées (Chrome avec 4 sites, plus une application de bureau comme Numbers ou Excel pour montrer que ça marche hors navigateur), pause, icône, journal local.
**Plus tard** : ScreenCaptureKit natif, Windows, extension, application signée et notarisée, mise à jour automatique.

### Points à vérifier dans le kit (pour Alejandro)
- La documentation de l'Agent API décrit deux types d'environnement : `web` (navigateur hébergé par H, par défaut, ou votre Chrome en local) et `desktop` (votre machine). **Je n'ai pas trouvé de bureau hébergé** : le test « logiciel de bureau » tourne donc sur un Mac de l'équipe, avec l'exécution locale.
- Le SDK Python récent parle de `answer_schema` (un modèle pydantic) pour la réponse structurée. Le kit écrit `answer_format`. Vérifiez le nom exact dans la version installée.
- Agents prêts à l'emploi : `h/web-surfer-flash` (rapide) et `h/web-surfer-pro`. Commencez par eux avant de créer `ghost-multidiffusion`.
- Le navigateur hébergé doit pouvoir atteindre vos sites : déploiement Vercel **public**, sans protection par mot de passe.

---

## 9. Script de démo minuté (4 minutes dans le pitch)

**Agence fictive** : « Agence Belvédère » à Massy, 10 personnes. Si Henriquet a déjà choisi un nom, gardez le sien.

| Temps | À l'écran | Ce que dit Assel | Qui manipule |
|---|---|---|---|
| 0:00-0:25 | Slide « 12 minutes » | « Nadia, assistante à l'agence Belvédère, recopie chaque annonce sur 3 sites que son logiciel ne connecte pas. 12 minutes par annonce. Personne ne le sait, même pas elle. » | - |
| 0:25-0:55 | Application Ghost : cases cochées (Chrome : 4 sites ; tableur), icône colorée. On ouvre une messagerie : l'icône se barre. | « Elle choisit ce que Ghost voit. Sa messagerie, sa banque : jamais. Regardez l'icône. » | Alejandro |
| 0:55-1:20 | Journal « ce qui a été capté » : texte avant et après floutage | « Les noms et téléphones des clients sont remplacés sur son ordinateur, avant tout envoi. » | Alejandro |
| 1:20-1:50 | Tableau de bord : tâche détectée, 3 répétitions, 12 min, score 73/100 | « Ghost a repéré la répétition. Il la chiffre et la classe. Et il dit quel outil utiliser : ici pas d'API, donc un agent. » | Binta |
| 1:50-3:05 | Clic sur « Prouver avec l'agent ». Vue en direct de l'agent H sur les 3 sites. Chrono à l'écran. | « L'agent H Company fait la tâche maintenant, sur les vrais formulaires. » Pendant l'attente : expliquer les consignes générées, puis montrer la page « Annonces publiées ». | Alejandro |
| 3:05-3:30 | Chrono : 12 min contre environ 1 min 35. Les 3 annonces visibles. | « 87 % de temps en moins sur cette tâche. Mesuré, pas promis. » | Binta |
| 3:30-4:00 | Rapport : fiche opportunité, alerte J2 reçue, workflow n8n pré-rempli | « Le client repart avec la fiche, le workflow prêt, et un prix. Ce que vous avez vu tourner est réel ; l'agence est fictive. » | Binta |

Le chiffre de 95 secondes vient du fichier d'exemple du kit. Remplacez-le par votre mesure de jeudi (médiane de 5 essais).

### Plan B, par ordre de gravité
| Panne | Réaction | Préparation |
|---|---|---|
| L'agent est lent (plus de 2 min 30) | Assel passe au rapport, on revient sur l'agent à la fin | Limite de temps réglée ; phrase prête : « il termine pendant que je vous montre la suite » |
| L'agent échoue sur un site | On montre les 2 réussis et on le dit : « 2 sur 3 en live ; notre taux mesuré est de X sur 10 » | Taux mesuré jeudi, affiché sur la slide |
| Pas de réseau, API H indisponible | **Vidéo de secours** (enregistrée jeudi 15h, 90 secondes, sans coupe, avec l'horloge visible) | Fichier en local sur 2 machines + clé USB |
| Le Recorder plante | On ouvre le tableau de bord déjà rempli (environnement figé) | Base de démo figée jeudi soir, copie de sauvegarde |
| Machine de démo en panne | Deuxième Mac prêt, même environnement | Testé vendredi 9h |

**Environnement figé** : jeudi 18h, on gèle la base de démo (`aud_demo`), on note la version du code, on ne touche plus aux sites de test. Vendredi matin : corrections d'affichage seulement.

### Données fictives à préparer (Henriquet, mardi)
| Donnée | Quantité | Détail |
|---|---|---|
| Agence | 1 | Nom, adresse à Massy, 10 collaborateurs désignés par leur poste (1 gérante, 6 négociateurs, 2 assistantes, 1 gestionnaire locatif) |
| Mandats | 10 | Titre, prix, surface, pièces, ville de l'Essonne, description de 3 lignes, classe énergie, honoraires. 3 servent à la démo. |
| Photos | 3 par bien de démo | Images libres de droits ou générées, aucune photo de vrai bien en vente |
| Prospects | 20 | Noms inventés, numéros au format 06 00 00 00 xx, adresses e-mail en `@example.com` |
| Sites de test | 3 | Champs nommés différemment, un avec menu déroulant, un avec case à cocher, un avec envoi de photo |
| « ImmoGest » | 1 page | Fiche mandat simple (page web ou tableur) |
| Réponse au formulaire | 1 | Remplie pour l'agence fictive |
| Enregistrement vocal | 1 | 3 minutes, un membre de l'équipe décrit la relance après visite |
| Tableau de suivi | 1 | Tableur des annonces publiées |

---

## 10. Roadmap hackathon jour par jour

Chaque soir à 18h30, le même test : **« la démo tourne-t-elle de bout en bout ? »** Réponse écrite par Assel dans le journal : oui / non / jusqu'où.

| Jour | Objectif | Jalons | Test du soir |
|---|---|---|---|
| **Lundi 16** (ce soir) | Décider et lancer | Lecture de la roadmap. Décision sur les coupes. Reformulation du cas de démo (« sites sans passerelle »). Clés partagées. Question aux mentors H sur les crédits. Chacun lit sa fiche. | Non attendu |
| **Mardi 17** | Chaque brique marche seule, sur données factices | Matin : base Supabase, dépôt GitHub. Midi : premier appel à un agent H prêt à l'emploi. Soir : 3 sites en ligne, Recorder qui détecte l'application, filtres qui nettoient, maquette validée, formulaire rédigé. | « Chaque brique passe son critère de terminé, seule. » Un agent H a rempli 1 site à la main. |
| **Mercredi 18** | Premier bout en bout | 11h Recorder → base. 14h base → détection. 16h détection → agent. **17h : CP2** (parcours, architecture, Loom de 2 min, roadmap). 17h30 : test de bout en bout n°1. | « Une session jouée produit une tâche détectée qui lance l'agent. » Même laid, même lent. |
| **Jeudi 19** | Fiabiliser, mesurer, raconter | 10h détection → n8n. 11h interface sur vraies données. Matin : plan de tests de l'agent (niveaux 1 à 4). **14h : test n°2.** 15h : vidéo de secours. 16h : répétition n°1. 18h : gel de la base de démo. Soir : deck v1, rapport de retours v1. | « La démo passe 3 fois de suite sans intervention. » Sinon, on coupe une fonction, pas le sommeil. |
| **Vendredi 20** | Livrer | 9h : test sur la machine de présentation. 10h : répétition n°2 chronométrée. **11h : code figé.** 13h : deck relu, chiffres vérifiés un par un. **15h : CP4, deck envoyé.** Pitch. | Fait à 9h, pas le soir. |

**Livrables par checkpoint**
| Checkpoint | Contenu | Responsable | Contributeurs |
|---|---|---|---|
| CP1, lundi 17h | Fait | Assel | - |
| **CP2, mercredi 17h** | Parcours utilisateur (maquette) | Binta | - |
| | Architecture technique (schéma de ce document, mis au propre) | Alejandro | Omar |
| | Loom de 2 min : problème (30 s), solution (40 s), avancement réel montré à l'écran (50 s) | Assel + Binta | Tous |
| | Roadmap jusqu'à jeudi (tableau ci-dessus) | Assel | - |
| **CP4, vendredi 15h** | Deck de 8 à 12 slides dans l'ordre imposé | Binta | Assel (chiffres), Alejandro (architecture), Omar (limites) |
| Livrable en plus | Retours sur l'Agent API (`06`) | Assel | Alejandro, Vladimir |

**Deck, slide par slide**
| N° | Slide | Contenu clé | Source |
|---|---|---|---|
| 1 | Titre | Ghost, slogan, sous-titre français | - |
| 2 | Problème | 12 minutes par annonce, invisibles ; 40 % des TPE-PME utilisent l'IA mais peu l'ont intégrée à leurs process | `01` |
| 3 | Solution | La boucle en 5 verbes ; la règle « API → n8n, pas d'API → agent, déjà couvert → rien » | `01` |
| 4 | Démo | Live | ce document |
| 5 | Business model | Tableau des offres | `02` g |
| 6 | Go-to-market | Indépendants + agences ; séquence d'élargissement | `01` |
| 7 | Architecture | Schéma ; « 90 % de code, l'IA à 2 endroits » | ce document |
| 8 | Conformité | « Le contre-modèle de la sanction CNIL » | `05` |
| 9 | Limites, améliorations, roadmap | Ce qui est simulé, taux de réussite mesuré, 4 étapes | `01`, `05`, `06` |
| 10 | Coût de run | Tableau | `02` g |
| 11 | Retours sur l'Agent API | 3 qui marchent, 3 qui cassent, 3 suggestions | `06` |
| 12 | Équipe | 6 rôles | - |

**Relier la démo aux critères du jury**
| Critère | Poids | Ce qui rapporte des points | Moment |
|---|---|---|---|
| Excellence technique et Agents API | 30 % | Agent en live, consignes générées, réponse structurée, taux de réussite mesuré par niveau, sous-agents si prêts, rapport de retours chiffré | Démo 1:50-3:05, slides 7 et 11 |
| Pertinence et impact | 25 % | Problème chiffré, gain mesuré, formule du gain avec hypothèses écrites | Slides 2, 3, 5 |
| Faisabilité, adoption, apprentissages | 25 % | Conformité pensée dès le départ, plan d'adoption, transparence sur le simulé, limites assumées, coût de run | Slides 8, 9, 10 |
| UX, démo et pitch | 20 % | Icône, pause, journal ; démo sans accroc ; plan B invisible | Démo 0:25-1:20 |

---

## 15. Organigramme de l'application et parcours client

Légende : **[D]** indispensable pour la démo · **[M]** maquette vendredi · **[P]** plus tard.

```
Ghost
├── Site public
│   ├── Accueil : promesse, vidéo de 60 s, bouton « Tester gratuitement » [M]
│   ├── Choix de l'offre : Entreprise / Personnel [M]
│   ├── Questionnaire gratuit (sans compte) [M]
│   └── Confiance : ce que Ghost voit et ne voit jamais [M]
├── Connexion : e-mail ou Google [P]
│
├── VUE ENTREPRISE (gérant, admin)
│   ├── Tableau de bord : heures récupérables, top des tâches, avancement de l'audit [D]
│   │   └── aucune donnée par personne ; rien si moins de 3 participants sur une tâche
│   ├── Équipe et consentements : invitations, statut (invité, volontaire, en pause), jamais le détail de l'activité [M]
│   ├── Profil métier et règles : secteur, données floutées, durée de conservation [D] (lecture seule)
│   ├── Contexte de l'entreprise : réponses au formulaire, postes [D] (lecture seule)
│   ├── Rapports
│   │   ├── Synthèse : matrice gain / effort [D]
│   │   ├── Fiches opportunité [D] (1 fiche)
│   │   └── Export PDF [P]
│   ├── Preuves de l'agent : exécutions, durée avant/après, bouton « Prouver avec l'agent » [D]
│   ├── Plan d'automatisation : workflows pré-remplis, ordre de mise en place, devis partenaire [M]
│   ├── Facturation : offre, factures [P]
│   └── Données : durée de conservation, « tout supprimer maintenant », attestation de suppression [M]
│
├── VUE COLLABORATEUR (application Mac + page web)
│   ├── Accueil : ce que Ghost fait, ce qu'il ne fait pas, accord explicite [D]
│   ├── Choix du mode : écran / vocal / questionnaire [D]
│   ├── Applis et sites autorisés [D]
│   ├── Pause (15 min, 1 h, jusqu'à demain) [D]
│   ├── « Ce qui a été capté » : journal, suppression ligne par ligne [D]
│   ├── Mode vocal : enregistrer → « voici ce que j'ai compris » → valider ou corriger → solutions [D] (version courte)
│   ├── Alertes : « tu fais X à la main, on peut l'automatiser » [D] (1 alerte)
│   ├── Mes gains : visibles par lui seul [M]
│   └── Me retirer de l'audit et effacer mes données [M]
│
└── VUE PERSONNEL (indépendant)
    ├── Accueil simplifié : un seul écran « Lancer mon audit » [M]
    ├── Applis et sites autorisés, pause, journal (les mêmes que le collaborateur) [D] (réutilisé)
    ├── Mes tâches et mes gains [M]
    ├── Prouver avec l'agent (5 par mois) [P]
    └── Abonnement [P]
```

### Parcours client de bout en bout
| Étape | Ce qui se passe | Vendredi |
|---|---|---|
| 1. Accueil | Promesse, démonstration de 60 secondes | Maquette |
| 2. Choix de l'offre | Entreprise ou Personnel | Maquette |
| 3. Inscription | E-mail ou Google | Maquette |
| 4. Paiement | Stripe : audit au forfait, abonnement, questionnaire gratuit | Maquette |
| 5. **Formulaire avant audit** | 22 questions, 10 minutes. Les réponses remplissent les couches « entreprise » et « poste » du prompt. | **Réel** (1 réponse) |
| 6. Onboarding | Choix du profil métier, invitation des collaborateurs, séance d'information | Profil **réel**, reste en maquette |
| 7. Installation | Chaque volontaire installe, choisit son mode, ses applis et ses sites | **Réel** |
| 8. Audit en cours | Icône, pause, journal ; alerte à J2 | **Réel**, compressé en 30 minutes |
| 9. Rapport et preuve | Matrice, fiches, exécution par l'agent | **Réel** |
| 10. Plan d'action et devis | Workflows pré-remplis, devis de mise en place d'un partenaire | 1 workflow **réel**, devis en maquette |
| 11. Mode continu | Abonnement, nouvelles alertes | Maquette |
| 12. Fin et suppression | Données brutes supprimées, attestation | Maquette (la suppression en cascade existe déjà dans le schéma) |

**Qui s'en charge** : Binta dessine l'organigramme et les maquettes (mardi). Elle ne code que les écrans **[D]**. Le formulaire : questions par Binta, branchement par Vladimir, transformation en prompt par Omar (détail en `07`).

## Sources
- [Agents API, environnements](https://hub.hcompany.ai/agents-api/environments/overview) · [Exécution locale](https://hub.hcompany.ai/agents-api/local-runtime) · [SDK Python `hai-agents`](https://pypi.org/project/hai-agents/1.2.4/) · [Démarrage rapide](https://hub.hcompany.ai/agents-api/overview#quickstart)
- [Baromètre France Num 2026](https://www.entreprises.gouv.fr/espace-presse/barometre-france-num-2026-quatre-tpe-pme-sur-dix-utilisent-desormais-lintelligence)
- Les API de capture de macOS et de Windows sont décrites de mémoire : à vérifier dans la documentation Apple et Microsoft au moment de coder.
