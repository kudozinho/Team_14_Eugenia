# Activation du compte personnel

Compte invité : assel.hub@gmail.com. Configurer GHOST_CLIENT_EMAIL et SUPABASE_ANON_KEY dans Vercel en plus des variables serveur existantes. GHOST_PORTAL_TOKEN ne permet plus de connecter un client ; le compagnon conserve GHOST_DEVICE_TOKEN.

Dans Supabase Auth : activer Email, configurer le modèle Magic Link pour inclure {{ .Token }}, et configurer un expéditeur SMTP autorisé. L’envoi Supabase par défaut est restreint. Conserver les limites de fréquence et d’essais. Le compte est créé au premier envoi autorisé, aucun accès à une autre adresse.

Déployer #61 puis ouvrir /mon-audit → Projet → Recevoir mon code. Assel saisit le code reçu dans sa messagerie. Session en cookie HttpOnly, SameSite strict, Secure en HTTPS, durée maximale une heure ; utilisateur vérifié par Supabase à chaque requête. Tester mauvais code, adresse non invitée, déconnexion et expiration.

Le compte personnel est associé au seul PC de démonstration. Plusieurs clients exigeraient une table de rattachement compte/projet/appareil ; ne pas étendre la liste des adresses vers ce même appareil.

Activation distante et envoi réel non effectués : accès Supabase et Vercel manquants dans cette session.
