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

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {navItems.map(({ href, label, icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        const isStream = href === "/stream";

        if (isStream) {
          return (
            <Link key={href} href={href} className="bottom-nav-stream">
              <img
                src={icon}
                alt={label}
                width={40}
                height={40}
                className={`bottom-nav-stream-icon${active ? " active" : ""}`}
              />
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className={`bottom-nav-item${active ? " active" : ""}`}
          >
            <img
              src={icon}
              alt=""
              width={22}
              height={22}
              className={`bottom-nav-icon${active ? " active" : ""}`}
            />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
