# Workflows n8n (chantier C, Vladimir)

## `alerte_j2` : « tu fais X à la main, on peut l'automatiser »
Dès qu'une tâche apparaît dans `taches_detectees` (contrat §2), le salarié reçoit un e-mail qui la décrit : nombre de fois, minutes par semaine, outil proposé (agent H / n8n / outil existant) et gain estimé. Les tâches dont la méthode est `rien` ne déclenchent pas d'alerte. Le message ne contient que la tâche : ni capture, ni texte de l'écran, ni nom.

```
Toutes les minutes ──► Mode automatique ─┐                                                                          ┌─ succès ─► Mémoriser les envois
                                         ├─► Lire les tâches détectées ─► Préparer les alertes ─► Envoyer l'e-mail ─┤
POST /webhook/alerte-j2-test ─► Mode test┘                                                                          └─ échec ──► (retenté au prochain passage)
```
- **Mode automatique** : il lit au plus 100 tâches créées depuis le dernier passage. La date est gardée dans la mémoire du workflow. Au premier passage après l'activation, il part de « maintenant », pour ne pas renvoyer d'anciennes alertes.
- **Aucune alerte perdue** : une tâche n'est notée comme traitée qu'**après** un envoi réussi. Si l'envoi échoue (réseau, antivirus, mot de passe), la mémoire n'avance pas et l'alerte repart au passage suivant.
- **Pas de doublon** : une seule alerte par type de tâche (même nom) et par audit. La détection peut donc réécrire une tâche sous un autre identifiant sans renvoyer d'e-mail.
- **Valeurs inconnues** : si le gain ou le temps par semaine n'est pas encore connu (la détection laisse `gain_estime_h_semaine` vide tant que l'agent H n'a pas mesuré le gain), la ligne n'est pas affichée. Jamais de « ? ».
- **Mode test** (démo) : `POST http://localhost:5678/webhook/alerte-j2-test` renvoie l'alerte de la dernière tâche détectée, sans toucher à la mémoire.
- Il interroge la base au lieu d'attendre un webhook de Supabase : un n8n local n'est pas joignable depuis Internet.

### Installer
1. n8n : `npx n8n`, puis http://localhost:5678.
2. Identifiants (*Credentials*) :
   - **Supabase API** : Host `https://bvxmnrvqehemqsjiasdr.supabase.co`, Service Role Secret = clé service (en privé, jamais dans le dépôt) ;
   - **SMTP** : `smtp.gmail.com`, port 465, SSL activé, utilisateur = adresse Gmail, mot de passe = **mot de passe d'application** Google (https://myaccount.google.com/apppasswords, validation en 2 étapes requise).
3. *Import from File* → `alerte_j2.json`, puis rattacher les deux identifiants aux nœuds « Lire les tâches détectées » et « Envoyer l'e-mail ».
4. Dans « Préparer les alertes », remplacer `DESTINATAIRE` et `EXPEDITEUR` (adresses d'exemple dans le dépôt) et, si besoin, `LIEN_RAPPORT`.
5. Activer le workflow.

`alerte_j2.json` est généré par `node construire_alerte_j2.mjs`. Modifier le générateur, puis relancer la commande.

### Vérifier
- Test : `curl -X POST http://localhost:5678/webhook/alerte-j2-test`. La réponse contient `"accepted": ["<destinataire>"]` et l'e-mail arrive.
- Bout en bout : insérer une tâche dans `taches_detectees`. En moins d'une minute, une exécution « trigger » envoie l'e-mail. Testé le 17/11 (lignes de test supprimées ensuite) :
  - tâche avec gain inconnu → 1 e-mail, sans « ? » ;
  - envoi bloqué par l'antivirus → alerte non perdue, partie seule au premier passage après le déblocage ;
  - même tâche réécrite sous un autre identifiant → aucun e-mail en double.

### Problèmes connus
- **Antivirus qui analyse les e-mails** (Norton « Web/Mail Shield », par exemple) : l'envoi échoue avec `self-signed certificate in certificate chain`, car Norton présente un certificat « Untrusted Root ». Ne pas cocher « ignorer les erreurs SSL ». Désactiver plutôt l'analyse des e-mails sortants dans l'antivirus du PC qui fait tourner n8n, en choisissant la durée **« Définitivement »**. Avec une durée limitée, Norton se réactive tout seul, ce qui nous est arrivé le 17/11.
- Le PC de démo doit garder n8n lancé (terminal ouvert) pour que l'alerte parte.
