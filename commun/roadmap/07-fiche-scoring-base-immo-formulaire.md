# Ghost : roadmap, partie 7 : fiche opportunité, scoring, base immobilier, formulaire et prompts (points 18, 20, 21)

## 18 a. Modèle de fiche « opportunité d'automatisation »

Destinataire : la personne qui mettra en place (consultant junior ou client). Règle de détail : **elle doit pouvoir commencer sans rappeler personne.** Une page, deux axes.

### Fiche remplie pour la tâche de démo

**OPPORTUNITÉ N°1 : Recopier une annonce sur 3 sites sans passerelle** · Score **73/100** · Quadrant : gain rapide · Confiance : 4/5

**Axe métier**
| Rubrique | Contenu |
|---|---|
| Le process, en clair | Quand un mandat est prêt, l'assistante ouvre la fiche dans le logiciel de l'agence, puis recopie titre, prix, surface, ville, description et photos sur 3 sites que le logiciel ne connecte pas. Elle note ensuite la publication dans un tableur. |
| Qui le fait | 2 assistantes commerciales |
| Déclencheur | Nouveau mandat, baisse de prix, bien vendu |
| Fréquence | 300 opérations par an et par personne **[H]** (observé : 3 en 30 minutes de session jouée) |
| Durée aujourd'hui | 12 minutes par opération (mesuré : médiane de 3 chronométrages) |
| Temps passé par an | 120 h (600 opérations × 12 min) |
| Gain attendu | 10 min par opération (l'agent prend environ 1 min 35, plus 2 min de vérification humaine). **49 h par an** après adoption (70 %) et part réellement récupérée (70 %). Valeur : environ 1 470 € par an à 30 €/h **[H]**. |
| Priorité | 2 sur 3 dans cette agence (après la relance des prospects) |
| Impact sur l'équipe | Moins de saisie, moins d'erreurs de prix entre sites. Les assistantes gardent la validation de chaque annonce. |
| À quoi sert le temps libéré | Accueil téléphonique et suivi des dossiers de mandat (écrit par la gérante dans le formulaire) |
| Hypothèses à vérifier | Fréquence réelle sur 5 jours d'audit ; les 3 sites n'ont-ils vraiment aucune passerelle ? À demander à l'éditeur du logiciel. |

**Axe technique**
| Rubrique | Contenu |
|---|---|
| Outil recommandé | **Agent H** (navigateur). Raison : les 3 sites n'ont pas d'API. |
| Options écartées | Passerelle du logiciel : à activer en priorité pour les grands portails (gain immédiat, sans IA), mais elle ne couvre pas ces 3 sites. n8n : pas d'API. Script figé : casse au premier changement de formulaire. |
| Étapes de l'automatisation | 1. L'assistante valide l'annonce dans le logiciel. 2. Export de la fiche (titre, prix, surface, ville, description, photos). 3. L'agent ouvre chaque site, se connecte, remplit, publie. 4. Il renvoie l'adresse de chaque annonce. 5. Contrôle automatique : le prix publié est égal au prix du mandat. 6. Ligne ajoutée au tableur de suivi (n8n). 7. Message à l'assistante : « 3 annonces en ligne, à vérifier ». |
| Données en entrée | Fiche mandat : titre, prix, surface, pièces, ville, description, classe énergie, honoraires, photos. Identifiants des 3 sites (dans un coffre, jamais dans la consigne). |
| Données en sortie | 3 adresses d'annonces, statut par site, durée, capture de confirmation |
| Points de vigilance | **Mentions obligatoires** d'une annonce (prix et honoraires, classe énergie, risques) : l'agent ne doit rien retirer. Conditions d'utilisation de chaque site : vérifier que l'automatisation est permise. Mots de passe. Mise à jour et retrait de l'annonce à prévoir aussi. Validation humaine avant publication tant que la réussite n'est pas à 9 sur 10. |
| Effort de mise en place | 1 jour (8 h) : 3 h de réglage de la consigne, 3 h de tests (10 essais par site), 2 h de formation |
| Compétence nécessaire | Junior : savoir lire un JSON, régler une consigne, utiliser n8n |
| Critère de recette | 9 publications justes sur 10, prix identique sur les 3 sites, durée sous 3 minutes |
| Coût d'exécution | 0,11 à 0,26 $ par opération, soit environ 90 $ par an |
| Maintenance | Revoir la consigne quand un site change : 1 h par trimestre **[H]** |
| Preuve | Exécution du jj/mm : 3 sites sur 3, 95 s contre 720 s (vidéo jointe) |

Lecture honnête de cette fiche : 1 200 € de mise en place pour 1 470 € de gain par an, soit un retour en 10 mois. C'est correct, pas spectaculaire. La relance des prospects (ci-dessous) est meilleure. Un bon audit le dit.

### Modèle vide (à copier)
```
OPPORTUNITÉ N°__ : [verbe + objet]   Score __/100   Quadrant : __   Confiance : __/5

AXE MÉTIER
- Le process, en clair (3 phrases, sans jargon) :
- Qui le fait (postes, nombre de personnes) :
- Déclencheur :
- Fréquence (mesurée / déclarée) :
- Durée aujourd'hui (mesurée / déclarée) :
- Temps passé par an :
- Gain attendu (formule : personnes × fréquence × temps gagné × adoption × part récupérée) :
- Priorité :
- Impact sur l'équipe :
- À quoi sert le temps libéré :
- Hypothèses à vérifier, et auprès de qui :

AXE TECHNIQUE
- Outil recommandé (agent H / n8n / outil existant / rien) et raison :
- Options écartées et pourquoi :
- Étapes de l'automatisation (numérotées) :
- Données en entrée :
- Données en sortie :
- Points de vigilance (données sensibles, obligations du métier, erreurs possibles, validation humaine) :
- Effort de mise en place (heures ou jours) :
- Compétence nécessaire :
- Critère de recette (comment on sait que ça marche) :
- Coût d'exécution :
- Maintenance :
- Preuve (exécution par l'agent, date, durées) :
```

---

## 18 b. Grille de scoring

### Les 5 critères, notés de 1 à 5
| Note | **Gain** (heures nettes par an) | **Facilité** | **Effort** de mise en place | **Risque** | **Confiance** dans la détection |
|---|---|---|---|---|---|
| 1 | moins de 10 | Demande du jugement à chaque fois | moins d'une demi-journée | Aucune donnée personnelle, erreur sans conséquence | Questionnaire seul |
| 2 | 10 à 24 | Documents libres, beaucoup d'exceptions | 0,5 à 2 jours | Données internes, erreur réversible | Vocal validé par la personne |
| 3 | 25 à 59 | Quelques cas particuliers | 2 à 5 jours | Données de tiers, ou message envoyé à un client après validation | Vu 3 ou 4 fois à l'écran |
| 4 | 60 à 149 | Interface stable, étapes fixes | 5 à 15 jours | Engagement juridique ou financier | Vu 5 à 9 fois |
| 5 | 150 et plus | API ou règle simple, données structurées | plus de 15 jours | Irréversible, ou données sensibles | Vu 10 fois et plus, chez 2 personnes |

Gain net = personnes × fréquence annuelle × temps gagné × adoption × part récupérée.

### La formule
**Score sur 100 = (0,35 × Gain + 0,20 × Facilité + 0,20 × (6 − Effort) + 0,15 × (6 − Risque) + 0,10 × Confiance) × 20**

L'effort et le risque sont inversés : plus ils sont élevés, plus le score baisse. Le gain pèse le plus, mais une tâche risquée ou incertaine ne peut pas arriver en tête.

**Deux garde-fous**
- Risque à 5 : la tâche sort du classement, quel que soit son score. Elle est listée « à ne pas automatiser ».
- Confiance à 1 ou 2 : le score est affiché avec la mention « à mesurer ».

### Affichage : matrice gain / effort
```
 Gain ≥ 3 │  GAIN RAPIDE          │  PROJET
          │  à faire tout de suite│  à planifier, chiffrer
──────────┼───────────────────────┼─────────────────────
 Gain < 3 │  À REGROUPER          │  À ÉCARTER
          │  petits gains faciles │
          └───────────────────────┴─────────────────────
               Effort ≤ 2               Effort ≥ 3
```
Taille du point = heures par an. Couleur = risque (vert 1-2, orange 3, rouge 4-5). Contour en pointillé = confiance faible.

### Application à 3 tâches immobilières
| | Recopier une annonce sur 3 sites sans passerelle | Relancer les prospects après visite | Compte rendu de visite au propriétaire |
|---|---|---|---|
| Personnes × fréquence **[H]** | 2 × 300 par an | 6 × 400 par an | 6 × 300 par an |
| Temps gagné par opération | 10 min | 5 min | 8 min |
| Adoption × part récupérée | 70 % × 70 % | 60 % × 70 % | 50 % × 60 % |
| **Heures nettes par an** | **49 h** | **84 h** | **72 h** |
| Gain | 3 | 4 | 4 |
| Facilité | 4 | 5 | 3 |
| Effort | 2 | 1 | 2 |
| Risque | 2 | 3 | 3 |
| Confiance | 4 | 4 | 3 |
| **Score** | **73** | **85** | **71** |
| Quadrant | Gain rapide | Gain rapide | Gain rapide |
| Outil recommandé | Agent H (pas d'API) | n8n : brouillon de message à J+2, envoi après validation | Dictée + mise en forme par un LLM + n8n |
| Vigilance | Mentions obligatoires de l'annonce | Coordonnées des prospects, ton du message, pas d'envoi automatique | Propos rapportés d'un visiteur : relecture obligatoire |

Total des 3 tâches : **205 h par an**. C'est ce chiffre, et non les 990 h, qui a une justification ligne par ligne.

---

## 20. Base de connaissances immobilier

**Statut des contenus** : les obligations viennent de sources citées en fin de document, à revérifier sur les textes officiels. **Toutes les durées sont des hypothèses [H]** : je n'ai pas trouvé de mesure publique fiable. À vérifier en premier auprès de 3 agences, chronomètre en main. C'est le premier travail de l'étape « Cadrer ».

### Structure (la même pour chaque secteur)
```json
{
  "secteur": "immobilier",
  "version": "2026-11",
  "process": [ {"id": "", "nom": "", "etapes": [], "postes": [], "logiciels": []} ],
  "vocabulaire": { "terme": "définition courte" },
  "logiciels": [ {"categorie": "", "role": "", "couvre_deja": []} ],
  "taches_repetitives": [ {"nom": "", "process": "", "poste": "", "duree_min": 0, "frequence": "", "statut_duree": "hypothese"} ],
  "obligations": [ {"regle": "", "effet_sur_automatisation": "", "source": ""} ],
  "donnees_sensibles": [ {"donnee": "", "traitement": "flouter | jamais stocker | ne pas capter"} ],
  "deja_automatise": [ {"quoi": "", "par": ""} ],
  "sources": []
}
```
Stockage : dans `profils_metier.config`, clé `base_connaissances`. Usage : la couche « métier » du prompt en reprend le vocabulaire et les obligations ; la détection s'en sert pour **nommer** les tâches ; l'arbitrage s'en sert pour répondre « déjà couvert par votre logiciel ».

### Process clés
| Process | Étapes | Postes |
|---|---|---|
| **Prospection et estimation** | Repérage des biens à vendre (pige), prise de contact, rendez-vous, avis de valeur | Négociateur |
| **Mandat** | Mandat écrit (simple ou exclusif), inscription au registre des mandats, dossier du bien (titre, diagnostics, classe énergie) | Négociateur, assistante |
| **Mise en marché** | Photos, rédaction de l'annonce, diffusion vers les portails et le site de l'agence, vitrine | Assistante, négociateur |
| **Acquéreurs** | Réception des demandes, qualification (budget, projet, financement), rapprochement avec les biens | Négociateur, assistante |
| **Visites** | Prise de rendez-vous, bon de visite, visite, compte rendu au vendeur, relance du visiteur | Négociateur |
| **Vente** | Offre, négociation, compromis ou promesse, suivi du financement et du notaire, acte, facture d'honoraires | Négociateur, gérant |
| **Gestion locative** | Mise en location, dossier du candidat, bail, état des lieux, loyers et quittances, relance des impayés, charges, travaux | Gestionnaire |
| **Syndic** | Assemblées, appels de fonds, suivi des travaux | Gestionnaire de copropriété |

### Vocabulaire
| Terme | Sens |
|---|---|
| Mandat simple / exclusif | Contrat écrit par lequel le propriétaire confie la vente, à plusieurs agences ou à une seule |
| Registre des mandats | Registre chronologique obligatoire ; son numéro figure sur chaque mandat |
| Pige | Recherche de biens à vendre dans les annonces de particuliers |
| Avis de valeur | Estimation du prix par l'agence |
| Multidiffusion, passerelle | Envoi automatique d'une annonce du logiciel vers plusieurs portails |
| Rapprochement | Mise en relation automatique d'un bien et des acquéreurs dont les critères correspondent |
| Bon de visite | Document signé par le visiteur, preuve que l'agence a présenté le bien |
| Compromis, promesse | Avant-contrat de vente |
| DPE | Diagnostic de performance énergétique (étiquettes énergie et climat) |
| Carte T, G, S | Cartes professionnelles : transaction, gestion, syndic |
| Honoraires | Rémunération de l'agence, à afficher |

### Logiciels (catégories)
| Catégorie | Rôle | Ce qu'elle couvre souvent déjà |
|---|---|---|
| Logiciel de transaction | Fiches biens, mandats, acquéreurs | Diffusion vers les portails, rapprochement, registre des mandats électronique, rédaction d'annonce assistée |
| Passerelle de multidiffusion | Envoi vers des dizaines de sites | Publication, mise à jour, retrait |
| Portails d'annonces | Visibilité | Statistiques, messagerie |
| Outil de pige | Détection des biens de particuliers | Alertes |
| Signature électronique | Mandats, compromis | Relances de signature |
| Logiciel de gestion locative ou de syndic | Baux, loyers, charges | Quittances, relances d'impayés |
| Messagerie, agenda, téléphonie | Rendez-vous, échanges | - |
| Tableur | Suivis « maison » | Rien : c'est là que se cachent les ressaisies |

### Tâches répétitives typiques (durées **[H]**)
| Tâche | Poste | Durée par opération | Fréquence par personne | Piste |
|---|---|---|---|---|
| Recopier une annonce sur un site sans passerelle | Assistante | 4 min par site | 5 à 10 par semaine | Agent H |
| Mettre à jour un prix ou retirer une annonce partout | Assistante | 5 à 10 min | 2 à 5 par semaine | Passerelle, sinon agent H |
| Relancer un prospect après visite | Négociateur | 5 min | 5 à 10 par semaine | n8n, brouillon à valider |
| Rédiger le compte rendu de visite au propriétaire | Négociateur | 8 à 10 min | 5 à 8 par semaine | Dictée + LLM |
| Saisir un mandat et l'inscrire au registre | Assistante | 15 à 20 min | 1 à 3 par semaine | Outil existant ; validation humaine |
| Qualifier une demande entrante | Assistante | 5 min | 10 à 30 par semaine | Formulaire + n8n |
| Prendre et confirmer un rendez-vous de visite | Assistante, négociateur | 5 min | 10 à 20 par semaine | Agenda en ligne |
| Réclamer une pièce manquante d'un dossier locatif | Gestionnaire | 5 min | 10 par semaine | n8n |
| Envoyer les quittances et relancer les impayés | Gestionnaire | variable | mensuel | Outil existant |
| Reporter une publication dans le tableur de suivi | Assistante | 2 min | 5 à 10 par semaine | n8n |

### Obligations qui pèsent sur les agences, et leur effet sur l'automatisation
| Règle (à revérifier sur les textes) | Effet pour Ghost |
|---|---|
| Carte professionnelle obligatoire (loi Hoguet du 2 janvier 1970 et son décret de 1972) | Aucune automatisation ne signe ou n'engage à la place du titulaire |
| Mandat écrit, inscrit par ordre chronologique dans un registre ; numéro reporté sur le mandat | Ne jamais automatiser la numérotation sans contrôle humain |
| Annonces : prix et répartition des honoraires, étiquettes énergie et climat, mention sur les risques, accès au barème d'honoraires (arrêté du 10 janvier 2017) | Toute automatisation d'annonce doit garder ces mentions. Point de vigilance ajouté d'office sur les fiches. |
| Lutte contre le blanchiment : vigilance sur les clients, formation des équipes à démontrer | Les justificatifs d'identité et de fonds ne doivent jamais être captés |
| Location : logements classés G interdits à la location depuis 2025, F en 2028, E en 2034 | Une annonce de location doit bloquer si la classe énergie l'interdit |
| RGPD : données des prospects, propriétaires, locataires | Floutage local, durée courte |

Les contrôles de la DGCCRF relèvent surtout des défauts d'affichage (barème, classe énergie, surface, mentions en ligne). Argument commercial : une automatisation bien faite **réduit** ces oublis.

### Données sensibles
| Donnée | Traitement |
|---|---|
| Nom, téléphone, e-mail, adresse des prospects, propriétaires, locataires | Flouter |
| Budget, revenus, situation familiale ou professionnelle | Ne jamais stocker |
| Pièces d'identité, avis d'imposition, bulletins de salaire, relevés bancaires | Ne pas capter : logiciels et dossiers à ne pas autoriser |
| IBAN | Flouter |
| Adresse exacte d'un bien sous mandat non publié | Flouter |
| Montants (prix, honoraires) | Flouter par défaut ; visibles seulement dans les données de test |

### Ce qui est déjà automatisé dans le secteur (Ghost doit répondre « outil existant »)
Diffusion vers les grands portails par passerelle · rapprochement automatique acquéreurs et biens · rédaction d'annonce assistée par IA · signature électronique · registre des mandats électronique · pige automatisée · relances automatiques par e-mail ou SMS dans certains logiciels.
Le terrain de Ghost : ce que ces outils ne relient pas entre eux, et ce que l'agence n'a jamais activé.

### Ajouter un secteur (ex. la comptabilité)
1. Copier la structure. Remplir les 8 blocs. Compter 1 journée.
2. Sources à utiliser en premier : l'ordre professionnel, les textes, 3 entretiens.
3. Ajouter les motifs à flouter du secteur dans le profil (pour la compta : montants, IBAN, SIREN, numéros de sécurité sociale, déjà dans le kit).
4. Tester sur 10 écrans fictifs du secteur : les tâches sont-elles bien nommées ? Les données sensibles sont-elles toutes floutées ?
5. Insérer la ligne en base. Aucun changement de code.
Pour la compta, blocs prioritaires : relance des pièces, saisie, rapprochement bancaire, facture électronique, secret professionnel.

---

## 21. Formulaire avant audit et prompts système en 3 couches

### Le formulaire : 22 questions, 10 minutes
Rempli par le gérant. Les questions 6 à 9 se répètent pour chaque poste (3 postes au plus dans la première version).

| N° | Thème | Question | Type |
|---|---|---|---|
| 1 | Organisation | Quelle est votre activité, en une phrase ? | Texte court |
| 2 | Organisation | Dans quel secteur ? (immobilier, comptabilité, avocats, RH, autre) | Liste |
| 3 | Organisation | Combien de personnes travaillent sur ordinateur ? | Nombre |
| 4 | Organisation | Quelles équipes ou quels services ? | Texte court |
| 5 | Organisation | Avez-vous des représentants du personnel ? | Oui / non |
| 6 | Postes | Intitulé du poste, et nombre de personnes | Texte, nombre |
| 7 | Postes | Ses 3 missions principales | 3 lignes |
| 8 | Postes | Ce que ce poste peut décider seul | Texte court |
| 9 | Postes | Ce que ce poste ne doit pas voir ou décider | Texte court |
| 10 | Décideurs | Qui décide d'un achat de logiciel ? | Liste de postes |
| 11 | Décideurs | Qui valide un changement dans la façon de travailler ? | Liste de postes |
| 12 | Outils | Quels logiciels utilisez-vous tous les jours ? | Cases + « autre » |
| 13 | Outils | Lesquels sont installés sur l'ordinateur, lesquels sont en ligne ? | Grille |
| 14 | Outils | Quelles informations recopiez-vous d'un outil à l'autre ? | Texte |
| 15 | Process | Vos 3 process les plus fréquents | 3 lignes |
| 16 | Process | Lequel vous semble le plus long ou le plus pénible ? | Texte court |
| 17 | Irritants | Quelles tâches vos équipes disent-elles « faire à la main » ? | Texte |
| 18 | Irritants | Qu'avez-vous déjà essayé d'automatiser ? Résultat ? | Texte |
| 19 | Objectifs | Si vous gagniez 1 jour par semaine et par personne, à quoi servirait-il ? | Texte |
| 20 | Objectifs | Quel résultat vous ferait dire que l'audit a été utile ? | Texte court |
| 21 | Contraintes | Quelles données ne doivent jamais sortir de l'entreprise ? | Cases + « autre » |
| 22 | Contraintes | Y a-t-il des logiciels que Ghost ne doit en aucun cas observer ? | Texte |

La question 19 n'est pas décorative : sa réponse est reprise dans chaque fiche (« à quoi sert le temps libéré ») et dans la charte signée avec le client.

### Le modèle de prompt en 3 couches
```
=== COUCHE 1 : MÉTIER (identique pour tous les clients du secteur) ===
Tu analyses le travail sur ordinateur dans : {secteur}.
Vocabulaire du métier : {vocabulaire}.
Process habituels : {process}.
Tâches répétitives connues : {taches_repetitives}.
Déjà couvert par les logiciels du secteur : {deja_automatise}. Si une tâche en fait partie,
recommande « outil existant » et rien d'autre.
Obligations du métier à ne jamais contourner : {obligations}.
Données sensibles : {donnees_sensibles}. Elles ont été remplacées par des marqueurs ([NOM], [TELEPHONE]...).
Ne tente jamais de les deviner ni de les reconstituer. N'en reprends aucune.

=== COUCHE 2 : ENTREPRISE (remplie par le formulaire) ===
Entreprise : {activite}, {effectif} personnes.
Qui décide : {decideurs}.
Outils utilisés : {outils}.
Process principaux : {process_principaux}.
Irritants déclarés (à vérifier, pas à croire) : {irritants}.
Objectif du dirigeant : {objectifs}.
Usage prévu du temps libéré : {usage_temps_libere}.
Contraintes : {contraintes}.

=== COUCHE 3 : POSTE ===
Tu analyses le travail du poste : {intitule}.
Ses missions : {missions}.
Ses outils : {outils_poste}.
Ce que ce poste peut décider : {peut_decider}.
Ce qu'il ne peut pas décider : {ne_peut_pas}. Ne propose aucune automatisation qui le ferait à sa place.

=== RÈGLES DE SORTIE (communes) ===
Tu décris des tâches, jamais des personnes. Aucun jugement sur le rythme, les pauses ou la qualité du travail.
Choix de l'outil : API disponible → n8n. Pas d'API → agent H. Déjà couvert → outil existant. Sinon → rien.
Si l'information manque, écris « inconnu ». N'invente ni durée ni fréquence.
Réponds uniquement avec le JSON demandé.
```

### Exemple complet : agence fictive, 3 postes

**Couche 1 (immobilier)**, commune aux 3 postes
```
Tu analyses le travail sur ordinateur dans : une agence immobilière (transaction et gestion locative).
Vocabulaire du métier : mandat (simple, exclusif), registre des mandats, pige, avis de valeur, multidiffusion,
passerelle, rapprochement, bon de visite, compromis, DPE, honoraires.
Process habituels : prospection et estimation ; mandat ; mise en marché ; acquéreurs ; visites ; vente ; gestion locative.
Tâches répétitives connues : recopier une annonce sur un site sans passerelle ; mettre à jour un prix partout ;
relancer un prospect après visite ; compte rendu de visite ; saisie d'un mandat ; qualification d'une demande.
Déjà couvert par les logiciels du secteur : diffusion vers les grands portails par passerelle, rapprochement
acquéreurs et biens, signature électronique, registre des mandats électronique. Si une tâche en fait partie,
recommande « outil existant » et rien d'autre.
Obligations du métier à ne jamais contourner : mandat écrit inscrit au registre ; mentions obligatoires des
annonces (prix et honoraires, étiquettes énergie et climat, risques) ; vigilance contre le blanchiment.
Données sensibles : coordonnées, budget et situation des prospects et des propriétaires ; pièces d'identité ;
IBAN. Elles ont été remplacées par des marqueurs. Ne tente jamais de les deviner ni de les reconstituer.
N'en reprends aucune.
```

**Couche 2 (Agence Belvédère, fictive)**, commune aux 3 postes
```
Entreprise : agence immobilière à Massy, transaction et gestion locative, 10 personnes.
Qui décide : la gérante pour les logiciels et les changements d'organisation ; les négociateurs pour les prix
et les mandats ; les assistantes pour la mise en ligne d'une annonce validée.
Outils utilisés : ImmoGest (logiciel de transaction), Google Chrome, Google Sheets, messagerie, agenda.
Process principaux : prise de mandat ; publication des annonces ; visites et relances.
Irritants déclarés (à vérifier, pas à croire) : ressaisie des annonces sur 3 sites sans passerelle ;
relances oubliées après visite.
Objectif du dirigeant : libérer 1 jour par semaine aux assistantes.
Usage prévu du temps libéré : accueil téléphonique et suivi des dossiers de mandat.
Contraintes : ne jamais stocker les coordonnées des prospects ; aucun e-mail envoyé sans validation humaine ;
ne pas observer la messagerie ni le logiciel de gestion locative.
```

**Couche 3, poste 1 : gérante**
```
Tu analyses le travail du poste : gérante.
Ses missions : piloter l'activité, suivre les mandats et les ventes, gérer l'équipe et les fournisseurs.
Ses outils : ImmoGest (tableaux de suivi), Google Sheets, messagerie.
Ce que ce poste peut décider : tout achat, toute organisation.
Ce qu'il ne peut pas décider : rien de particulier.
Attention : cherche les tâches de consolidation et de suivi (tableaux refaits à la main, chiffres recopiés).
Ne propose aucun indicateur par collaborateur.
```

**Couche 3, poste 2 : négociateur**
```
Tu analyses le travail du poste : négociateur immobilier.
Ses missions : prospecter, estimer, prendre des mandats, faire visiter, négocier, suivre la vente.
Ses outils : ImmoGest, téléphone, messagerie, agenda.
Ce que ce poste peut décider : le prix proposé, le contenu d'un compte rendu, le moment d'une relance.
Ce qu'il ne peut pas décider : l'achat d'un outil, la signature à la place du titulaire de la carte.
Attention : beaucoup de son travail se passe hors écran (visites, téléphone). Ne conclus rien de l'absence
d'activité. Les messages aux clients restent des brouillons à valider.
```

**Couche 3, poste 3 : assistante commerciale**
```
Tu analyses le travail du poste : assistante commerciale.
Ses missions : publier et mettre à jour les annonces, préparer les dossiers de mandat, accueil téléphonique.
Ses outils : ImmoGest, Google Chrome (sites d'annonces), Google Sheets.
Ce que ce poste peut décider : la mise en ligne d'une annonce validée par le négociateur.
Ce qu'il ne peut pas décider : modifier un prix, signer un mandat.
Attention : cherche les ressaisies entre ImmoGest, les sites et le tableur. Toute automatisation d'annonce
garde les mentions obligatoires et laisse la validation finale à l'assistante.
```

### Du formulaire au prompt, automatiquement
```
Google Forms ──► n8n (déclencheur « nouvelle réponse »)
                  1. Nettoyage : listes séparées, postes regroupés (code, sans IA)
                  2. Résumé structuré au format §7 : un seul appel à Haiku, sortie JSON stricte
                  3. Écriture dans Supabase : contextes_entreprise, postes
                  4. Appel de assembler_prompt(profil, contexte, poste) pour chaque poste
                  5. Écriture dans prompts_systeme : version + empreinte
                  6. Message au consultant Ghost : « prompts prêts, à relire »
```
- Les couches 1 et 3 viennent de la base (profil métier, table `postes`). Seule la couche 2 passe par un LLM, une seule fois, puis elle est **figée**.
- Un humain relit le prompt avant l'audit : 10 minutes. C'est dans les 2 h d'onboarding du coût de revient.

### Garantir des résultats cohérents et reproductibles
| Mesure | Effet |
|---|---|
| Le code décide de ce qui est une répétition, pas le LLM | La liste des candidates est identique à chaque passage |
| Prompt figé, versionné, avec empreinte recopiée dans chaque résultat | On sait quel prompt a produit quoi |
| Sortie en JSON avec schéma imposé, valeurs fermées pour la méthode et le quadrant | Pas de variation de forme |
| Le score est calculé par une formule, pas par le LLM | Même entrée, même score |
| Mise en cache : même empreinte de prompt + mêmes candidates = résultat relu, pas recalculé | Deux affichages du même audit sont identiques |
| Réglages du modèle fixés (pas de créativité), même modèle pour tout un audit | Moins de variation |
| Jeu de 10 cas de référence, 5 relances chacun, avant chaque changement de prompt | On mesure au lieu de promettre |

**Ce qu'on peut dire** : « même entrée, même liste de tâches et même score, parce que c'est du code. Le nom de la tâche et les consignes viennent d'un LLM : nous mesurons leur stabilité, elle est de X sur 10. » **Ce qu'on ne dit pas** : « l'IA donne toujours la même réponse ».

### Qui s'en charge
| Élément | Responsable | Quand |
|---|---|---|
| Questions et Google Forms | Binta | Mardi 16h |
| Workflow n8n `formulaire_vers_contexte` | Vladimir | Mercredi 12h |
| `assembler_prompt()` et les 3 couches | Omar | Mardi (factice), mercredi 12h (réel) |
| Couche 1 immobilier en base | Henriquet | Mardi après-midi |
| Réponse de l'agence fictive | Henriquet | Mardi |
| Relecture du prompt final | Assel | Mercredi |

Place dans le parcours client : étape 5 de `03`, entre le paiement et l'installation.

## Sources
- Obligations des agences : [DGCCRF, enquête sur les professionnels de l'immobilier](https://www.economie.gouv.fr/node/3232350), [DGCCRF, registre des mandats](https://www.economie.gouv.fr/node/3237811), [UNIS, mentions obligatoires des annonces de vente](https://www.unis-immo.fr/app/uploads/2026/02/tableau-annonces-ventes-mentions-obligatoires-090226-2.pdf), [Actu-Juridique, défauts d'information](https://www.actu-juridique.fr/civil/immobilier/la-mauvaise-pratique-des-agences-immobilieres-en-matiere-dinformation-du-consommateur-selon-la-dgccrf/), [lutte contre le blanchiment et formation](https://kohenavocats.fr/2026/06/12/agent-immobilier-tracfin-2026-controle-dgccrf-mandat-honoraires-annonces/), [calendrier des logements G, F, E](https://monimmeuble.com/?p=104351)
- Ce que couvrent déjà les logiciels : [Immofacile](https://www.lafabriquedunet.fr/logiciel/immofacile), [comparatif de CRM immobiliers](https://hackceleration.com/fr/labs/meilleur/crm-immobilier), [passerelles de multidiffusion](https://www.appvizer.fr/magazine/construction/promoteurs/multidiffusion-annonces-immobilieres)
- Les durées des tâches ne sont pas sourcées : hypothèses à mesurer.
