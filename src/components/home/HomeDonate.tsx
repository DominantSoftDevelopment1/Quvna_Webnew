"use client";

import Link from "next/link";

const DONATE_ITEMS = [
  { id: "pubg",     name: "PUBG Mobile UC",   image: "/images/donate_pubg.png",           href: "/donate/pubg",     popular: true  },
  { id: "ml",       name: "Mobile Legends",    image: "/images/donate_mobile_legends.png", href: "/donate/ml",       popular: true  },
  { id: "freefire", name: "Free Fire Almaz",   image: "/images/donate_free_fire.png",      href: "/donate/freefire", popular: true  },
  { id: "steam",    name: "Steam Wallet",      image: "/images/donate_steam.png",          href: "/donate/steam",    popular: false },
];

export function HomeDonate() {
  return (
    <div className="flex justify-start items-start gap-[20px] overflow-x-auto scrollbar-none">
      {DONATE_ITEMS.map((item) => (
        <Link key={item.id} href={item.href} className="donate-card-home">
          <div className="donate-img-wrap-home">
            <img src={item.image} alt={item.name} className="donate-img-home" />
            {item.popular && (
              <div className="popular-badge-home">
                <img src="/icons/fire.svg" alt="" width={12} height={12} />
                <span>Mashxur</span>
              </div>
            )}
          </div>
          <p className="donate-name-home">{item.name}</p>
        </Link>
      ))}
    </div>
  );
}
