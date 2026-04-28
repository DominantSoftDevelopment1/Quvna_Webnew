---
name: quvna-web
description: Quvna Next.js web loyihasi — stack, dizayn tokenlari, API, React Query, qoidalar. Quvna web, profil, video, stream, miniapp vazifalarida ishlat.
---

# Quvna Web (loyiha skill)

> **Manba:** `C:\Users\Сomp X\.claude\skills\quvna-web` — loyihaga moslashtirilgan nusxa. Asosiy qoidalarni shu fayl va `CLAUDE.md` dan oling.

## Loyiha

**Quvna** — gaming video platforma (Shorts, efirlar, turnirlar, mini o‘yinlar, donat, reyting).

| | |
|---|---|
| Web | Next.js 16, React 19, Tailwind 4, TypeScript strict |
| State | TanStack Query (server), Zustand (auth) |
| HTTP | `src/lib/api.ts` (Axios, Bearer, 401 refresh) |

## Dizayn

- **Primary:** `#03FF93` — `globals.css` / `var(--primary)`
- **Fon:** dark — `var(--bg-dark)` va hokazo
- **Layout:** mobil `BottomNav`, desktop `Sidebar`; `profile/edit` oqimida to‘liq ekran rejimi (`body.profile-edit-focus`)
- **Classlar:** imkon qadar Tailwind + `globals.css`; murakkab joylarda `cn()` (`@/lib/utils`)
- **Eslatma:** skilldagi “faqat globals.css, inline yo‘q” qoida — loyihada ayrim sahifalar `style` yoki `style jsx` ishlatishi mumkin; yangi kodda mavjud patternga mos turing.

## API

Base URL va CDN: `src/lib/constants.ts` / `lib/constants` — **hardcode qilmang**.

Muhim yo‘llar: `/user/profile/{id}`, `PATCH /user/edit/{id}`, video/stream endpointlari — batafsil `CLAUDE.md` va `src/lib/api.ts`.

## Qoidalar (qisqa)

1. So‘rovlar: `import { api } from "@/lib/api"`
2. Konfig: `@/lib/constants`
3. `any`ni cheklang; umumiy turlar `src/types` yoki komponent yonida
4. Profil tahriri, davlat: `src/app/profile/edit/`, `/profile/edit/country`
5. **Browser preview CSS sync:** previewdan kelgan `selector`/`elementClasses` bo‘yicha elementni toping; agar JSX `className` Tailwind bo‘lsa, CSS qiymatini utilityga aylantirib shu yerda saqlang (`padding-left/right: 30px` → `px-[30px]`). `newValue` bo‘sh bo‘lsa, shu propertyni qo‘shmang yoki mavjud utilityni olib tashlang; so‘ng o‘zgargan faylda lintni tekshiring.

## Donate / OSON troubleshooting

- Local dev'da CORS bo‘lsa `BASE_URL`ni to‘g‘ridan-to‘g‘ri hostga bermang; `next.config.ts` rewrite bilan `/api-proxy` ishlating.
- `POST /order`da `Access Denied` chiqsa bu odatda auth/permission (token yoki backend role), CORS emas.
- Token kalitlari aralash bo‘lishi mumkin: `access_token`/`refresh_token` va `accessToken`/`refreshToken` ikkalasini ham hisobga oling.
- PUBG promo flowda `Sotib olish` bosilganda `paymentServiceType: "OSON"` bilan order yuborilib, `url` kelishi bilan to‘lov oynasi ochilishi kerak.
- Order response shape backendlarda farq qiladi; `url`ni faqat `data.url`dan emas, nested variantlardan ham parse qiling.
- UX: global `isPending` sabab barcha kartalar “bosilgandek” bo‘lmasin; faqat tanlangan kartada loading (`selectedIndex`) ko‘rsating.

## Donate UI (card layout) pattern

- Kartada ichki elementlar siqilsa, faqat `mt` bilan “itarish” o‘rniga alohida content-wrapper oching: `w-full min-w-0 box-border space-y-*`.
- Parent yondashuv: `article`da `min-w-0`, `box-border`, kerakli `min-h` va `gap` orqali umumiy spacingni boshqaring.
- Narx oldidagi iconni olib tashlash kerak bo‘lsa, alignment buzilmasin uchun bo‘sh spacer qoldiring (`inline-block` width).
- “Sotib olish” tugmasi dizaynni buzsa, kartaning o‘zini clickable patternga o‘tkazing (`role="button"`, `tabIndex={0}`, `onClick`, `Enter/Space`).
- Bitta action bosilganda boshqa kartalar loading bo‘lib ketmasin: global pending’ni vizualda faqat `selectedIndex` bilan target qiling.

## GSD / Claude CLI

Agar foydalanuvchi GSD buyruqlarini ishlatmasa, skill ichidagi `/gsd-*` havolalarini majburiy qilmang — bu ixtiyoriy ish jarayoni.

## Yangilanish (loyiha nusxasi)

- *2026-04-25: Loyiha `.cursor/skills`ga ko‘chirildi; "edit profile yo'q" bandi olib tashlangan — `profile/edit` mavjud.*
