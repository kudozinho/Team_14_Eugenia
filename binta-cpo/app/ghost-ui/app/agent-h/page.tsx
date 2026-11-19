import Prouver from "../prouver";
import { tacheIdConfiguree } from "@/lib/tache";

export const dynamic = "force-dynamic";

// La démo commence par la tâche confiée à l'agent H ; le diagnostic (tableau de bord, rapport) explique ensuite pourquoi cette tâche.
export default function AgentH() {
  return (
    <>
      <p className="eyebrow">Démonstration interactive</p>
      <h1>Confiez la tâche à l'agent H</h1>

      <section className="card">
        <h2>Un mandat, trois portails</h2>
        <p>
          À partir du mandat fictif M-0142, l'agent H remplit les formulaires des trois sites de test, qui n'ont pas d'API.
          Le service reçoit votre demande, appelle H Company et vérifie les publications avant de renvoyer le résultat.
        </p>
        <div style={{ marginTop: 18 }}><Prouver tacheId={tacheIdConfiguree()} /></div>
        <p className="note">
          Un code de démonstration est requis. Une seule exécution à la fois. Chaque lancement crée sa propre demande :
          le résultat affiché est celui de cette demande, jamais celui d'une exécution précédente. Les crédits de l'agent H sont limités : sans crédits suffisants ou confirmés, le lancement est refusé et rien n'est simulé.
        </p>
      </section>

      <section className="card" style={{ marginTop: 24 }}>
        <h2>Ce que vous pouvez vérifier</h2>
        <ol>
          <li>La demande reçoit un identifiant et passe par cinq étapes : demande reçue, attente du service, agent en cours, vérification, terminé.</li>
          <li>Le résultat indique la session H, la durée et les portails réellement vérifiés (✓ seulement après contrôle des annonces).</li>
          <li>Terminé mais non vérifié, échec ou crédits insuffisants sont affichés comme tels, jamais comme un succès.</li>
        </ol>
        <p>
          <a href="https://ghost-portail-a.vercel.app/">Portail A</a> · <a href="https://ghost-portail-b.vercel.app/">Portail B</a> · <a href="https://ghost-portail-c.vercel.app/">Portail C</a>
        </p>
        <p className="muted">
          Pourquoi cette tâche ? L'audit l'a détectée, notée et rattachée à l'agent H parce qu'il n'y a pas d'API : voir le <a href="/">tableau de bord</a> et le <a href="/rapport">rapport</a>.
          Avec une API, nous privilégions n8n.
        </p>
      </section>
    </>
  );
}
