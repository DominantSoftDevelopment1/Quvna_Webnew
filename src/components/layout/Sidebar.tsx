"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/",        label: "Asosiy",   icon: "/icons/game.svg"    },
  { href: "/videos",  label: "Videolar", icon: "/icons/video.svg"   },
  { href: "/stream",  label: "Efirlar",  icon: "/icons/stream.svg"  },
  { href: "/miniapp", label: "Mini App", icon: "/icons/store.svg"   },
  { href: "/profile", label: "Profil",   icon: "/icons/profile.svg" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <Link href="/" className="sidebar-logo">
        <img src="/quvna_logo.png" alt="Quvna" width={32} height={32} className="rounded-lg shrink-0" />
        <img src="/icons/text_quvna.svg" alt="Quvna" className="sidebar-logo-text" />
      </Link>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map(({ href, label, icon }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`sidebar-nav-item${active ? " active" : ""}`}
            >
              <img
                src={icon}
                alt=""
                width={20}
                height={20}
                className={`sidebar-nav-icon${active ? " active" : ""}`}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
