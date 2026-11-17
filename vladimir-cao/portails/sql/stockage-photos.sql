-- À lancer une fois dans l'éditeur SQL de Supabase, APRÈS commun/schema-supabase.sql.
-- Ne modifie pas le schéma commun : ajoute seulement un « bucket » de stockage pour les photos du site C.
-- Le bucket est privé : seuls les sites (clé service, côté serveur) lisent et écrivent.
-- Chaque photo est rangée sous <id de l'annonce>/photo.<ext>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos-annonces', 'photos-annonces', false, 4194304, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Vérification : doit renvoyer 1 ligne
select id, public, file_size_limit from storage.buckets where id = 'photos-annonces';

-- Vérifier qu'une annonce est arrivée depuis chaque site :
-- select portail, count(*), max(cree_le) from annonces_portails group by portail order by portail;
