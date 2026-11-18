"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Indique d'où viennent les données et recharge la page toutes les 15 s quand elles viennent de la base :
// dès qu'une nouvelle tâche est détectée, elle apparaît toute seule.
export default function Direct({ source, maj }: { source: "base" | "exemple"; maj: string }) {
  const router = useRouter();
  useEffect(() => {
    if (source !== "base") return;
    const id = setInterval(() => router.refresh(), 15000);
    return () => clearInterval(id);
  }, [source, router]);
  const heure = new Date(maj).toLocaleTimeString("fr-FR", { timeZone: "Europe/Paris", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  return source === "base" ? (
    <p className="live"><span className="live-dot" aria-hidden="true" />Données en direct · mis à jour à {heure} <button className="live-btn" onClick={() => router.refresh()}>Actualiser</button></p>
  ) : (
    <p className="live demo">Données d'exemple : la base n'est pas reliée ou ne contient encore aucune tâche notée.</p>
  );
}
