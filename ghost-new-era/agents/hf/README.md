# Hugging Face : classer les pages du wiki selon le poste (étape 5, Henriquet)

Usage réel de Hugging Face (stack obligatoire) : l'Agent Docs choisit les documents de la page « Bienvenue Karim » grâce à un modèle d'embeddings, appelé par les Inference Providers (`router.huggingface.co`), avec les crédits du coupon de l'événement.

## Mesure du 20/11 (3 h 45), 15 pages du wiki d'Atelier Nova

La requête est construite à partir des données de la base : poste, équipe et outils du catalogue d'accès (Commercial : CRM, Devis, Agenda partagé). Chaque page est décrite par son espace, son titre, ses mots-clés et son contenu.

| Modèle | Commercial | Développeuse | Temps pour 15 pages | Dimension |
| --- | --- | --- | --- | --- |
| **ibm-granite/granite-embedding-97m-multilingual-r2** (retenu) | **5 / 5** | 4 / 5 | 4,8 s | 384 |
| intfloat/multilingual-e5-large | 5 / 5 | 4 / 5 | 5,6 s (16 s au premier appel) | 1 024 |

Pour la développeuse, la 5e page proposée est « Sécurité informatique » (page pour tous) au lieu de « Process de mise en production ».

Top 5 pour Karim (commercial), avec granite : Guide du CRM (0,901), Process devis (0,873), Playbook de vente (0,863), Charte client (0,854), Grille de prix (0,818).

**Premier essai, à retenir :** avec une requête vague (« documents utiles pour bien démarrer son poste ») et le seul titre et contenu des pages, les deux modèles ne trouvaient que 1 à 3 pages justes sur 5 : le mot « poste » faisait remonter « Installer son poste développeur » même pour un commercial. Décrire le poste avec les données de l'entreprise a tout changé.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `meilleuresPages.ts` | Fonction serveur pour l'Agent Docs : `meilleuresPages("Commercial", "Ventes")`. Lit le wiki et le catalogue dans Supabase, appelle Hugging Face, renvoie les 5 meilleures pages. Repli sur l'étiquette `role_cible` si Hugging Face ne répond pas (signalé dans `source`) |
| `test_hf_wiki.py` | Le script de mesure (jeton lu dans `.env`, jamais affiché) |
| `wiki_pages.json` | Les 15 pages utilisées pour la mesure (copie fictive du wiki) |

Variables serveur nécessaires : `HF_TOKEN` (droit « Inference » seulement), `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. Jamais dans le navigateur.
