-- GHOST New Era : données minimales d'Atelier Nova (100 % fictives)
-- Léa Martin : onboarding complet (modèle). Karim Benali : rien de fait, manager vide volontairement.
-- Relançable : chaque insert ignore les lignes déjà présentes.

-- ===== Personnes (13) =====
insert into public.personnes (id, prenom, nom, poste, equipe, manager_id, date_arrivee, statut) values
 ('marc-girard',    'Marc',   'Girard',   'Directeur général',          'Direction', null,            '2019-03-04', 'en_poste'),
 ('nadia-rousseau', 'Nadia',  'Rousseau', 'Responsable RH',             'RH',        'marc-girard',   '2020-01-06', 'en_poste'),
 ('sophie-durand',  'Sophie', 'Durand',   'Office manager',             'RH',        'nadia-rousseau','2021-09-01', 'en_poste'),
 ('thomas-leroy',   'Thomas', 'Leroy',    'Responsable technique',      'Tech',      'marc-girard',   '2019-06-03', 'en_poste'),
 ('ines-moreau',    'Inès',   'Moreau',   'Développeuse senior',        'Tech',      'thomas-leroy',  '2021-02-01', 'en_poste'),
 ('hugo-petit',     'Hugo',   'Petit',    'Développeur',                'Tech',      'thomas-leroy',  '2023-04-03', 'en_poste'),
 ('antoine-dubois', 'Antoine','Dubois',   'Ingénieur support',          'Tech',      'thomas-leroy',  '2022-10-03', 'en_poste'),
 ('lea-martin',     'Léa',    'Martin',   'Développeuse',               'Tech',      'thomas-leroy',  '2026-11-16', 'en_poste'),
 ('claire-fontaine','Claire', 'Fontaine', 'Directrice commerciale',     'Ventes',    'marc-girard',   '2020-05-04', 'en_poste'),
 ('julien-garnier', 'Julien', 'Garnier',  'Commercial senior',          'Ventes',    'claire-fontaine','2021-11-02','en_poste'),
 ('sarah-lambert',  'Sarah',  'Lambert',  'Commerciale',                'Ventes',    'claire-fontaine','2023-09-04','en_poste'),
 ('emma-bernard',   'Emma',   'Bernard',  'Chargée de comptes',         'Ventes',    'claire-fontaine','2024-01-08','en_poste'),
 ('karim-benali',   'Karim',  'Benali',   'Commercial',                 'Ventes',    null,            '2026-11-23', 'arrivee_prevue')
on conflict (id) do nothing;

insert into public.arrivees (id, personne_id, statut, cree_le) values
 ('arrivee-lea',   'lea-martin',   'terminee', '2026-11-09 09:00+01'),
 ('arrivee-karim', 'karim-benali', 'nouvelle', '2026-11-20 08:30+01')
on conflict (id) do nothing;

-- ===== Catalogue d'accès par poste =====
insert into public.catalogue_acces (poste, outil, niveau) values
 ('Développeuse', 'Dépôt de code',    'écriture'),
 ('Développeuse', 'VPN',              'standard'),
 ('Développeuse', 'Suivi de tickets', 'contributeur'),
 ('Développeur',  'Dépôt de code',    'écriture'),
 ('Développeur',  'VPN',              'standard'),
 ('Développeur',  'Suivi de tickets', 'contributeur'),
 ('Commercial',   'CRM',              'commercial'),
 ('Commercial',   'Devis',            'création'),
 ('Commercial',   'Agenda partagé',   'équipe'),
 ('Commerciale',  'CRM',              'commercial'),
 ('Commerciale',  'Devis',            'création'),
 ('Commerciale',  'Agenda partagé',   'équipe')
on conflict do nothing;

-- ===== Léa : tout est fait =====
insert into public.rh_fiches (personne_id, poste, equipe, manager_id, date_arrivee, statut_fiche) values
 ('lea-martin',   'Développeuse', 'Tech',   'thomas-leroy', '2026-11-16', 'creee'),
 ('karim-benali', 'Commercial',   'Ventes', null,           '2026-11-23', 'vide')
on conflict (personne_id) do nothing;

insert into public.rh_acces (personne_id, outil, niveau, statut) values
 ('lea-martin', 'Dépôt de code',    'écriture',     'accorde'),
 ('lea-martin', 'VPN',              'standard',     'accorde'),
 ('lea-martin', 'Suivi de tickets', 'contributeur', 'accorde')
on conflict do nothing;

insert into public.rh_badges (personne_id, zones, statut) values
 ('lea-martin',   '{"Accueil","Plateau Tech","Cafétéria"}', 'pret'),
 ('karim-benali', '{}',                                     'a_demander')
on conflict (personne_id) do nothing;

insert into public.rh_materiel (id, personne_id, article, statut) values
 ('materiel-lea-1', 'lea-martin', 'Ordinateur portable développeur', 'valide')
on conflict (id) do nothing;

-- ===== Messagerie : 6 canaux =====
insert into public.msg_canaux (id, nom, description) values
 ('general', '# général', 'Annonces de toute l''entreprise'),
 ('tech',    '# tech',    'Équipe technique'),
 ('ventes',  '# ventes',  'Équipe commerciale'),
 ('rh',      '# rh',      'Ressources humaines et vie de bureau'),
 ('accueil', '# accueil', 'Les nouvelles arrivées'),
 ('cafe',    '# café',    'Cafés d''accueil et pauses')
on conflict (id) do nothing;

insert into public.msg_messages (id, canal_id, auteur, texte, cree_le) values
 ('msg-1', 'general', 'Marc Girard',     'Bonne semaine à tous ! Point mensuel jeudi à 10 h.', '2026-11-16 09:02+01'),
 ('msg-2', 'tech',    'Sophie Durand',   'Bienvenue à Léa, notre nouvelle développeuse, qui rejoint l''équipe Tech aujourd''hui !', '2026-11-16 09:15+01'),
 ('msg-3', 'accueil', 'Sophie Durand',   'Léa Martin arrive lundi 16/11 dans l''équipe Tech. Son parrain : Inès. Faites-lui bon accueil !', '2026-11-13 16:40+01'),
 ('msg-4', 'ventes',  'Claire Fontaine', 'Réunion pipeline vendredi 11 h.', '2026-11-17 18:05+01'),
 ('msg-5', 'cafe',    'Sophie Durand',   'Café d''accueil de Léa mardi 17/11 à 10 h, salle Atelier.', '2026-11-16 11:30+01'),
 ('msg-6', 'rh',      'Nadia Rousseau',  'Rappel : mettez à jour vos congés de fin d''année avant le 30/11.', '2026-11-18 14:20+01')
on conflict (id) do nothing;

insert into public.msg_demandes (id, type, personne_id, destinataire_id, statut, creneau) values
 ('dem-lea-parrain', 'parrain', 'lea-martin', 'ines-moreau',  'acceptee', null),
 ('dem-lea-cafe',    'cafe',    'lea-martin', 'thomas-leroy', 'acceptee', '2026-11-17 10:00+01')
on conflict (id) do nothing;

-- ===== Wiki : 15 pages + Bienvenue Léa =====
insert into public.wiki_pages (id, titre, espace, role_cible, tags, contenu, cree_par) values
 ('wiki-c1', 'Playbook de vente',            'Ventes', 'Commercial',   '{"vente","méthode"}',     'Les 5 étapes d''un cycle de vente chez Atelier Nova : découverte, démo, proposition, négociation, signature. Durée moyenne fictive : 6 semaines.', 'Claire Fontaine'),
 ('wiki-c2', 'Grille de prix (fictive)',     'Ventes', 'Commercial',   '{"prix","offres"}',       'Offre Essentiel : 490 € par mois. Offre Pro : 990 € par mois. Remise maximale sans validation : 10 %.', 'Claire Fontaine'),
 ('wiki-c3', 'Charte client',                'Ventes', 'Commercial',   '{"client","qualité"}',    'Réponse à un client sous 24 h ouvrées. Toujours confirmer un rendez-vous par écrit.', 'Claire Fontaine'),
 ('wiki-c4', 'Process devis',                'Ventes', 'Commercial',   '{"devis","process"}',     'Créer le devis dans l''outil Devis, le faire valider par Claire au-delà de 10 000 €, l''envoyer depuis le CRM.', 'Julien Garnier'),
 ('wiki-c5', 'Guide du CRM',                 'Ventes', 'Commercial',   '{"crm","outil"}',         'Chaque contact a un propriétaire, une étape et une prochaine action datée. Pas de contact sans prochaine action.', 'Julien Garnier'),
 ('wiki-d1', 'Installer son poste développeur','Tech',  'Développeuse', '{"poste","installation"}','Cloner le dépôt, installer les dépendances, lancer les tests. Demander l''accès VPN avant le jour 1.', 'Thomas Leroy'),
 ('wiki-d2', 'Règles de revue de code',      'Tech',   'Développeuse', '{"code","revue"}',        'Toute modification passe par une demande de fusion relue par un pair. Pas de fusion le vendredi après 16 h.', 'Inès Moreau'),
 ('wiki-d3', 'Architecture du produit',      'Tech',   'Développeuse', '{"architecture"}',        'Un site web, une API et une base de données. Schéma détaillé dans le dépôt.', 'Thomas Leroy'),
 ('wiki-d4', 'Process de mise en production','Tech',   'Développeuse', '{"production","process"}','Mise en production le mardi et le jeudi, après validation des tests automatiques.', 'Thomas Leroy'),
 ('wiki-d5', 'Astreinte et support',         'Tech',   'Développeuse', '{"support","astreinte"}', 'Une semaine d''astreinte par trimestre, à partir du 3e mois. Antoine forme les nouveaux.', 'Antoine Dubois'),
 ('wiki-t1', 'Livret d''accueil Atelier Nova','Général','Tous',        '{"accueil"}',             'Nos valeurs, nos horaires (9 h 30 à 18 h), nos locaux et qui fait quoi.', 'Sophie Durand'),
 ('wiki-t2', 'Congés et absences',           'RH',     'Tous',         '{"rh","congés"}',         'Poser ses congés dans l''espace RH au moins 2 semaines avant.', 'Nadia Rousseau'),
 ('wiki-t3', 'Notes de frais',               'RH',     'Tous',         '{"rh","frais"}',          'Déclarer ses frais avant le 5 du mois suivant, avec le justificatif.', 'Nadia Rousseau'),
 ('wiki-t4', 'Sécurité informatique',        'Général','Tous',         '{"sécurité"}',            'Mot de passe unique, double authentification obligatoire, verrouiller son poste.', 'Thomas Leroy'),
 ('wiki-t5', 'Vie de bureau',                'Général','Tous',         '{"bureau"}',              'Café le mardi à 10 h, salle Atelier. Déjeuner d''équipe le premier jeudi du mois.', 'Sophie Durand'),
 ('wiki-lea','Bienvenue Léa',                'Accueil','Développeuse', '{"accueil","onboarding"}','Bienvenue Léa ! Ton parrain : Inès. À lire en premier : Installer son poste développeur, Règles de revue de code, Livret d''accueil.', 'Sophie Durand')
on conflict (id) do nothing;

insert into public.wiki_checklists (id, personne_id, periode, libelle, coche) values
 ('chk-lea-1', 'lea-martin', 'jour1',    'Récupérer son badge et son ordinateur',      true),
 ('chk-lea-2', 'lea-martin', 'jour1',    'Installer son poste développeur',            true),
 ('chk-lea-3', 'lea-martin', 'semaine1', 'Première revue de code avec Inès',           true),
 ('chk-lea-4', 'lea-martin', 'semaine1', 'Café d''accueil avec l''équipe',             true),
 ('chk-lea-5', 'lea-martin', 'mois1',    'Première mise en production',                false),
 ('chk-lea-6', 'lea-martin', 'mois1',    'Point d''étape avec Thomas',                 false)
on conflict (id) do nothing;
