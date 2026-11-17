# Sites de test « sans passerelle » (chantier C, Vladimir)

Un seul code Next.js, **3 déploiements Vercel** (un domaine par site : le Recorder autorise les sites par domaine).
La variable `PORTAIL` choisit le site servi. Tout s'écrit dans `annonces_portails` (schéma commun, non modifié).

| Site | Niveau de test | Formulaire | Noms des champs envoyés | Bouton |
|---|---|---|---|---|
| **A** `/deposer` | 1 | Simple, 5 champs, libellés évidents | `titre`, `prix`, `surface_m2`, `ville`, `description` | Publier |
| **B** `/nouvelle` | 2 | Autres libellés, autre ordre, **menu déroulant** Commune, prix en texte (« 289 000 € » accepté) | `commune`, `intitule`, `superficie`, `montant`, `texte` | Enregistrer l'annonce |
| **C** `/publier` | 3 et 4 | **2 étapes**, menu déroulant Localisation, **case à cocher** obligatoire, **photo** (JPG, PNG ou WebP, 4 Mo max) | `accroche`, `localisation`, `surface_habitable` · `prix_fai`, `descriptif`, `photo`, `certification` | Suivant → Mettre en ligne |

Chaque site a aussi : `/` (accueil avec le bouton du formulaire), `/annonces` (**Annonces publiées**), `/annonces/<id>` (fiche, avec un bandeau de confirmation après le dépôt), `GET /api/annonces` (JSON), `POST /api/reset` (vide le site entre deux essais).

Titres de fenêtre (lus par le Recorder) : `Portail A - Déposer une annonce`, `Portail B - Nouvelle annonce`, `Portail C - Publier un bien`, `Portail X - Annonces publiées`.
Valeur de `portail` en base : `Portail A`, `Portail B`, `Portail C` (comme dans le contrat §4).

**Photo du site C** : le schéma commun n'a pas de colonne photo. Le fichier est rangé dans le bucket Storage privé `photos-annonces`, sous `<id de l'annonce>/photo.<ext>`. Pour vérifier un essai de niveau 4, il faut une ligne dans `annonces_portails` et un fichier dans `photos-annonces/<id>/`. Le JSON de `GET /api/annonces` du site C donne `photo: true/false` pour chaque annonce. Plan B si l'envoi de fichier bloque l'agent : `PHOTO_ACTIVE=0` sur le projet C (niveau 3), et on le note comme limite.

## Lancer en local (sans attendre la base)
```bash
npm install
npm run dev:a     # http://localhost:3001  (dev:b → 3002, dev:c → 3003)
```
Sans `SUPABASE_URL`, les sites gardent les annonces **en mémoire** (bandeau jaune en haut de page). Avec un `.env.local` (copié de `.env.example`), ils écrivent dans Supabase.

## Mettre en ligne (une fois la base d'Henriquet ouverte)
1. **Supabase** : le schéma `commun/schema-supabase.sql` est déjà passé (Henriquet). Lancer `sql/stockage-photos.sql` dans l'éditeur SQL.
2. **GitHub** : pousser la branche `vladimir/cao`.
3. **Vercel**, à faire 3 fois (projets `ghost-portail-a`, `ghost-portail-b`, `ghost-portail-c`) : *Add New → Project →* choisir le dépôt, **Root Directory = `vladimir-cao/portails`**, Framework = Next.js, puis les variables d'environnement :

   | Variable | A | B | C |
   |---|---|---|---|
   | `PORTAIL` | `A` | `B` | `C` |
   | `SUPABASE_URL` | idem | idem | idem |
   | `SUPABASE_SERVICE_ROLE_KEY` | idem | idem | idem |
   | `RESET_TOKEN` | idem | idem | idem |
   | `PHOTO_ACTIVE` | | | `1` |

   Pour un déploiement depuis une branche : *Settings → Git → Production Branch = `vladimir/cao`* (ou fusionner dans `main`).
4. **Accès public** (indispensable pour le navigateur hébergé de H) : *Settings → Deployment Protection* : l'adresse de production `ghost-portail-x.vercel.app` ne doit pas demander de connexion. Test : l'ouvrir dans une fenêtre privée.

La clé service ne sort jamais du serveur : elle n'a pas de préfixe `NEXT_PUBLIC_`, et seuls les routes `/api` et les pages serveur l'utilisent.

## Vérifier
```bash
# Les 3 sites répondent (vendredi 9h)
node scripts/verifier.mjs https://ghost-portail-a.vercel.app https://ghost-portail-b.vercel.app https://ghost-portail-c.vercel.app
# + dépose le mandat M-0142 sur chacun et contrôle qu'il revient de la base avec les bons champs
node scripts/verifier.mjs --publier https://ghost-portail-a.vercel.app https://ghost-portail-b.vercel.app https://ghost-portail-c.vercel.app
```
Dans Supabase :
```sql
select portail, count(*), max(cree_le) from annonces_portails group by portail order by portail;
```
Critère « terminé mardi » : en plus du script, saisir **une annonce à la main** dans le navigateur sur chaque site, puis voir les 3 lignes dans la requête ci-dessus.

Vider un site avant un essai de l'agent (règle 3 du plan de tests) :
```bash
curl -X POST https://ghost-portail-a.vercel.app/api/reset -H "x-reset-token: $RESET_TOKEN"
```

## Pour le script de test d'Alejandro (§12)
- `reussi` = une ligne existe pour le portail, avec `titre`, `prix`, `surface_m2`, `ville`, `description` **exactement** égaux au mandat donné. Sur C (niveau 4), il faut en plus un fichier dans `photos-annonces/<id>/`.
- Les villes de B et C viennent d'une liste fermée (Antony, Champlan, Chilly-Mazarin, Igny, Longjumeau, Massy, Orsay, Palaiseau, Verrières-le-Buisson, Wissous). Sur C, le libellé affiche le code postal (« Massy (91300) »), mais la valeur enregistrée est « Massy ».
- Sur B, le prix est un champ texte : « 289 000 € » est enregistré 289000.
- En cas d'erreur, le site renvoie une page HTTP 400 titrée « L'annonce n'a pas été publiée », avec la liste `#erreurs`. Après un dépôt réussi, il redirige vers `/annonces/<id>?publiee=1`, où l'on trouve `#confirmation`.
- L'agent doit pouvoir envoyer un fichier image depuis le navigateur hébergé (point ouvert du §5 de la roadmap 06).
