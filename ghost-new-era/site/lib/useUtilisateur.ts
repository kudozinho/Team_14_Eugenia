"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase";

// Renvoie l'utilisateur connecté, ou redirige vers /connexion.
export function useUtilisateur() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  useEffect(() => {
    getSupabase().auth.getUser().then(({ data }) => {
      if (!data.user) router.replace("/connexion");
      else setUser(data.user);
    });
  }, [router]);
  return user;
}
