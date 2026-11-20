import { createClient } from "@supabase/supabase-js";

// Client SERVEUR avec la clé de service : ne jamais l'importer dans un composant "use client".
// La clé vient uniquement de la variable d'environnement SUPABASE_SERVICE_ROLE_KEY.
export function getAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !cle) return null;
  return createClient(url, cle, { auth: { persistSession: false } });
}
