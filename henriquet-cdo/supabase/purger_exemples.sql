-- À lancer mercredi matin, AVANT les vraies sessions jouées.
-- Retire uniquement les exemples du kit (identifiants evt_00xx, tache_00x, tst_00xx).
-- Garde les profils, l'agence, les postes, les utilisateurs et l'audit de démo.
begin;
delete from executions_agent where tache_id like 'tache_0%';
delete from taches_detectees where id like 'tache_0%';
delete from evenements where id like 'evt_0%';
delete from tests_agent where id like 'tst_0%';
commit;
