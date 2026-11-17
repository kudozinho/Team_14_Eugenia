-- Contrôles pendant et après les sessions jouées (mercredi 18/11). Lecture seule.

-- 1. Combien d'événements, par type, depuis ce matin
select type, count(*) as nb
from evenements
where horodatage >= date_trunc('day', now())
group by type
order by nb desc;

-- 2. Par site ou application : nombre d'événements et temps passé (minutes)
select coalesce(substring(url from '://([^/]+)'), appli, '(hors périmètre)') as ou,
       count(*) as nb, round(sum(coalesce(duree_s, 0)) / 60.0, 1) as minutes
from evenements
where horodatage >= date_trunc('day', now())
group by 1
order by minutes desc;

-- 3. Vérifier le floutage : aucun nom, téléphone ou e-mail en clair (doit renvoyer 0 ligne)
select id, texte_nettoye
from evenements
where horodatage >= date_trunc('day', now())
  and (texte_nettoye ~ '0[1-9]( ?[0-9]{2}){4}' or texte_nettoye ~ '[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}');

-- 4. Annonces publiées aujourd'hui sur les 3 portails
select portail, count(*) as nb, min(cree_le) as premiere, max(cree_le) as derniere
from annonces_portails
where cree_le >= date_trunc('day', now())
group by portail
order by portail;
