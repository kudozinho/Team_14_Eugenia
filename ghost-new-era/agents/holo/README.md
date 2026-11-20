# Test Holo : lecture d'écran (étape 4, Henriquet)

Mesuré le 20/11/2026 vers 3 h 20, sur 5 captures réelles du site en ligne (ghost-new-era.vercel.app), via la Models API de H Company (`https://api.hcompany.ai/v1/chat/completions`, format compatible OpenAI, image en base64).

## Résultat : modèle retenu `holo4-27b`

| Modèle | JSON valides | Déclencheur correct | Latence médiane | Latence max |
| --- | --- | --- | --- | --- |
| **holo4-27b** (prompt v2) | 5 / 5 | **5 / 5** (3 passages identiques) | **1,8 à 1,9 s** | 3,6 à 3,8 s |
| holo3-1-35b-a3b (prompt v2) | 5 / 5 | 4 / 5 | 2,3 s | 2,6 s |
| holo3-1-35b-a3b (prompt v1) | 5 / 5 | 4 / 5 | 2,6 s | 4,1 s |

Taille d'une capture 1254 × 616 en JPEG : environ 740 jetons d'image, environ 1 100 jetons d'entrée par appel. Bien sous la limite de 30 s fixée par l'équipe : aucune réduction d'image nécessaire.

## Les 5 captures (pièges compris)

| Capture | Ce qu'elle montre | Déclencheur attendu |
| --- | --- | --- |
| 1 | Haut de la landing Ghost | null |
| 2 | Landing, exemple qui cite Karim | null (piège) |
| 3 | Accueil RH avec « Nouvelle arrivée : Karim Benali » | `arrivee_karim` |
| 4 | Fiche RH de Léa | null |
| 5 | Fiche RH de Karim | null (piège) |

## Ce qu'on a appris

- **holo3-1 se trompe sur la fiche de Karim** (déclenche alors que ce n'est pas la notification), même avec le prompt durci. **holo4-27b ne se trompe pas.**
- **holo4-27b raisonne avant de répondre** : avec `max_tokens: 400`, il a été coupé une fois avant d'écrire le JSON. Passer à 1 200.
- **Le champ `outils` n'est pas fiable** sur les pages du site Ghost (Holo cite parfois des outils absents). Ne pas s'en servir pour décider : la source de vérité est la liste autorisée par l'utilisatrice (table `consentements`). `lireCapture.ts` filtre les noms inconnus.
- **Sécurité conseillée** : ne proposer que si Holo voit l'arrivée **et** si la base confirme une arrivée `nouvelle` (table `arrivees`). Une erreur de lecture ne déclenche alors jamais rien seule.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `prompt_holo.txt` | Le prompt validé (v2) |
| `lireCapture.ts` | Fonction serveur prête à brancher dans le site (clé `HAI_API_KEY` dans Vercel, jamais dans le navigateur) |
| `test_holo.py` | Le script de mesure (lit la clé dans `.env`, ne l'affiche jamais). Modèle : variable `HOLO_MODELE` |

Le test a été lancé une fois depuis un PC de l'équipe, seulement parce que la clé H y était déjà. En production, l'appel à Holo se fait depuis le serveur du site, pour tout utilisateur.
