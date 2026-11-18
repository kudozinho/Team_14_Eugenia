-- Requêtes de contrôle à montrer EN DIRECT au jury (Supabase, SQL Editor).
-- Lecture seule : elles ne modifient rien. À lancer une par une.
-- Une annonce est reliée à son mandat par la ville, puis le prix OU la surface (la table annonces_portails n'a pas de
-- référence de mandat ; la surface rattrape une annonce dont le prix aurait été mal saisi, et inversement).


-- 1. « Qu'est-ce qui vient d'arriver ? » Les 10 dernières annonces reçues par les 3 sites
select
  to_char(cree_le at time zone 'Europe/Paris', 'HH24:MI:SS') as "Reçue à",
  portail                                                    as "Site",
  titre                                                      as "Titre",
  ville                                                      as "Ville",
  trim(to_char(prix, 'FM999 999 999')) || ' €'                     as "Prix",
  surface_m2 || ' m²'                                        as "Surface"
from annonces_portails
order by cree_le desc
limit 10;


-- 2. « Chaque bien est-il sur les 3 sites ? » Un tableau mandat par mandat, aujourd'hui
with mandats_demo(ref, bien, ville, prix, surface, attendu) as (values
  ('M-0142', 'T3 lumineux proche RER',        'Massy',      329000, 68,  'publie'),
  ('M-0143', 'Maison familiale avec jardin',  'Palaiseau',  615000, 120, 'publie'),
  ('M-0144', 'Studio étudiant',               'Orsay',      139000, 24,  'publie'),
  ('M-0145', 'T2 avec terrasse',              'Massy',      238000, 45,  'publie'),
  ('M-0146', 'Pavillon 4 pièces',             'Igny',       459000, 92,  'publie'),
  ('M-0148', 'T3 refait à neuf',              'Longjumeau', 219000, 63,  'publie'),
  ('M-T01',  'PIÈGE : classe énergie absente', 'Massy',     235000, 48,  'signale'),
  ('M-T02',  'PIÈGE : 680 m² à 329 000 €',    'Palaiseau',  329000, 680, 'signale')
),
du_jour as (
  select * from annonces_portails
  where (cree_le at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date
)
select
  m.ref  as "Mandat",
  m.bien as "Bien",
  case when bool_or(a.portail ilike '%A') then '✅' else '·' end as "Site A",
  case when bool_or(a.portail ilike '%B') then '✅' else '·' end as "Site B",
  case when bool_or(a.portail ilike '%C') then '✅' else '·' end as "Site C",
  case
    when m.attendu = 'signale' and count(a.id) = 0 then 'OK : refusé, publié nulle part'
    when m.attendu = 'signale'                     then '⚠ PIÈGE PUBLIÉ'
    when count(distinct a.portail) = 3             then 'OK : sur les 3 sites'
    when count(a.id) = 0                           then 'pas encore publié'
    else 'incomplet (' || count(distinct a.portail) || ' site(s) sur 3)'
  end as "Verdict"
from mandats_demo m
left join du_jour a on a.ville = m.ville and (a.prix = m.prix or a.surface_m2 = m.surface)
group by m.ref, m.bien, m.attendu
order by m.ref;


-- 3. « Combien de temps l'humain a-t-il mis ? » Écart entre la 1re et la dernière publication d'un même bien, aujourd'hui
select
  ville                                                          as "Ville",
  trim(to_char(prix, 'FM999 999 999')) || ' €'                         as "Prix",
  count(distinct portail)                                        as "Sites",
  to_char(min(cree_le) at time zone 'Europe/Paris', 'HH24:MI:SS') as "1re publication",
  to_char(max(cree_le) at time zone 'Europe/Paris', 'HH24:MI:SS') as "Dernière",
  to_char(max(cree_le) - min(cree_le), 'MI "min" SS "s"')        as "Écart entre le site A et le dernier"
from annonces_portails
where (cree_le at time zone 'Europe/Paris')::date = (now() at time zone 'Europe/Paris')::date
group by ville, prix
order by min(cree_le);
