import Image from "next/image";

// Logo Ghost sur tuile blanc cassé (charte : jamais directement sur le vert foncé).
export default function Logo({ taille = 34 }: { taille?: number }) {
  const tuile = Math.round(taille * 1.3);
  return (
    <span
      style={{
        display: "inline-grid",
        placeItems: "center",
        width: tuile,
        height: tuile,
        borderRadius: 14,
        background: "var(--bg)",
        border: "1px solid var(--line)",
      }}
    >
      <Image src="/logo-ghost.svg" alt="Ghost" width={taille} height={taille} priority />
    </span>
  );
}
