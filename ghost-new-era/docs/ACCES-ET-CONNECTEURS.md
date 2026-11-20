# Accès, connexions et connecteurs

**Chaque personne connecte ses propres outils** depuis la plateforme (page « Connexions », proposée juste après le questionnaire). Rien n'est configuré par l'équipe dans l'environnement du service.

## Le parcours
1. Compte, paiement de démonstration, questionnaire.
2. **Connexions** : Notion, Slack, Gmail et comptes de sites (Google, etc.), avec les étapes guidées pour trouver chaque clé. Tout est facultatif. Un accès est **vérifié avant d'être enregistré** (Notion : lecture de la page ; Slack : message de confirmation ; Gmail : ouverture de session sans envoi).
3. **Portail** : l'écran d'accueil coche d'office les accès que la personne a connectés ; elle peut les décocher. Un agent n'utilise un outil que s'il est coché.

## Où sont les accès
Dans le **coffre-fort hébergé par H**, un élément par personne et par outil (nom étiqueté avec le début de l'identifiant de la personne). Les valeurs ne sont jamais conservées par Ghost ; le service ne les relit côté serveur qu'au moment d'un onboarding lancé par la **même personne**. Une personne ne voit et ne retire que ses propres accès.

| Outil | Ce que fait l'agent avec | Ce que la personne fournit |
|---|---|---|
| Notion | Lit la page et y crée la page d'onboarding (Lia) | Secret de l'intégration, lien de la page |
| Slack | Publie le message de bienvenue (Nino) | Adresse du webhook |
| Gmail | Envoie l'e-mail de bienvenue (Nino) | Adresse, mot de passe d'application, destinataire |
| Comptes de sites | Les navigateurs des agents se connectent seuls | Identifiant, mot de passe, clé 2FA (facultatif) |

## Testé, non testé
- Testé : stockage par personne (deux personnes ne voient pas les accès l'une de l'autre), relecture côté serveur, remplacement sans doublon, suppression ; logique « seul ce qui est coché est utilisé » ; lecture d'un lien Notion ; refus d'un webhook invalide.
- **Non testé** : connexion réelle à Notion, Slack, Gmail ; une vraie connexion automatique sur un site ; le rattachement du coffre-fort à une session d'agent.
