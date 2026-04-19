"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

const DONATE_DATA: Record<string, DonateItem> = {
  pubg: {
    name: "PUBG Mobile UC",
    image: "/images/donate_pubg.png",
    currency: "UC",
    packages: [
      { amount: 60,   price: 15_000  },
      { amount: 120,  price: 28_000  },
      { amount: 325,  price: 72_000  },
      { amount: 660,  price: 140_000 },
      { amount: 1800, price: 370_000 },
      { amount: 3850, price: 750_000 },
    ],
  },
  ml: {
    name: "Mobile Legends Diamond",
    image: "/images/donate_mobile_legends.png",
    currency: "💎",
    packages: [
      { amount: 11,   price: 12_000  },
      { amount: 22,   price: 23_000  },
      { amount: 56,   price: 55_000  },
      { amount: 112,  price: 108_000 },
      { amount: 336,  price: 310_000 },
      { amount: 570,  price: 520_000 },
    ],
  },
  freefire: {
    name: "Free Fire Almaz",
    image: "/images/donate_free_fire.png",
    currency: "💎",
    packages: [
      { amount: 100,  price: 18_000  },
      { amount: 210,  price: 35_000  },
      { amount: 520,  price: 82_000  },
      { amount: 1060, price: 160_000 },
      { amount: 2180, price: 320_000 },
      { amount: 5600, price: 790_000 },
    ],
  },
  steam: {
    name: "Steam Wallet",
    image: "/images/donate_steam.png",
    currency: "$",
    packages: [
      { amount: 5,   price: 65_000  },
      { amount: 10,  price: 128_000 },
      { amount: 20,  price: 250_000 },
      { amount: 50,  price: 620_000 },
      { amount: 100, price: 1_230_000 },
    ],
  },
};

interface DonateItem {
  name: string; image: string; currency: string;
  packages: { amount: number; price: number }[];
}

export default function DonateDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const item = DONATE_DATA[id];
  const [selected, setSelected] = useState<number | null>(null);
  const [userId, setUserId] = useState("");

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted">Donat turi topilmadi</p>
        <button type="button" className="miniapp-play-btn" onClick={() => router.push("/donate")}>Orqaga</button>
      </div>
    );
  }

  const selectedPkg = selected !== null ? item.packages[selected] : null;

  return (
    <div className="max-w-xl mx-auto pb-8">
      {/* Header */}
      <div className="game-page-header">
        <button type="button" className="game-back-btn" onClick={() => router.back()} aria-label="Orqaga">
          <img src="/icons/back_left.svg" alt="" width={20} height={20} className="icon-invert" />
        </button>
        <img src={item.image} alt={item.name} className="donate-detail-img" />
        <div>
          <h1 className="game-page-title">{item.name}</h1>
          <p className="game-page-desc">Miqdorni tanlang</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* User ID input */}
        <div className="donate-input-wrap">
          <label className="donate-input-label">O'yinchi ID</label>
          <input
            type="text"
            placeholder="ID raqamingizni kiriting"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="donate-input"
          />
        </div>

        {/* Packages */}
        <div>
          <p className="donate-section-label">Miqdorni tanlang</p>
          <div className="donate-packages-grid">
            {item.packages.map((pkg, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(i)}
                className={`donate-pkg-card${selected === i ? " active" : ""}`}
              >
                <span className="donate-pkg-amount">{pkg.amount} {item.currency}</span>
                <span className="donate-pkg-price">{pkg.price.toLocaleString()} so'm</span>
              </button>
            ))}
          </div>
        </div>

        {/* Buy button */}
        <button
          type="button"
          className="donate-buy-btn"
          disabled={!selectedPkg || !userId.trim()}
        >
          {selectedPkg
            ? `${selectedPkg.price.toLocaleString()} so'm to'lash`
            : "Miqdorni tanlang"}
        </button>
      </div>
    </div>
  );
}
