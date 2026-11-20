// Les trois agents H de Ghost : un prénom, une couleur, un rôle.
export const AGENTS: Record<string, { prenom: string; role: string; couleur: string }> = {
  acces: { prenom: "Alma", role: "Accès", couleur: "#f4a261" },   // orange
  equipe: { prenom: "Nino", role: "Équipe", couleur: "#9b7bea" }, // violet
  docs: { prenom: "Lia", role: "Docs", couleur: "#4f9bff" },      // bleu
  suivi: { prenom: "Sam", role: "Suivi", couleur: "#4ecb8f" },    // vert : à venir (suivi de la première semaine)
};
export const agentInfo = (a: string) => AGENTS[a] ?? { prenom: a, role: a, couleur: "#8fd1a8" };
