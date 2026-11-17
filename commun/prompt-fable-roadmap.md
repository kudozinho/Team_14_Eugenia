Tu es un cofondateur de startup expérimenté en IA agentique, automatisation et go-to-market B2B en France. Tu es exigeant : signale clairement les faiblesses, les hypothèses non vérifiées et les incohérences. Réponds en français.

# CONTEXTE
Nous sommes 6 étudiants (MSc IA appliquée au business, Eugenia School) au Hackathon « Build The Future » (Eugenia × H Company), du lundi 16 au vendredi 20 novembre 2026, track Creative Entrepreneur.
- Défi : créer en 4 jours une startup qui utilise l'Agent API de H Company (agents computer-use qui voient l'écran, cliquent, tapent et naviguent sur de vrais logiciels). Docs : platform.hcompany.ai et hub.hcompany.ai.
- Jury vendredi : ingénieurs H Company, Vercel et Eugenia. Ils n'évaluent pas une idée : ils évaluent un agent qui tourne en live sur un vrai cas business, avec des résultats chiffrés.
- Critères : Pertinence et impact 25 % / Excellence technique et Agents API 30 % / Faisabilité, adoption et apprentissages 25 % / UX, démo et pitch 20 %.
- Livrable supplémentaire : nos retours sur l'Agent API (ce qui a marché, ce qui a cassé, ce qui nous a surpris).
- Checkpoints :
  - CP1, lundi 17h : nom + slogan, problème, solution en 1 phrase, personae, stack, rôles (5 slides max).
  - CP2, mercredi 17h : parcours utilisateur (maquette), architecture technique, mini-pitch Loom de 2 min (problème + solution + avancement), roadmap jusqu'à jeudi.
  - CP4, vendredi 15h : pitch deck de 8 à 12 slides dans cet ordre : Problème, Solution, Démo, Business model, Go-to-market, Architecture technique, Limites + axes d'amélioration + roadmap, Estimation du coût de run.

# ÉQUIPE (rôles obligatoires)
1. Assel, CEO : vision, arbitrages tech × business, planning des livrables, porte le pitch et les Q&A.
2. Alejandro, CTO : architecture IA + automatisation + BDD + API, qualité du code, README/schémas, proto end-to-end et démo live avec plan B.
3. Vladimir, CAO : workflows n8n/Make/Apps Script, lien no-code et scripts Python/JS, tests de fiabilité et de rapidité.
4. Omar, CAIO : features IA, prompts structurés et reproductibles, comparaison des LLM (précision, coût, latence).
5. Henriquet, CDO : collecte de données, BDD propre (Supabase/Airtable/Sheets), pipelines de nettoyage (Pandas).
6. Binta, CPO : personae, parcours utilisateur (Figma/Miro), interface minimale, business model, go-to-market, pitch deck.

# NOTRE IDÉE
Nom choisi : **Ghost**. Slogan : **« See the work. Ghost the task. »** (le fantôme travaille en silence pour vous, mais ne se cache pas : icône visible et autorisations par logiciel).
Un outil d'audit d'automatisation pour les PME (et plus tard les grandes entreprises) qui n'ont ni IA ni automatisation, ainsi que pour les particuliers (indépendants, freelances). Il détecte les processus répétitifs, améliorables ou automatisables, prépare (sans les déployer) des skills, des workflows et une architecture de sous-agents, puis livre un rapport chiffré et un plan prêt à déployer, pour convaincre la direction d'adopter l'IA.

Valeur perçue recherchée : SIMPLE COMME GOOGLE. Une interface épurée, et une petite application installée sur l'ordinateur (icône dans la barre des menus / barre des tâches) qui montre si l'analyse est active ou non (transparence totale pour le salarié).

Capture : on veut une vraie capture de l'écran, pas seulement du navigateur, car le collaborateur peut travailler dans des logiciels installés sur l'ordinateur (SAP, Excel, logiciel de compta, Salesforce desktop, etc.). Le produit combine donc :
- une application de bureau (Windows et macOS) qui capture l'écran ;
- une extension Chrome en complément pour les outils web (plus de contexte : URL, champs, onglet actif).

FEATURE CLÉ : AUTORISATIONS PAR LOGICIEL. Le collaborateur choisit lui-même les logiciels qu'il accepte de partager (ex. seulement Excel et Google Chrome, ou seulement Salesforce et Asana). Seules les fenêtres de ces logiciels sont capturées ; tout le reste (messagerie perso, banque, autres applis) n'est jamais enregistré. Il peut modifier sa liste, mettre en pause ou retirer un logiciel à tout moment, et voit en direct ce qui est capté. C'est à la fois une feature produit et notre principal argument de conformité (minimisation des données RGPD).

FEATURE CLÉ : PROFIL MÉTIER (l'outil devient universel). Avant chaque audit, on choisit le métier du client (agence immobilière, cabinet comptable, cabinet d'avocats, RH…). Le profil fixe le contexte (vocabulaire, logiciels, tâches typiques) et les règles de confidentialité du secteur : quelles données sont sensibles (ex. montants, IBAN, SIREN et noms de clients en compta ; noms des parties en avocat ; coordonnées et budgets des prospects en immobilier), lesquelles sont floutées, lesquelles ne sont jamais stockées, la durée de conservation, et le socle RGPD commun. Il s'applique à deux niveaux : 1) dans le code, en local, avant tout envoi (filtres déterministes + reconnaissance de noms), ce qui garantit réellement la protection ; 2) dans le prompt système de l'IA, pour mieux comprendre les écrans et ne jamais reprendre de données sensibles dans le rapport. Ajouter un métier = ajouter une ligne en base. Explique comment le concevoir et le rendre crédible devant le jury.

3 modes d'analyse, du plus léger au plus complet (à présenter comme 3 niveaux d'offre) :
1. Questionnaire : l'utilisateur répond, l'IA en extrait les processus à améliorer.
2. Mode vocal (pour ceux qui refusent tout enregistrement de l'écran ou de leurs applis) : l'utilisateur explique à la voix ses process, surtout ceux qu'il répète le plus (étapes, outils, temps passé, fréquence, ce qu'il aime ou pas). Parcours : enregistrement → transcription → filtres du profil métier → l'IA reformule « voici ce que j'ai compris de ton process » (étapes numérotées, outils, temps estimé, fréquence) → l'utilisateur valide ou corrige (à la voix ou par écrit) → l'IA propose toutes les solutions utiles pour CETTE tâche précise (agent H, workflow n8n, outil existant, gains rapides sans IA), chacune avec le gain estimé et la difficulté de mise en place → option : démonstration par l'agent H. Les temps déclarés sont souvent surestimés : les présenter comme des estimations et proposer de les mesurer ensuite.
3. Observation de l'écran pendant 5 jours, uniquement sur les logiciels autorisés : l'application est active pendant les heures de travail, l'utilisateur travaille normalement, et chaque soir l'IA analyse quels processus peuvent être améliorés. L'audit est évolutif : dès J2, il peut prévenir l'utilisateur (« tu fais X à la main, on peut l'automatiser tout de suite »).

Fonction clé pour le jury : après la détection, l'agent H Company EXÉCUTE la tâche détectée en live sur le vrai logiciel, pour prouver le gain (chronomètre avant/après). Boucle : analyser → détecter → chiffrer → l'agent H exécute → rapport + plan.

Proposition de valeur : un consultant IA junior freelance coûte 1 000 à 2 000 €/jour (source : notre professeur). Notre audit coûte moins cher que la phase de diagnostic d'un consultant et livre un plan prêt à déployer, donc la mise en place demande ensuite beaucoup moins de jours-consultant. Objectif : faire économiser de l'argent aux entreprises.

Cas de démo : une agence immobilière FICTIVE (à créer de toutes pièces : nom, environ 10 collaborateurs, outils, processus). Exemples de tâches répétitives : publier la même annonce sur plusieurs portails, relancer les prospects après visite, saisir les mandats dans le logiciel de l'agence, rédiger les comptes rendus de visite. Pour la démo, l'agent H agit sur de FAUX portails de test que nous créons (jamais sur SeLoger ou Leboncoin en live : conditions d'utilisation et fiabilité).

# CIBLES (ICP)
Vision long terme : comme Claude ou ChatGPT, le produit s'adresse à terme à tout le monde (toute entreprise, tout travailleur sur ordinateur). Mais on commence par une niche pour que la solution soit vraiment adaptée, puis on élargit. Nos hypothèses d'ICP, par ordre de priorité :
1. **Tête de pont (choisie) : agences immobilières de 3 à 30 collaborateurs.** Beaucoup de tâches répétitives dans des interfaces web (multidiffusion d'annonces, relances de prospects, saisie de mandats), un gérant décideur au profil commercial qui achète vite s'il voit le gain, des données moins sensibles qu'en compta. Chaque heure libérée = plus de temps sur le terrain et plus de ventes. Cas parfait pour un agent computer-use.
2. **Cabinets d'expertise comptable de 5 à 50 collaborateurs.** Saisie, relances de pièces, rapprochements, et la pression de la réforme de la facturation électronique (réception obligatoire pour toutes les entreprises depuis le 1er septembre 2026, émission obligatoire pour les PME et TPE au 1er septembre 2027). Attention : secret professionnel et outils de saisie automatique déjà existants. Puis les autres PME de services administratives (RH/intérim, transport, avocats, courtage).
3. **Usage personnel : indépendants et freelances** (consultants, comptables indépendants, assistants virtuels) qui veulent auditer leur propre ordinateur. Cycle de vente court, peu de risque CNIL, bon terrain pour itérer.
4. **Plus tard : ETI et grands comptes**, en passant par des partenaires (consultants IA, ESN) qui utilisent notre audit comme porte d'entrée.
Pour chaque ICP : valide ou corrige, donne la taille de marché en France (nombre d'entreprises, sources), la douleur n°1, le déclencheur d'achat, le décideur, le budget probable, le canal d'acquisition (ex. FNAIM et réseaux d'agences, éditeurs de logiciels immobiliers, Ordre des experts-comptables, salons, LinkedIn), et dis lequel attaquer en premier et pourquoi. Recommande la séquence d'élargissement (niche → marché large).

# STACK ENVISAGÉE
H Company (Agent API + modèles Holo, nous avons 300 € de crédits), Hugging Face (modèles open-weights, éventuellement hébergés), un LLM d'analyse (ex. Claude Haiku/Sonnet/Opus 5.5), un modèle de transcription audio (ex. Whisper, Voxtral, ElevenLabs Scribe), n8n, Supabase, Vercel (Next.js), GitHub (dépôt de code partagé, gestion des tâches de l'équipe, déploiement automatique vers Vercel), une application de bureau de capture (ex. Tauri ou Electron, ou un agent Python), une extension Chrome en complément. Valide ou corrige cette stack, et recommande la techno de capture la plus rapide à monter en 4 jours.

# COÛTS ET PRICING : LA QUESTION CENTRALE
Nous fixerons nos prix à partir de ce que ça NOUS coûte (coûts techniques + temps humain), puis nous les comparerons à la valeur créée pour le client. Nous avons besoin de chiffres, pas de généralités.

Données de départ (vérifie-les sur les pages officielles et corrige-les si besoin) :
- H Company Agents API, offres mensuelles : Free 0 $ (60 M tokens, 3 sessions simultanées), Builder 20 $ (1 milliard de tokens, 10 sessions), Startup 200 $ (10 milliards de tokens, 100 sessions). Au-delà du forfait : prix du modèle + 20 %, débité sur le crédit.
- Claude API, par million de tokens entrée/sortie : Haiku 5.5 0,10 $/0,50 $, Sonnet 5.5 2 $/10 $, Opus 5.5 4 $/20 $. Une image de 1000×1000 px ≈ 1 334 tokens.
- Transcription : environ 0,003 à 0,006 $/minute (Whisper, Voxtral), ElevenLabs Scribe v2 ≈ 0,22 $/heure.
- Notre estimation de départ (à challenger) : environ 5 à 35 € de coûts IA par poste pour un audit écran de 5 jours selon le modèle choisi, moins de 1 € pour un audio, quelques centimes pour un questionnaire, et environ 20 à 60 € de dépenses totales sur toute la semaine du hackathon.

Ce que j'attends sur ce sujet :
a) **Coût du hackathon** : combien on va réellement dépenser cette semaine (crédits H, LLM, transcription, infra), jour par jour, et si nos 300 € de crédits H suffisent. Dis clairement si on est plutôt à 15 €/jour ou à 200 €/jour, et pourquoi.
b) **Coût unitaire par mode d'analyse** (questionnaire / audio / écran 5 jours), décomposé : nombre de captures par jour, tokens par capture, coût de la description des captures, synthèse quotidienne, rapport final, génération des skills/workflows, sessions de l'agent H, transcription, stockage. Donne 3 scénarios (économique / équilibré / premium selon les modèles) et compare API H vs modèle Holo auto-hébergé sur Hugging Face (coût GPU par heure, à partir de quel volume ça devient rentable). Vérifie les licences (Holo4 27B annoncé en licence non commerciale, certains Holo sous Apache 2.0).
c) **Coût fixe mensuel de run** : Vercel, Supabase, n8n, abonnement H, nom de domaine, outils, en phase MVP puis à 10, 50 et 200 clients.
d) **Temps humain par client** : onboarding, installation, relecture du rapport, restitution, support, vente. Valorise-le (ex. 40-60 €/h pour un profil junior, à justifier) et intègre-le au coût de revient.
e) **Pricing en 2 usages** :
   - **Entreprise (institutionnel)** : PME, puis grands comptes. Prix par mode d'analyse, par poste ou au forfait, audit déduit si le client signe la mise en place, abonnement en mode continu, offre de mise en place en partenariat avec des consultants.
   - **Personnel** : indépendants, freelances, étudiants qui veulent auditer leur propre ordinateur. Prix bas (one-shot ou abonnement), freemium possible. Note que le risque CNIL est bien plus faible quand l'utilisateur s'audite lui-même.
   Pour chaque offre : notre coût de revient, le prix proposé, la marge brute en € et en %, et le point mort (nombre de clients pour couvrir les coûts fixes).
f) **Comparaison de valeur** : notre prix face à un consultant junior à 1 000-2 000 €/jour, et le gain client calculé avec la formule du gain ci-dessous.
g) Le tout dans un **tableau récapitulatif** que Binta pourra mettre directement dans la slide « Business model » et la slide « Estimation du coût de run ».

# CONTRAINTES
- Juridique France/UE : RGPD, CNIL (sanction de 40 000 € en décembre 2024 pour captures d'écran régulières et mesure de l'« inactivité » ; keyloggers jugés disproportionnés), information/consultation du CSE (Code du travail L2312-8 et L2312-38), analyse d'impact (AIPD), niveau AI Act à déterminer. Le produit doit protéger les données dès la conception : traitement local quand c'est possible, floutage des données personnelles, volontariat, bouton pause et icône visible, aucune évaluation de performance individuelle, suppression des données en fin d'audit. Une agence immobilière manipule des données de prospects et de propriétaires (coordonnées, budget, situation) : traite ce point, ainsi que le secret professionnel si on attaque ensuite les cabinets comptables.
- Capture par logiciel : explique comment capturer uniquement les fenêtres des applications autorisées sur macOS (ex. ScreenCaptureKit, filtrage par application, permission « Enregistrement de l'écran ») et sur Windows (ex. Windows Graphics Capture par fenêtre), comment détecter l'application active, comment gérer les fenêtres non autorisées qui passent au premier plan (pause automatique ou masquage), et à quelle fréquence capturer (sur changement d'écran / événement plutôt qu'à intervalle fixe) pour limiter coûts et données. Précise ce qui est faisable en 4 jours pour la démo (ex. macOS seulement, 2-3 applis autorisées) et ce qu'on laisse pour plus tard.
- Valeurs de l'équipe : utile, transparent, aucune surveillance cachée, modèle économique éthique (pas de crédit à intérêts).

# MÉTHODES IMPOSÉES PAR NOTRE PROFESSEUR (à appliquer)
- Hypothèses : toute supposition est écrite comme une hypothèse (« nous supposons 12 collaborateurs »), jamais comme un fait. Pour chaque hypothèse clé, indique auprès de qui on la vérifierait en premier.
- Budget en 3 C : Construire, Consommer, Conduire le changement, chiffrés pour l'an 1 et les années suivantes.
- Formule du gain : Personnes × fréquence × temps gagné × adoption (jamais 100 %) × part récupérée (à quoi sert l'heure libérée), lue en coût par heure gagnée. Le point de départ déclaré est souvent surestimé : prévoir de le chronométrer. Exemple à recalculer pour l'agence fictive : 10 collaborateurs × 220 jours × 0,75 h × 60 % ≈ 990 h/an.
- Phrase type à savoir écrire : « Le projet coûte [X] € la première année, puis [Y] € par an. Il fait gagner [Z] heures si [N] % des utilisateurs l'adoptent. »
- Roadmap en 4 étapes, avec un jalon go / go sous conditions / stop entre chacune, et un critère écrit AVANT l'étape :
  1. Cadrer (bon problème, droit, budget ? → périmètre, AIPD lancée, point de départ mesuré)
  2. Prouver (ça marche sur données de test ? → prototype noté sur un jeu de cas réels)
  3. Piloter (les vrais utilisateurs s'en servent et y gagnent ? → usage et gain mesurés sur un groupe réduit)
  4. Passer à l'échelle (ça tient avec tout le monde ? → déploiement par vagues, suivi mensuel)
- Adoption : utilisateurs, ambassadeurs, réponse aux réfractaires, 2 indicateurs d'usage. Dire clairement à quoi sert le temps libéré (pas à supprimer des postes).

# CE QUE J'ATTENDS DE TOI
Fais des recherches web pour tout ce qui concerne l'état actuel du marché et des prix, et cite tes sources.
1. **Résumé exécutif** (5 lignes) puis **critique d'entrée** : les 3 plus gros risques et comment les retourner en avantages.
2. **Nom + slogan** : le nom (Ghost) et le slogan sont choisis. Donne seulement les risques éventuels (marque déjà déposée, connotation « espion ») et comment les désamorcer.
3. **Analyse concurrentielle** : tableau comparant Mimica, KYP.ai, Skan.ai, UiPath Task Mining, Celonis Task Mining, Microsoft Power Automate Process Advisor, Fluency, ainsi que les consultants/ESN IA en France et le « ne rien faire ». Colonnes : cible, prix (si public), méthode, livrable, limite, notre angle d'attaque. Puis notre positionnement en 3 phrases.
4. **ICP et personae** : d'abord l'analyse des ICP (bloc « CIBLES (ICP) » ci-dessus), puis les personae : le gérant d'agence immobilière (acheteur), un négociateur immobilier (utilisateur observé), l'associé d'un cabinet comptable (2e cible), un indépendant/freelance (usage personnel), un dirigeant de PME de services (marché suivant). Pour chacun : douleur, objection principale, déclencheur d'achat.
5. **Les 3 modes d'analyse en offres** : pour chaque mode, l'expérience utilisateur (dont le parcours d'autorisation des logiciels : installation, choix des applis, icône, pause, tableau « ce qui a été capté »), ce que l'IA produit, sa fiabilité, son niveau de risque RGPD, et comment on fait monter le client en gamme.
6. **Coûts et pricing** : tout le bloc « COÛTS ET PRICING » ci-dessus (points a à g).
7. **Budget 3 C** de notre startup (an 1 / an 2), cohérent avec les coûts du point 6.
8. **Architecture du MVP hackathon** : schéma des briques (application de bureau avec écran de choix des logiciels autorisés + extension Chrome + interface web simple → capture des fenêtres autorisées uniquement → floutage des données personnelles en local → transcription audio → analyse par un LLM → détection et scoring des processus → génération de workflow n8n / skill → exécution par l'Agent API H → mesure avant/après → rapport). Stack finale recommandée, en indiquant ce qui tourne vraiment et ce qu'on simule.
9. **Script de démo minuté** pour l'agence fictive, avec un plan B (vidéo de secours, environnement figé), et les données fictives à préparer (annonces, photos, fiches de mandats, faux portails, liste de prospects).
10. **Roadmap hackathon jour par jour** (lundi → vendredi), alignée sur les checkpoints, avec chaque soir le test « la démo tourne-t-elle de bout en bout ? ».
11. **Répartition du travail entre les 6 personnes, nommément** : c'est le livrable le plus important pour nous. Découpe le projet en 6 chantiers qui peuvent avancer EN PARALLÈLE dès mardi matin, sans que personne n'attende personne. Pour ça :
   - définis d'abord les **contrats d'interface** entre les chantiers : le format JSON d'un événement capturé, d'une tâche détectée, d'un profil métier, d'une demande d'exécution à l'agent H et de son résultat, et le schéma des tables Supabase. Chacun code contre ces formats ;
   - prévois des **données factices** (un fichier d'événements d'exemple, une tâche détectée d'exemple) pour que chacun puisse tester sa brique avant que celle d'avant soit finie ;
   - pour chaque personne : son chantier, ses tâches concrètes par jour, son critère de « terminé », ce qu'elle reçoit et de qui, ce qu'elle livre et à qui, son livrable pour chaque checkpoint, et un prompt de départ prêt à copier dans son propre Fable ;
   - les **moments de branchement** (quand on relie deux briques) et qui les teste ;
   - un tableau RACI, et ce que chacun fait s'il a fini en avance ou s'il est bloqué.
12. **Conformité** : les 4 questions du RGPD (données, base légale, finalité, durée), le niveau AI Act, 5 risques notés (probabilité × impact) avec parade et responsable, la slide « conforme à la CNIL dès la conception », et les 5 questions difficiles probables du jury avec leurs réponses.
13. **Roadmap produit en 4 étapes** (Cadrer → Prouver → Piloter → Passer à l'échelle), datée sur 24 mois, avec un jalon et son critère entre chaque étape, et un plan d'adoption.
14. **Template de retours sur l'Agent API** à remplir pendant la semaine.
15. **Organigramme de l'application et parcours client** : l'arborescence complète de l'app (comme un organigramme : Connexion → vues et onglets → fonctionnalités de chaque onglet), avec 3 vues : Vue Entreprise (gérant/admin : tableau de bord, équipe et consentements, profil métier et règles RGPD, rapports, preuves de l'agent, plan d'automatisation, facturation, paramètres de conservation et suppression des données), Vue Collaborateur (consentement, choix du mode écran/vocal/questionnaire, applis autorisées, pause, « ce qui a été capté », mode vocal avec validation de la reformulation, alertes, ses gains) et Vue Personnel (freelance, version simplifiée). Puis le parcours client de bout en bout : page d'accueil → choix de l'offre (Entreprise / Personnel) → inscription et connexion (e-mail, Google) → paiement (Stripe : audit au forfait, abonnement, questionnaire gratuit) → onboarding (profil métier, invitation des collaborateurs) → audit en cours (icône, alertes J2) → rapport et preuve par l'agent → plan d'action et devis de mise en place → abonnement en mode continu. Indique ce qui est indispensable pour la démo de vendredi et ce qui est simulé.

Format : markdown structuré, tableaux quand c'est utile, phrases courtes. Pas de remplissage.
