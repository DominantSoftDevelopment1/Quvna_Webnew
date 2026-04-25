"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useProfile } from "@/hooks/useProfile";

export interface Country {
  flag: string;
  country: string;
  code: string;
}

// Davlatlar ro'yxati (static data)
export const COUNTRIES: Country[] = [
  { flag: "🇦🇫", country: "Afghanistan", code: "AF" },
  { flag: "🇦🇱", country: "Albania", code: "AL" },
  { flag: "🇩🇿", country: "Algeria", code: "DZ" },
  { flag: "🇦🇩", country: "Andorra", code: "AD" },
  { flag: "🇦🇴", country: "Angola", code: "AO" },
  { flag: "🇦🇬", country: "Antigua and Barbuda", code: "AG" },
  { flag: "🇦🇷", country: "Argentina", code: "AR" },
  { flag: "🇦🇲", country: "Armenia", code: "AM" },
  { flag: "🇦🇺", country: "Australia", code: "AU" },
  { flag: "🇦🇹", country: "Austria", code: "AT" },
  { flag: "🇦🇿", country: "Azerbaijan", code: "AZ" },
  { flag: "🇧🇸", country: "Bahamas", code: "BS" },
  { flag: "🇧🇭", country: "Bahrain", code: "BH" },
  { flag: "🇧🇩", country: "Bangladesh", code: "BD" },
  { flag: "🇧🇧", country: "Barbados", code: "BB" },
  { flag: "🇧🇾", country: "Belarus", code: "BY" },
  { flag: "🇧🇪", country: "Belgium", code: "BE" },
  { flag: "🇧🇿", country: "Belize", code: "BZ" },
  { flag: "🇧🇯", country: "Benin", code: "BJ" },
  { flag: "🇧🇹", country: "Bhutan", code: "BT" },
  { flag: "🇧🇴", country: "Bolivia", code: "BO" },
  { flag: "🇧🇦", country: "Bosnia and Herzegovina", code: "BA" },
  { flag: "🇧🇼", country: "Botswana", code: "BW" },
  { flag: "🇧🇷", country: "Brazil", code: "BR" },
  { flag: "🇧🇳", country: "Brunei", code: "BN" },
  { flag: "🇧🇬", country: "Bulgaria", code: "BG" },
  { flag: "🇧🇫", country: "Burkina Faso", code: "BF" },
  { flag: "🇧🇮", country: "Burundi", code: "BI" },
  { flag: "🇰🇭", country: "Cambodia", code: "KH" },
  { flag: "🇨🇲", country: "Cameroon", code: "CM" },
  { flag: "🇨🇦", country: "Canada", code: "CA" },
  { flag: "🇨🇻", country: "Cape Verde", code: "CV" },
  { flag: "🇨🇫", country: "Central African Republic", code: "CF" },
  { flag: "🇹🇩", country: "Chad", code: "TD" },
  { flag: "🇨🇱", country: "Chile", code: "CL" },
  { flag: "🇨🇳", country: "China", code: "CN" },
  { flag: "🇨🇴", country: "Colombia", code: "CO" },
  { flag: "🇰🇲", country: "Comoros", code: "KM" },
  { flag: "🇨🇬", country: "Congo", code: "CG" },
  { flag: "🇨🇷", country: "Costa Rica", code: "CR" },
  { flag: "🇨🇮", country: "Cote d'Ivoire", code: "CI" },
  { flag: "🇭🇷", country: "Croatia", code: "HR" },
  { flag: "🇨🇺", country: "Cuba", code: "CU" },
  { flag: "🇨🇾", country: "Cyprus", code: "CY" },
  { flag: "🇨🇿", country: "Czech Republic", code: "CZ" },
  { flag: "🇩🇰", country: "Denmark", code: "DK" },
  { flag: "🇩🇯", country: "Djibouti", code: "DJ" },
  { flag: "🇩🇲", country: "Dominica", code: "DM" },
  { flag: "🇩🇴", country: "Dominican Republic", code: "DO" },
  { flag: "🇪🇨", country: "Ecuador", code: "EC" },
  { flag: "🇪🇬", country: "Egypt", code: "EG" },
  { flag: "🇸🇻", country: "El Salvador", code: "SV" },
  { flag: "🇬🇶", country: "Equatorial Guinea", code: "GQ" },
  { flag: "🇪🇷", country: "Eritrea", code: "ER" },
  { flag: "🇪🇪", country: "Estonia", code: "EE" },
  { flag: "🇪🇹", country: "Ethiopia", code: "ET" },
  { flag: "🇸🇿", country: "Eswatini", code: "SZ" },
  { flag: "🇫🇯", country: "Fiji", code: "FJ" },
  { flag: "🇫🇮", country: "Finland", code: "FI" },
  { flag: "🇫🇷", country: "France", code: "FR" },
  { flag: "🇬🇦", country: "Gabon", code: "GA" },
  { flag: "🇬🇲", country: "Gambia", code: "GM" },
  { flag: "🇬🇪", country: "Georgia", code: "GE" },
  { flag: "🇩🇪", country: "Germany", code: "DE" },
  { flag: "🇬🇭", country: "Ghana", code: "GH" },
  { flag: "🇬🇷", country: "Greece", code: "GR" },
  { flag: "🇬🇩", country: "Grenada", code: "GD" },
  { flag: "🇬🇹", country: "Guatemala", code: "GT" },
  { flag: "🇬🇳", country: "Guinea", code: "GN" },
  { flag: "🇬🇼", country: "Guinea-Bissau", code: "GW" },
  { flag: "🇬🇾", country: "Guyana", code: "GY" },
  { flag: "🇭🇹", country: "Haiti", code: "HT" },
  { flag: "🇭🇳", country: "Honduras", code: "HN" },
  { flag: "🇭🇺", country: "Hungary", code: "HU" },
  { flag: "🇮🇸", country: "Iceland", code: "IS" },
  { flag: "🇮🇳", country: "India", code: "IN" },
  { flag: "🇮🇩", country: "Indonesia", code: "ID" },
  { flag: "🇮🇷", country: "Iran", code: "IR" },
  { flag: "🇮🇶", country: "Iraq", code: "IQ" },
  { flag: "🇮🇪", country: "Ireland", code: "IE" },
  { flag: "🇮🇱", country: "Israel", code: "IL" },
  { flag: "🇮🇹", country: "Italy", code: "IT" },
  { flag: "🇯🇲", country: "Jamaica", code: "JM" },
  { flag: "🇯🇵", country: "Japan", code: "JP" },
  { flag: "🇯🇴", country: "Jordan", code: "JO" },
  { flag: "🇰🇿", country: "Kazakhstan", code: "KZ" },
  { flag: "🇰🇪", country: "Kenya", code: "KE" },
  { flag: "🇰🇮", country: "Kiribati", code: "KI" },
  { flag: "🇰🇵", country: "North Korea", code: "KP" },
  { flag: "🇰🇷", country: "South Korea", code: "KR" },
  { flag: "🇰🇼", country: "Kuwait", code: "KW" },
  { flag: "🇰🇬", country: "Kyrgyzstan", code: "KG" },
  { flag: "🇱🇦", country: "Laos", code: "LA" },
  { flag: "🇱🇻", country: "Latvia", code: "LV" },
  { flag: "🇱🇧", country: "Lebanon", code: "LB" },
  { flag: "🇱🇸", country: "Lesotho", code: "LS" },
  { flag: "🇱🇷", country: "Liberia", code: "LR" },
  { flag: "🇱🇾", country: "Libya", code: "LY" },
  { flag: "🇱🇮", country: "Liechtenstein", code: "LI" },
  { flag: "🇱🇹", country: "Lithuania", code: "LT" },
  { flag: "🇱🇺", country: "Luxembourg", code: "LU" },
  { flag: "🇲🇬", country: "Madagascar", code: "MG" },
  { flag: "🇲🇼", country: "Malawi", code: "MW" },
  { flag: "🇲🇾", country: "Malaysia", code: "MY" },
  { flag: "🇲🇻", country: "Maldives", code: "MV" },
  { flag: "🇲🇱", country: "Mali", code: "ML" },
  { flag: "🇲🇹", country: "Malta", code: "MT" },
  { flag: "🇲🇭", country: "Marshall Islands", code: "MH" },
  { flag: "🇲🇷", country: "Mauritania", code: "MR" },
  { flag: "🇲🇺", country: "Mauritius", code: "MU" },
  { flag: "🇲🇽", country: "Mexico", code: "MX" },
  { flag: "🇫🇲", country: "Micronesia", code: "FM" },
  { flag: "🇲🇩", country: "Moldova", code: "MD" },
  { flag: "🇲🇨", country: "Monaco", code: "MC" },
  { flag: "🇲🇳", country: "Mongolia", code: "MN" },
  { flag: "🇲🇪", country: "Montenegro", code: "ME" },
  { flag: "🇲🇦", country: "Morocco", code: "MA" },
  { flag: "🇲🇿", country: "Mozambique", code: "MZ" },
  { flag: "🇲🇲", country: "Myanmar", code: "MM" },
  { flag: "🇳🇦", country: "Namibia", code: "NA" },
  { flag: "🇳🇷", country: "Nauru", code: "NR" },
  { flag: "🇳🇵", country: "Nepal", code: "NP" },
  { flag: "🇳🇱", country: "Netherlands", code: "NL" },
  { flag: "🇳🇿", country: "New Zealand", code: "NZ" },
  { flag: "🇳🇮", country: "Nicaragua", code: "NI" },
  { flag: "🇳🇪", country: "Niger", code: "NE" },
  { flag: "🇳🇬", country: "Nigeria", code: "NG" },
  { flag: "🇲🇰", country: "North Macedonia", code: "MK" },
  { flag: "🇳🇴", country: "Norway", code: "NO" },
  { flag: "🇴🇲", country: "Oman", code: "OM" },
  { flag: "🇵🇰", country: "Pakistan", code: "PK" },
  { flag: "🇵🇼", country: "Palau", code: "PW" },
  { flag: "🇵🇸", country: "Palestine", code: "PS" },
  { flag: "🇵🇦", country: "Panama", code: "PA" },
  { flag: "🇵🇬", country: "Papua New Guinea", code: "PG" },
  { flag: "🇵🇾", country: "Paraguay", code: "PY" },
  { flag: "🇵🇪", country: "Peru", code: "PE" },
  { flag: "🇵🇭", country: "Philippines", code: "PH" },
  { flag: "🇵🇱", country: "Poland", code: "PL" },
  { flag: "🇵🇹", country: "Portugal", code: "PT" },
  { flag: "🇶🇦", country: "Qatar", code: "QA" },
  { flag: "🇷🇴", country: "Romania", code: "RO" },
  { flag: "🇷🇺", country: "Russia", code: "RU" },
  { flag: "🇷🇼", country: "Rwanda", code: "RW" },
  { flag: "🇰🇳", country: "Saint Kitts and Nevis", code: "KN" },
  { flag: "🇱🇨", country: "Saint Lucia", code: "LC" },
  { flag: "🇻🇨", country: "Saint Vincent and the Grenadines", code: "VC" },
  { flag: "🇼🇸", country: "Samoa", code: "WS" },
  { flag: "🇸🇲", country: "San Marino", code: "SM" },
  { flag: "🇸🇹", country: "Sao Tome and Principe", code: "ST" },
  { flag: "🇸🇦", country: "Saudi Arabia", code: "SA" },
  { flag: "🇸🇳", country: "Senegal", code: "SN" },
  { flag: "🇷🇸", country: "Serbia", code: "RS" },
  { flag: "🇸🇨", country: "Seychelles", code: "SC" },
  { flag: "🇸🇱", country: "Sierra Leone", code: "SL" },
  { flag: "🇸🇬", country: "Singapore", code: "SG" },
  { flag: "🇸🇰", country: "Slovakia", code: "SK" },
  { flag: "🇸🇮", country: "Slovenia", code: "SI" },
  { flag: "🇸🇧", country: "Solomon Islands", code: "SB" },
  { flag: "🇸🇴", country: "Somalia", code: "SO" },
  { flag: "🇿🇦", country: "South Africa", code: "ZA" },
  { flag: "🇸🇸", country: "South Sudan", code: "SS" },
  { flag: "🇪🇸", country: "Spain", code: "ES" },
  { flag: "🇱🇰", country: "Sri Lanka", code: "LK" },
  { flag: "🇸🇩", country: "Sudan", code: "SD" },
  { flag: "🇸🇷", country: "Suriname", code: "SR" },
  { flag: "🇸🇪", country: "Sweden", code: "SE" },
  { flag: "🇨🇭", country: "Switzerland", code: "CH" },
  { flag: "🇸🇾", country: "Syria", code: "SY" },
  { flag: "🇹🇼", country: "Taiwan", code: "TW" },
  { flag: "🇹🇯", country: "Tajikistan", code: "TJ" },
  { flag: "🇹🇿", country: "Tanzania", code: "TZ" },
  { flag: "🇹🇭", country: "Thailand", code: "TH" },
  { flag: "🇹🇱", country: "Timor-Leste", code: "TL" },
  { flag: "🇹🇬", country: "Togo", code: "TG" },
  { flag: "🇹🇴", country: "Tonga", code: "TO" },
  { flag: "🇹🇹", country: "Trinidad and Tobago", code: "TT" },
  { flag: "🇹🇳", country: "Tunisia", code: "TN" },
  { flag: "🇹🇷", country: "Turkey", code: "TR" },
  { flag: "🇹🇲", country: "Turkmenistan", code: "TM" },
  { flag: "🇹🇻", country: "Tuvalu", code: "TV" },
  { flag: "🇺🇬", country: "Uganda", code: "UG" },
  { flag: "🇺🇦", country: "Ukraine", code: "UA" },
  { flag: "🇦🇪", country: "United Arab Emirates", code: "AE" },
  { flag: "🇬🇧", country: "United Kingdom", code: "GB" },
  { flag: "🇺🇸", country: "United States", code: "US" },
  { flag: "🇺🇾", country: "Uruguay", code: "UY" },
  { flag: "🇺🇿", country: "Uzbekistan", code: "UZ" },
  { flag: "🇻🇺", country: "Vanuatu", code: "VU" },
  { flag: "🇻🇦", country: "Vatican City", code: "VA" },
  { flag: "🇻🇪", country: "Venezuela", code: "VE" },
  { flag: "🇻🇳", country: "Vietnam", code: "VN" },
  { flag: "🇾🇪", country: "Yemen", code: "YE" },
  { flag: "🇿🇲", country: "Zambia", code: "ZM" },
  { flag: "🇿🇼", country: "Zimbabwe", code: "ZW" },
];

function resolveCurrentCountry(
  profile: Record<string, unknown> | null | undefined,
  list: Country[]
): Country | null {
  if (!profile) return null;
  const reg = profile.region as { code?: string; name?: string } | string | undefined;
  if (reg && typeof reg === "object" && reg !== null) {
    const code = reg.code != null && String(reg.code).trim() ? String(reg.code).toUpperCase() : "";
    if (code) {
      const byCode = list.find((c) => c.code === code);
      if (byCode) return byCode;
    }
  }
  const name = String(profile.country ?? (typeof reg === "object" && reg && "name" in reg ? (reg as { name?: string }).name : "") ?? "").trim();
  if (!name) return null;
  return list.find((c) => c.country.toLowerCase() === name.toLowerCase()) ?? null;
}

export default function CountrySelectPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const userId = user?.id ? Number(user.id) : null;
  const { data: profile } = useProfile(userId);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [countries, setCountries] = useState<Country[]>(COUNTRIES);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    const c = resolveCurrentCountry(profile as Record<string, unknown>, countries);
    if (!c) return;
    setSelectedCountry((prev) => (prev == null ? c : prev));
  }, [profile, countries]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      searchInputRef.current?.focus();
    }, 120);
    return () => window.clearTimeout(timer);
  }, []);

  // API dan davlatlar olishga harakat qilish (fallback: static data)
  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const response = await api.get("/user/countries");
        if (response.data && response.data.length > 0) {
          const apiCountries = response.data as Country[];
          const merged = [...COUNTRIES];
          for (const item of apiCountries) {
            if (!merged.some((c) => c.code === item.code)) {
              merged.push(item);
            }
          }
          setCountries(merged);
        }
      } catch (error) {
        console.log("API dan davlatlar yuklanmadi, static data ishlatilmoqda");
      }
    };

    fetchCountries();
  }, []);

  // Filtrlangan davlatlar
  const filteredCountries = countries.filter((country) =>
    country.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Saqlash
  const handleSave = async () => {
    if (!selectedCountry) return;

    setSaving(true);
    try {
      const userId = localStorage.getItem("user_id");
      await api.patch(`/user/edit/${userId}`, {
        region: {
          name: selectedCountry.country,
          code: selectedCountry.code,
        },
      });
      router.push("/profile/edit");
    } catch (error) {
      console.error("Davlatni saqlashda xatolik:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full bg-[#050505] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-[560px] h-[860px] max-h-[calc(100dvh-32px)] rounded-[28px] border border-zinc-700/80 bg-[#141416] overflow-hidden flex flex-col">

        {/* Header */}
        <header className="h-[72px] px-6 flex items-center gap-3 border-b border-zinc-700/70 shrink-0">
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Orqaga"
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-[22px] font-bold">Davlatni tanlang</h1>
        </header>

        {/* Search */}
        <div style={{ width: "100%", paddingLeft: 24, paddingRight: 24, paddingTop: 16, paddingBottom: 12, boxSizing: "border-box" }}>
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              height: 58,
              borderRadius: 16,
              border: "1px solid #3f3f46",
              background: "#151518",
              color: "white",
              paddingLeft: 16,
              paddingRight: 16,
              boxSizing: "border-box",
              outline: "none",
              fontSize: 16,
            }}
          />
        </div>

        {/* Countries List */}
        <div
          className="custom-scroll"
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            paddingLeft: 24,
            paddingRight: 24,
            paddingBottom: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            boxSizing: "border-box",
          }}
        >
          {filteredCountries.map((country) => {
            const isSelected = selectedCountry?.code === country.code;
            return (
              <button
                key={country.code}
                type="button"
                onClick={() => setSelectedCountry(country)}
                style={{
                  width: "100%",
                  minHeight: 64,
                  borderRadius: 16,
                  border: isSelected ? "1px solid #10b981" : "1px solid #3f3f46",
                  background: isSelected ? "rgba(16,185,129,0.15)" : "#151518",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingLeft: 20,
                  paddingRight: 20,
                  boxSizing: "border-box",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <span style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ width: 40, textAlign: "left", fontWeight: 700 }}>
                    {country.code}
                  </span>
                  <span>{country.country}</span>
                </span>
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: isSelected ? "2px solid #10b981" : "2px solid #777",
                    background: isSelected ? "#10b981" : "transparent",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                />
              </button>
            );
          })}

          {filteredCountries.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 0", color: "#71717a", fontSize: 17 }}>
              Davlat topilmadi
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: "1px solid #3f3f46", boxSizing: "border-box", background: "#141416" }}>
          <button
            onClick={handleSave}
            disabled={!selectedCountry || saving}
            style={{
              width: "100%",
              height: 50,
              borderRadius: 16,
              border: "none",
              background: !selectedCountry || saving ? "#27272a" : "#10b981",
              color: !selectedCountry || saving ? "#71717a" : "#000",
              fontSize: 18,
              fontWeight: 700,
              cursor: !selectedCountry || saving ? "not-allowed" : "pointer",
              boxSizing: "border-box",
            }}
          >
            {saving ? "Saqlanmoqda..." : "Saqlash"}
          </button>
        </div>

        <style jsx>{`
          .custom-scroll::-webkit-scrollbar { width: 5px; }
          .custom-scroll::-webkit-scrollbar-track { background: transparent; }
          .custom-scroll::-webkit-scrollbar-thumb { background: #52525b; border-radius: 999px; }
        `}</style>
      </div>
    </div>
  );
}
