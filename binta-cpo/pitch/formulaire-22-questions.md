# Formulaire avant audit : 22 questions (à saisir dans Google Forms)

Rempli par le gérant, 10 minutes. Source : `commun/roadmap/07`, §21.
Titre du formulaire : **Ghost : préparer votre audit**
Description : « Ces réponses nous permettent d'adapter Ghost à votre entreprise. Aucune donnée personnelle de vos clients n'est demandée. »

Consignes de saisie dans Google Forms :
- Les questions 6 à 9 se répètent par poste (3 postes au plus) : créer 3 sections « Poste 1 / 2 / 3 », les postes 2 et 3 facultatifs.
- Chaque titre de question commence par son numéro (Q1, Q2…) pour que n8n (Vladimir) retrouve les colonnes de façon stable.

## Section 1 : Organisation
| N° | Question | Type Google Forms |
|---|---|---|
| Q1 | Quelle est votre activité, en une phrase ? | Réponse courte (obligatoire) |
| Q2 | Dans quel secteur ? | Liste déroulante : Immobilier, Comptabilité, Avocats, RH, Autre |
| Q3 | Combien de personnes travaillent sur ordinateur ? | Réponse courte, validation nombre |
| Q4 | Quelles équipes ou quels services ? | Réponse courte |
| Q5 | Avez-vous des représentants du personnel ? | Choix unique : Oui / Non |

## Sections 2 à 4 : Poste 1, Poste 2, Poste 3 (répéter Q6 à Q9)
| N° | Question | Type |
|---|---|---|
| Q6 | Intitulé du poste, et nombre de personnes | 2 réponses courtes (intitulé, nombre) |
| Q7 | Ses 3 missions principales | 3 réponses courtes (ligne 1, 2, 3) |
| Q8 | Ce que ce poste peut décider seul | Réponse courte |
| Q9 | Ce que ce poste ne doit pas voir ou décider | Réponse courte |

## Section 5 : Décideurs
| N° | Question | Type |
|---|---|---|
| Q10 | Qui décide d'un achat de logiciel ? | Liste déroulante des postes saisis (+ Gérant / Autre) |
| Q11 | Qui valide un changement dans la façon de travailler ? | Liste déroulante des postes saisis (+ Gérant / Autre) |

## Section 6 : Outils
| N° | Question | Type |
|---|---|---|
| Q12 | Quels logiciels utilisez-vous tous les jours ? | Cases à cocher (Messagerie, Agenda, Google Chrome, Google Sheets, Excel, logiciel métier, ...) + « Autre » |
| Q13 | Lesquels sont installés sur l'ordinateur, lesquels sont en ligne ? | Grille à choix multiples (lignes : logiciels de Q12 ; colonnes : Installé / En ligne) |
| Q14 | Quelles informations recopiez-vous d'un outil à l'autre ? | Paragraphe |

## Section 7 : Process
| N° | Question | Type |
|---|---|---|
| Q15 | Vos 3 process les plus fréquents | 3 réponses courtes |
| Q16 | Lequel vous semble le plus long ou le plus pénible ? | Réponse courte |

## Section 8 : Irritants
| N° | Question | Type |
|---|---|---|
| Q17 | Quelles tâches vos équipes disent-elles « faire à la main » ? | Paragraphe |
| Q18 | Qu'avez-vous déjà essayé d'automatiser ? Résultat ? | Paragraphe |

## Section 9 : Objectifs
| N° | Question | Type |
|---|---|---|
| Q19 | Si vous gagniez 1 jour par semaine et par personne, à quoi servirait-il ? | Paragraphe (reprise dans chaque fiche et dans la charte client) |
| Q20 | Quel résultat vous ferait dire que l'audit a été utile ? | Réponse courte |

## Section 10 : Contraintes
| N° | Question | Type |
|---|---|---|
| Q21 | Quelles données ne doivent jamais sortir de l'entreprise ? | Cases à cocher (Noms et coordonnées de clients, Montants, IBAN, Adresses, Contrats, ...) + « Autre » |
| Q22 | Y a-t-il des logiciels que Ghost ne doit en aucun cas observer ? | Réponse courte |

## Réponse préparée pour la démo (Agence Belvédère)
À saisir une fois dans le formulaire pour avoir 1 réponse réelle : voir `commun/donnees/contexte-entreprise-exemple.json` (activité : transaction et gestion locative à Massy, 10 personnes, immobilier, postes assistante / négociateur / gérante).

## À transmettre à Vladimir avant 16h
- Le lien du formulaire (mode « éditeur » pour qu'il branche n8n).
- Ce fichier (la correspondance Q1 à Q22 ↔ champs du contrat §7).
