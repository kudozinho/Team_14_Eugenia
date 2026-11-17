-- Agence Belvédère (FICTIVE) : généré par henriquet-cdo/donnees/generer_agence.py
begin;

create table if not exists mandats (
  ref text primary key, organisation_id text references organisations(id) on delete cascade,
  type_bien text, titre text not null, ville text, code_postal text, surface_m2 int, pieces int, prix int,
  classe_energie text, honoraires_ttc int, negociateur_id text references utilisateurs(id), demo boolean default false,
  description text, cree_le timestamptz default now());

-- Ce qu'affichent les back-offices des portails, et ce que l'agent H doit relever (vérification par le code)
create table if not exists stats_portails (
  id text primary key default gen_random_uuid()::text, mandat_ref text references mandats(ref) on delete cascade,
  portail text not null, semaine text not null, vues int, contacts int, favoris int,
  unique (mandat_ref, portail, semaine));
alter table mandats enable row level security;
alter table stats_portails enable row level security;

insert into postes (id, organisation_id, intitule, missions, outils, peut_decider, ne_peut_pas) values ('poste_gestionnaire', 'org_belvedere', 'Gestionnaire locatif', '["Suivre les baux et les locataires", "Encaisser et reverser les loyers", "Organiser les états des lieux"]'::jsonb, '["Logiciel de gestion locative", "Messagerie", "Banque en ligne"]'::jsonb, '["Planning des états des lieux"]'::jsonb, '["Signer un bail sans la gérante", "Modifier un loyer"]'::jsonb) on conflict (id) do nothing;

insert into utilisateurs (id, organisation_id, poste_id, nom, role, mode_analyse) values ('usr_gerante', 'org_belvedere', 'poste_gerante', 'Gérante', 'gerant', null) on conflict (id) do nothing;
insert into utilisateurs (id, organisation_id, poste_id, nom, role, mode_analyse) values ('usr_negociateur', 'org_belvedere', 'poste_negociateur', 'Négociateur 1', 'collaborateur', 'vocal') on conflict (id) do nothing;
insert into utilisateurs (id, organisation_id, poste_id, nom, role, mode_analyse) values ('usr_negociateur_2', 'org_belvedere', 'poste_negociateur', 'Négociateur 2', 'collaborateur', null) on conflict (id) do nothing;
insert into utilisateurs (id, organisation_id, poste_id, nom, role, mode_analyse) values ('usr_negociateur_3', 'org_belvedere', 'poste_negociateur', 'Négociateur 3', 'collaborateur', null) on conflict (id) do nothing;
insert into utilisateurs (id, organisation_id, poste_id, nom, role, mode_analyse) values ('usr_negociateur_4', 'org_belvedere', 'poste_negociateur', 'Négociateur 4', 'collaborateur', null) on conflict (id) do nothing;
insert into utilisateurs (id, organisation_id, poste_id, nom, role, mode_analyse) values ('usr_negociateur_5', 'org_belvedere', 'poste_negociateur', 'Négociateur 5', 'collaborateur', null) on conflict (id) do nothing;
insert into utilisateurs (id, organisation_id, poste_id, nom, role, mode_analyse) values ('usr_negociateur_6', 'org_belvedere', 'poste_negociateur', 'Négociateur 6', 'collaborateur', null) on conflict (id) do nothing;
insert into utilisateurs (id, organisation_id, poste_id, nom, role, mode_analyse) values ('usr_assistante', 'org_belvedere', 'poste_assistante', 'Assistante 1', 'collaborateur', 'ecran') on conflict (id) do nothing;
insert into utilisateurs (id, organisation_id, poste_id, nom, role, mode_analyse) values ('usr_assistante_2', 'org_belvedere', 'poste_assistante', 'Assistante 2', 'collaborateur', null) on conflict (id) do nothing;
insert into utilisateurs (id, organisation_id, poste_id, nom, role, mode_analyse) values ('usr_gestionnaire', 'org_belvedere', 'poste_gestionnaire', 'Gestionnaire locatif', 'collaborateur', null) on conflict (id) do nothing;

insert into mandats (ref, organisation_id, type_bien, titre, ville, code_postal, surface_m2, pieces, prix, classe_energie, honoraires_ttc, negociateur_id, demo, description) values ('M-0142', 'org_belvedere', 'Appartement', 'Appartement T3 lumineux proche RER', 'Massy', '91300', 68, 3, 329000, 'C', 14800, 'usr_negociateur', true, 'T3 au 2e étage avec ascenseur, séjour sur balcon exposé sud. Deux chambres, cuisine séparée, cave. À 6 minutes à pied du RER B Massy-Palaiseau.') on conflict (ref) do nothing;
insert into mandats (ref, organisation_id, type_bien, titre, ville, code_postal, surface_m2, pieces, prix, classe_energie, honoraires_ttc, negociateur_id, demo, description) values ('M-0143', 'org_belvedere', 'Maison', 'Maison familiale avec jardin', 'Palaiseau', '91120', 120, 5, 615000, 'D', 24600, 'usr_negociateur_2', true, 'Maison de 1975 rénovée, 4 chambres dont une au rez-de-chaussée, jardin de 400 m2. Garage et atelier. Écoles et marché à pied.') on conflict (ref) do nothing;
insert into mandats (ref, organisation_id, type_bien, titre, ville, code_postal, surface_m2, pieces, prix, classe_energie, honoraires_ttc, negociateur_id, demo, description) values ('M-0144', 'org_belvedere', 'Appartement', 'Studio étudiant proche université', 'Orsay', '91400', 24, 1, 139000, 'E', 7000, 'usr_negociateur_3', true, 'Studio meublé au 1er étage, kitchenette équipée, salle d''eau. Idéal investissement locatif, à 10 minutes du campus en bus.') on conflict (ref) do nothing;
insert into mandats (ref, organisation_id, type_bien, titre, ville, code_postal, surface_m2, pieces, prix, classe_energie, honoraires_ttc, negociateur_id, demo, description) values ('M-0145', 'org_belvedere', 'Appartement', 'T2 avec terrasse en résidence récente', 'Massy', '91300', 45, 2, 238000, 'B', 10700, 'usr_negociateur', false, 'T2 de 2019 avec terrasse de 12 m2, parking en sous-sol. Quartier Atlantis, commerces au pied de l''immeuble.') on conflict (ref) do nothing;
insert into mandats (ref, organisation_id, type_bien, titre, ville, code_postal, surface_m2, pieces, prix, classe_energie, honoraires_ttc, negociateur_id, demo, description) values ('M-0146', 'org_belvedere', 'Maison', 'Pavillon 4 pièces au calme', 'Igny', '91430', 92, 4, 459000, 'D', 18400, 'usr_negociateur_4', false, 'Pavillon sur sous-sol total, 3 chambres, jardin clos de 350 m2. Rue calme, gare de RER C à 12 minutes à pied.') on conflict (ref) do nothing;
insert into mandats (ref, organisation_id, type_bien, titre, ville, code_postal, surface_m2, pieces, prix, classe_energie, honoraires_ttc, negociateur_id, demo, description) values ('M-0147', 'org_belvedere', 'Appartement', 'T4 traversant avec double séjour', 'Gif-sur-Yvette', '91190', 86, 4, 372000, 'C', 16700, 'usr_negociateur_5', false, 'T4 traversant au 3e et dernier étage, double séjour, 2 chambres, balcon. Résidence arborée, proche RER B.') on conflict (ref) do nothing;
insert into mandats (ref, organisation_id, type_bien, titre, ville, code_postal, surface_m2, pieces, prix, classe_energie, honoraires_ttc, negociateur_id, demo, description) values ('M-0148', 'org_belvedere', 'Appartement', 'T3 refait à neuf avec parking', 'Longjumeau', '91160', 63, 3, 219000, 'D', 9900, 'usr_negociateur_6', false, 'T3 entièrement rénové en 2025, cuisine ouverte équipée, 2 chambres, place de parking. Centre-ville à pied.') on conflict (ref) do nothing;
insert into mandats (ref, organisation_id, type_bien, titre, ville, code_postal, surface_m2, pieces, prix, classe_energie, honoraires_ttc, negociateur_id, demo, description) values ('M-0149', 'org_belvedere', 'Maison', 'Maison de ville avec cour', 'Juvisy-sur-Orge', '91260', 78, 4, 335000, 'E', 15100, 'usr_negociateur_2', false, 'Maison de ville sur 2 niveaux, 3 chambres, petite cour pavée. Gare RER C et D à 8 minutes.') on conflict (ref) do nothing;
insert into mandats (ref, organisation_id, type_bien, titre, ville, code_postal, surface_m2, pieces, prix, classe_energie, honoraires_ttc, negociateur_id, demo, description) values ('M-0150', 'org_belvedere', 'Appartement', 'Grand T2 avec balcon', 'Les Ulis', '91940', 52, 2, 132000, 'D', 6600, 'usr_negociateur_3', false, 'Grand T2 au 4e étage avec ascenseur, balcon, cave. Copropriété entretenue, proche centre commercial.') on conflict (ref) do nothing;
insert into mandats (ref, organisation_id, type_bien, titre, ville, code_postal, surface_m2, pieces, prix, classe_energie, honoraires_ttc, negociateur_id, demo, description) values ('M-0151', 'org_belvedere', 'Appartement', 'T3 avec vue dégagée', 'Évry-Courcouronnes', '91000', 66, 3, 159000, 'D', 8000, 'usr_negociateur_4', false, 'T3 au 7e étage, vue dégagée, 2 chambres, séjour avec balcon. Gare RER D et université à proximité.') on conflict (ref) do nothing;

insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0142', 'Portail A', '2026-S46', 242, 7, 10) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0142', 'Portail B', '2026-S46', 133, 2, 7) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0142', 'Portail C', '2026-S46', 82, 1, 4) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0142', 'Portail A', '2026-S47', 171, 5, 9) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0142', 'Portail B', '2026-S47', 101, 3, 4) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0142', 'Portail C', '2026-S47', 58, 1, 2) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0143', 'Portail A', '2026-S46', 186, 5, 8) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0143', 'Portail B', '2026-S46', 112, 3, 7) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0143', 'Portail C', '2026-S46', 66, 2, 3) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0143', 'Portail A', '2026-S47', 208, 6, 13) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0143', 'Portail B', '2026-S47', 122, 3, 5) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0143', 'Portail C', '2026-S47', 68, 2, 4) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0144', 'Portail A', '2026-S46', 413, 12, 23) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0144', 'Portail B', '2026-S46', 242, 7, 12) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0144', 'Portail C', '2026-S46', 145, 2, 5) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0144', 'Portail A', '2026-S47', 389, 6, 16) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0144', 'Portail B', '2026-S47', 217, 5, 10) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0144', 'Portail C', '2026-S47', 139, 2, 6) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0145', 'Portail A', '2026-S46', 295, 5, 11) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0145', 'Portail B', '2026-S46', 212, 3, 12) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0145', 'Portail C', '2026-S46', 106, 3, 6) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0145', 'Portail A', '2026-S47', 341, 8, 18) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0145', 'Portail B', '2026-S47', 156, 3, 6) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0145', 'Portail C', '2026-S47', 104, 3, 7) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0146', 'Portail A', '2026-S46', 179, 5, 9) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0146', 'Portail B', '2026-S46', 89, 2, 4) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0146', 'Portail C', '2026-S46', 68, 2, 4) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0146', 'Portail A', '2026-S47', 173, 5, 7) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0146', 'Portail B', '2026-S47', 106, 2, 6) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0146', 'Portail C', '2026-S47', 59, 1, 4) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0147', 'Portail A', '2026-S46', 274, 5, 19) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0147', 'Portail B', '2026-S46', 150, 4, 8) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0147', 'Portail C', '2026-S46', 80, 2, 3) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0147', 'Portail A', '2026-S47', 366, 10, 24) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0147', 'Portail B', '2026-S47', 188, 4, 8) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0147', 'Portail C', '2026-S47', 128, 2, 5) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0148', 'Portail A', '2026-S46', 539, 13, 37) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0148', 'Portail B', '2026-S46', 298, 8, 14) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0148', 'Portail C', '2026-S46', 193, 3, 9) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0148', 'Portail A', '2026-S47', 542, 11, 31) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0148', 'Portail B', '2026-S47', 341, 7, 13) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0148', 'Portail C', '2026-S47', 149, 4, 7) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0149', 'Portail A', '2026-S46', 248, 4, 10) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0149', 'Portail B', '2026-S46', 136, 2, 9) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0149', 'Portail C', '2026-S46', 79, 1, 5) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0149', 'Portail A', '2026-S47', 212, 5, 12) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0149', 'Portail B', '2026-S47', 154, 4, 7) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0149', 'Portail C', '2026-S47', 79, 2, 4) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0150', 'Portail A', '2026-S46', 377, 7, 22) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0150', 'Portail B', '2026-S46', 241, 6, 12) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0150', 'Portail C', '2026-S46', 157, 3, 8) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0150', 'Portail A', '2026-S47', 441, 7, 24) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0150', 'Portail B', '2026-S47', 249, 7, 10) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0150', 'Portail C', '2026-S47', 183, 4, 7) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0151', 'Portail A', '2026-S46', 381, 8, 21) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0151', 'Portail B', '2026-S46', 208, 6, 8) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0151', 'Portail C', '2026-S46', 137, 2, 7) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0151', 'Portail A', '2026-S47', 250, 6, 17) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0151', 'Portail B', '2026-S47', 159, 3, 8) on conflict (mandat_ref, portail, semaine) do nothing;
insert into stats_portails (mandat_ref, portail, semaine, vues, contacts, favoris) values ('M-0151', 'Portail C', '2026-S47', 101, 2, 4) on conflict (mandat_ref, portail, semaine) do nothing;

commit;
