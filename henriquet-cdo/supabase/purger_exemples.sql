-- À lancer mercredi matin, AVANT les vraies sessions jouées.
-- Retire uniquement les exemples du kit : identifiants courts evt_0001, evt_0005b, tache_001, tst_0001.
-- Les vrais événements du Recorder (evt_ + 12 caractères) et les vraies tâches ne sont pas touchés :
-- on filtre sur la forme exacte des identifiants d'exemple, pas sur un simple préfixe.
-- Garde les profils, l'agence, les postes, les utilisateurs et l'audit de démo.
begin;
delete from executions_agent where tache_id ~ '^tache_[0-9]{3}$';
delete from taches_detectees where id ~ '^tache_[0-9]{3}$';
delete from evenements where id ~ '^evt_[0-9]{4}[a-z]?$';
delete from tests_agent where id ~ '^tst_[0-9]{4}$';
commit;
