import Logo from "@/components/Logo";

// Pastille toujours visible : dit si Ghost observe ou s'il est en pause.
export default function Pastille({ enPause, onBascule }: { enPause: boolean; onBascule: () => void }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed", left: 16, bottom: 16, zIndex: 50, display: "flex", alignItems: "center", gap: 12,
        background: "var(--g-900)", color: "#fff", borderRadius: 999, padding: "8px 8px 8px 10px", boxShadow: "0 6px 18px rgba(0,0,0,.25)",
      }}
    >
      <Logo taille={24} />
      <span style={{ fontWeight: 600 }}>
        {enPause ? "Ghost est en pause : il ne regarde pas" : "Hello, je suis là et je te regarde travailler"}
      </span>
      <button className="btn btn-secondary" onClick={onBascule} style={{ background: "var(--bg)", padding: "8px 16px" }}>
        {enPause ? "Reprendre" : "Pause"}
      </button>
    </div>
  );
}
