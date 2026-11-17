"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav() {
  const path = usePathname();
  const items = [
    { href: "/", label: "Tableau de bord" },
    { href: "/rapport", label: "Rapport" },
  ];
  return (
    <nav className="tabs">
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={path === i.href ? "page" : undefined}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
