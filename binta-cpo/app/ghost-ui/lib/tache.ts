import ficheJson from "@/data/fiche-001.json";

// Identifiant de la tâche pour laquelle on lance l'agent (table taches_detectees).
// Après la purge de ce matin, tache_001 (exemple du kit) est refusé par la base :
// mettre TACHE_ID dans l'environnement (Vercel et .env) avec l'identifiant écrit par Omar.
export function tacheIdConfiguree(): string {
  return process.env.TACHE_ID || ficheJson.tache_id;
}
