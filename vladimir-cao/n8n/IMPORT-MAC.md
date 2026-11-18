# Importer l'alerte J2 sur un autre n8n (Mac) : 15 minutes

> ⚠️ **Un seul n8n actif à la fois sur la base.** Si deux n8n ont `alerte_j2` activé, chaque tâche part en **deux** e-mails. Jusqu'aux passages de 17h15-18h, l'alerte tourne sur le PC de Vladimir. Sur le Mac, on importe et on teste **sans activer**. On n'active le Mac que si l'on décide de basculer, et Vladimir désactive alors son n8n.

## 1. Lancer n8n (2 min)
```bash
node -v        # il faut v24 ou plus (sinon : https://nodejs.org, version « LTS »)
npx n8n        # puis ouvrir http://localhost:5678 et créer le compte local
```
Laisser le terminal ouvert (si on le ferme, n8n s'arrête).

## 2. Importer le workflow (1 min)
1. Télécharger le fichier : https://raw.githubusercontent.com/kudozinho/Team_14_Eugenia/main/vladimir-cao/n8n/alerte_j2.json (clic droit → « Enregistrer sous… »).
2. Dans n8n : **Workflows → Add workflow → … (en haut à droite) → Import from File** → choisir `alerte_j2.json`.

## 3. Créer les 2 connexions (5 min)
Les connexions ne voyagent pas avec le fichier : on les recrée sur le Mac. Les clés se collent **dans n8n uniquement**, jamais dans un message de groupe ni sur GitHub.

| Nœud | Connexion à créer | Valeurs |
|---|---|---|
| « Lire les tâches détectées » | **Supabase API** | Host : `https://bvxmnrvqehemqsjiasdr.supabase.co` · Service Role Secret : la clé service (à demander **en privé** à Henriquet) |
| « Envoyer l'e-mail » | **SMTP** | User : l'adresse Gmail qui envoie · Password : un **mot de passe d'application** Google (https://myaccount.google.com/apppasswords, validation en 2 étapes requise) · Host : `smtp.gmail.com` · Port : `465` · SSL/TLS : activé |

Ouvrir chaque nœud → *Credential* → **Create new** → remplir → **Save**.

## 4. Mettre les adresses (1 min)
Ouvrir le nœud **« Préparer les alertes »** et remplacer, tout en haut :
```js
const DESTINATAIRE = 'ADRESSE_DE_DEMO@exemple.fr';      // boîte qui reçoit l'alerte pendant la démo
const EXPEDITEUR = 'Ghost <ADRESSE_GMAIL@gmail.com>';   // la même adresse que la connexion SMTP
```
Puis **Save** (en haut à droite). Ne pas activer (voir l'avertissement en haut).

## 5. Tester sans activer (2 min)
1. Ouvrir le nœud **« Tester (dernière tâche) »** → onglet **Test URL** → **Listen for test event**.
2. Dans un terminal :
   ```bash
   curl -X POST http://localhost:5678/webhook-test/alerte-j2-test
   ```
3. Résultat attendu : tous les nœuds passent au vert, et l'e-mail « Ghost : tu fais « Recopier une annonce sur 3 sites sans passerelle » à la main… » arrive dans la boîte du destinataire.

## Si ça bloque
| Symptôme | Cause | Solution |
|---|---|---|
| `Invalid login` / `535` sur « Envoyer l'e-mail » | Mot de passe Gmail normal au lieu d'un mot de passe d'application | Créer un mot de passe d'application (étape 3) |
| `self-signed certificate in certificate chain` | Antivirus qui analyse les e-mails | Désactiver l'analyse des e-mails sortants (durée « Définitivement ») ; ne pas cocher « ignorer SSL » |
| `401` sur « Lire les tâches détectées » | Mauvaise clé Supabase (clé publique au lieu de la clé service) | Reprendre la clé service auprès d'Henriquet |
| Aucun e-mail, tous les nœuds verts | Aucune tâche dans `taches_detectees` | Normal : il faut au moins une tâche détectée en base |
| `node: command not found` ou version < 24 | Node.js absent ou trop ancien | Installer la version LTS depuis https://nodejs.org |

## Basculer l'envoi sur le Mac (seulement si décidé)
1. Vladimir désactive `alerte_j2` sur son n8n (interrupteur *Active* en haut à droite).
2. Sur le Mac : interrupteur **Active** → activé. Les tâches créées **après** l'activation déclenchent l'alerte en moins d'une minute.
3. Test de démo, workflow actif : `curl -X POST http://localhost:5678/webhook/alerte-j2-test` (sans `-test` dans l'adresse).
