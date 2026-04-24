"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useProfile } from "@/hooks/useProfile";

interface Country {
  flag: string;
  country: string;
  code: string;
}

// Davlatlar ro'yxati (static data)
const COUNTRIES: Country[] = [
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
          setCountries(response.data);
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
    <div className="min-h-screen bg-gradient-to-b from-[#0A0A0A] via-[#0F0F0F] to-[#0A0A0A] text-white">
      {/* Header with gradient */}
      <div className="sticky top-0 z-10 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-zinc-800/50 shadow-lg shadow-black/20">
        <div className="max-w-[500px] mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-zinc-800/50 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              Davlatni tanlang
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">{filteredCountries.length} ta davlat</p>
          </div>
        </div>
      </div>

      <div className="max-w-[500px] mx-auto px-4 py-6 pb-24">
        {/* Search with glow effect */}
        <div className="mb-6">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 rounded-xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
            <input
              type="text"
              placeholder="Davlat nomini kiriting..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="relative w-full bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 rounded-xl px-4 py-3.5 pl-12 text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/50 focus:bg-zinc-900 transition-all duration-300 shadow-lg shadow-black/10"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-emerald-500 transition-colors duration-300"
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
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-zinc-800 rounded-full transition-colors"
              >
                <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Countries List with enhanced cards */}
        <div className="space-y-2">
          {filteredCountries.map((country, index) => {
            const isSelected = selectedCountry?.code === country.code;

            return (
              <button
                key={country.code}
                onClick={() => setSelectedCountry(country)}
                style={{ animationDelay: `${index * 20}ms` }}
                className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 animate-fade-in ${
                  isSelected
                    ? "bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/40 shadow-lg shadow-emerald-500/10 scale-[1.02]"
                    : "bg-zinc-900/40 backdrop-blur-sm hover:bg-zinc-800/60 border border-zinc-800/30 hover:border-zinc-700/50 hover:scale-[1.01] active:scale-[0.99]"
                } shadow-md hover:shadow-lg`}
              >
                {/* Flag with shadow */}
                <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-zinc-800/50 rounded-lg shadow-inner">
                  <span className="text-2xl filter drop-shadow-lg">{country.flag}</span>
                </div>

                {/* Country Name */}
                <span className={`flex-1 text-left font-medium transition-colors ${
                  isSelected ? "text-white" : "text-zinc-300"
                }`}>
                  {country.country}
                </span>

                {/* Code badge */}
                <span className="text-xs text-zinc-500 font-mono bg-zinc-800/50 px-2 py-1 rounded">
                  {country.code}
                </span>

                {/* Radio with animation */}
                <div className="relative flex-shrink-0">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-500 shadow-lg shadow-emerald-500/50 scale-110"
                        : "border-zinc-600 bg-transparent"
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3.5 h-3.5 text-white animate-scale-in" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Empty State with illustration */}
        {filteredCountries.length === 0 && (
          <div className="text-center py-16 animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-4 bg-zinc-800/50 rounded-full flex items-center justify-center">
              <svg className="w-10 h-10 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-zinc-400 font-medium mb-1">Davlat topilmadi</p>
            <p className="text-sm text-zinc-600">Boshqa nom bilan qidiring</p>
          </div>
        )}
      </div>

      {/* Bottom Button with gradient */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/95 to-transparent backdrop-blur-xl border-t border-zinc-800/50 shadow-2xl">
        <div className="max-w-[500px] mx-auto px-4 py-4">
          <button
            onClick={handleSave}
            disabled={!selectedCountry || saving}
            className={`w-full font-semibold py-3.5 rounded-xl transition-all duration-300 shadow-lg ${
              selectedCountry && !saving
                ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-[1.02] active:scale-[0.98]"
                : "bg-zinc-800/50 text-zinc-500 cursor-not-allowed"
            }`}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saqlanmoqda...
              </span>
            ) : (
              "Saqlash"
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scale-in {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
