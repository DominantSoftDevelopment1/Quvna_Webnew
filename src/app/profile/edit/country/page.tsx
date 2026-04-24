"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useProfile } from "@/hooks/useProfile";

export interface Country {
  flag: string;
  country: string;
  code: string;
}

// Flag emoji largeni to'g'ri ko'rsatish uchun
const flagEmojiStyle: React.CSSProperties = {
  fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
  fontSize: '1.5rem',
  lineHeight: 1,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2rem',
  height: '2rem',
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

export default function CountrySelectPage() {
  const router = useRouter();
  const [countries, setCountries] = useState<Country[]>(COUNTRIES);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-[420px] rounded-3xl border border-zinc-700/80 bg-gradient-to-b from-[#18181B] to-[#101012] shadow-2xl shadow-black/40 backdrop-blur overflow-hidden">
      {/* Header */}
      <div className="border-b border-zinc-700/70">
        <div className="px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-zinc-800/80 rounded-xl transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className="text-lg font-semibold tracking-tight">Davlatni tanlang</h1>
        </div>
      </div>

      <div className="px-4 pb-4 flex flex-col gap-3">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900/90 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/80 focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Countries List */}
        <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-2">
          {filteredCountries.map((country) => {
            const isSelected = selectedCountry?.code === country.code;

            return (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isSelected
                    ? "bg-emerald-500/12 border border-emerald-500/40 shadow-[0_0_0_1px_rgba(16,185,129,0.18)]"
                    : "bg-zinc-900/40 hover:bg-zinc-900/70 border border-zinc-800/80"
                }`}
              >
                {/* Flag */}
                <span style={flagEmojiStyle} role="img" aria-label={country.country}>
                  {country.flag}
                </span>

                {/* Country Name */}
                <span className="flex-1 text-left text-base font-medium">{country.country}</span>

                {/* Radio */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500"
                      : "border-zinc-600"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredCountries.length === 0 && (
          <div className="text-center py-12 text-zinc-500">
            Davlat topilmadi
          </div>
        )}
      </div>

      {/* Bottom Button */}
      <div className="border-t border-zinc-700/70 p-4">
        <button
          onClick={handleSave}
          disabled={!selectedCountry || saving}
          className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold rounded-xl transition-colors"
        >
          {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
      </div>
    </div>
  );
}
