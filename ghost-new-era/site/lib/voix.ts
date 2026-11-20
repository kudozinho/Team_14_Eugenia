// Voix de Ghost (synthèse vocale du navigateur) et transcription de ce que dit la personne (reconnaissance vocale de Chrome).
// Aucune clé, aucun coût. Fonctionne surtout dans Chrome. Le micro n'est utilisé que si la personne clique sur le bouton.
/* eslint-disable @typescript-eslint/no-explicit-any */
export const voixDispo = () => typeof window !== "undefined" && "speechSynthesis" in window;
export const microDispo = () =>
  typeof window !== "undefined" && !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);

export function parler(texte: string, cb?: { debut?: () => void; fin?: () => void }) {
  if (!voixDispo()) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(texte);
  u.lang = "fr-FR";
  u.rate = 1.03;
  const v = window.speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith("fr") && /(amélie|thomas|google|audrey|marie|hortense)/i.test(x.name))
    ?? window.speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith("fr"));
  if (v) u.voice = v;
  u.onstart = () => cb?.debut?.();
  u.onend = u.onerror = () => cb?.fin?.();
  window.speechSynthesis.speak(u);
}

export function taire() {
  if (voixDispo()) window.speechSynthesis.cancel();
}

export function ecouter(h: { interim: (t: string) => void; final: (t: string) => void; fin: () => void; erreur: (m: string) => void }) {
  const R = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const r = new R();
  r.lang = "fr-FR";
  r.continuous = true;
  r.interimResults = true;
  r.onresult = (e: any) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const t = e.results[i][0].transcript;
      if (e.results[i].isFinal) h.final(t.trim()); else interim += t;
    }
    h.interim(interim);
  };
  r.onerror = (e: any) => h.erreur(e.error === "not-allowed" ? "Le micro est refusé : autorise-le dans Chrome (icône à gauche de l'adresse)." : `Micro : ${e.error}`);
  r.onend = () => h.fin();
  r.start();
  return () => { try { r.stop(); } catch { /* déjà arrêté */ } };
}
