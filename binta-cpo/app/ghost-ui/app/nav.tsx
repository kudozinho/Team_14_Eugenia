"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONES: Record<string, JSX.Element> = {
  "/": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="9" rx="2" /><rect x="14" y="3" width="7" height="5" rx="2" />
      <rect x="14" y="12" width="7" height="9" rx="2" /><rect x="3" y="16" width="7" height="5" rx="2" />
    </svg>
  ),
  "/rapport": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M7 3h7l5 5v13H7z" /><path d="M14 3v5h5M10 13h6M10 17h6" />
    </svg>
  ),
};

export default function Nav() {
  const path = usePathname();
  const items = [
    { href: "/", label: "Tableau de bord" },
    { href: "/rapport", label: "Rapport" },
  ];
  return (
    <nav className="tabs" aria-label="Navigation principale">
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={path === i.href ? "page" : undefined}>
          {ICONES[i.href]}
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
