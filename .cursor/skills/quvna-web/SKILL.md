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

### Muvaffaqiyatli preset (PUBG/ML/FreeFire birxillashtirish)

- Card formulasi: `image -> amount(+bonus) -> dashed divider -> centered price`.
- Tavsiya etilgan divider: `mt-3 w-full border-t border-dashed border-[#425242]/80` (ko‘rinadi, lekin qo‘pol emas).
- Narx qatori markazda bo‘lsin: `mt-5` container + `mt-2 text-center text-[22px] font-semibold`.
- Narx oldidagi sun’iy spacer (`inline-block w-[1.2em]`)ni ishlatmang; u noto‘g‘ri offset beradi.
- Identity sahifadagi katta fon-cardni ichki elementga tegmasdan cho‘zish kerak bo‘lsa, pseudo-layer o‘rniga container’ning o‘ziga `min-h-*` bering (masalan: `min-h-[590px] md:min-h-[620px]`) va `justify-center`ni saqlang.

## Donate modal spacing (Figma parity) - incident learnings

- DOM path aniq bo‘lsa ham, avval muammoni 2 ga ajrating: **(a) local spacing**, **(b) viewport clipping**.
- `mt/mb/pb` ishlamayotgandek ko‘rinsa, ko‘pincha parent panel ekran bo‘yidan kesilib ko‘rinadi; buni `max-h-[calc(100dvh-...)] + overflow-y-auto` bilan tekshiring.
- Global reset (`* { padding: 0 }`) bor loyihada visual smoke-test uchun vaqtincha inline style ishlatish mumkin; tasdiqlangach Tailwind/classga qaytaring.
- Tugmalar “pastga yopishgan” case’da faqat tugmani emas, parent panel (`fixed` modal content) va ichki wrapper bo‘shliqlarini birga tekshiring.
- Figma cardlar uchun tezkor formula: `header -> provider-list -> action-row -> explicit bottom spacer` (kerak bo‘lsa `h-*`).

## Donate detail design fix (input + card) - incident learnings

- PUBG `DonateDetailPage` (`src/app/donate/[id]/page.tsx`) da muammoni 3 qatlamda tekshiring: **parent panel spacing**, **content wrapper**, **field/card inner spacing**.
- Input text joylashuvi uchun avval oddiy Tailwind (`pl-*`, `pr-*`) bilan mikrotune qiling; foydalanuvchi feedbacki asosida 2-4px qadam bilan yuring.
- Agar utility class vizualda apply bo‘lmayotgandek ko‘rinsa, vaqtincha inline `style={{ paddingLeft, paddingRight }}` bilan smoke-test qiling; so‘ng kerak bo‘lsa classga qaytaring.
- “Card fonini kattalashtirish, ichki element joyida qolsin” talabi uchun pseudo layer pattern ishlaydi: `relative` + `before:absolute before:-inset-* before:-z-10`.
- `justify-center`/`items-center` qo‘shilganda ichki kontent “devorga yopishgan” bo‘lishi mumkin; bu holda wrapperga `my-*`, `py-*`, `gap-*` bilan bo‘shliqni parent-first tarzda qayta balanslang.

### UID ogohlantirish card (FreeFire) - nima ishladi / nima ishlamadi

- **Ishlagan yondashuv:** card paddingni aniq talab bo‘lsa (`20px 20px`), class o‘rniga inline style bilan tekshirib tasdiqlang (`paddingTop/Bottom/Left/Right: "20px"`).
- **Ishlagan yondashuv:** buttonlar siqilib qolmasligi uchun `grid` wrapper va buttonlarda `w-full min-w-0 box-border` qo‘llang.
- **Ishlagan yondashuv:** “faqat fon kattalashsin” talabi bo‘lsa, bitta qatlamdan foydalaning (single layer). DOM’da bitta target wrapper tanlang.
- **Qilmaslik kerak:** tashqi va ichki wrapperga bir vaqtning o‘zida `before` qo‘shib yubormang — double-frame/qat-qat border paydo bo‘ladi.
- **Qilmaslik kerak:** “fon kattalashsin” talabida borderlarni ko‘paytirmang; aks holda vizual “buzilgan” ko‘rinadi.
- **Qilmaslik kerak:** katta UI tuning jarayonida bir nechta joyga bir vaqtda glass/pseudo effekt tarqatmang; faqat foydalanuvchi ko‘rsatgan elementni o‘zgartiring.

## Fast debug order (30s)

1. `data-cursor-element-id` + DOM path bilan target parentni toping.
2. Devtools/computed’da real `height/overflow`ni tekshiring (`overflow-y-auto` yo‘qmi?).
3. Avval viewport clippingni bartaraf qiling, keyin visual spacingni mikrotune qiling.
4. Faqat oxirida global CSS clashni gumon qiling.

## GSD / Claude CLI

Agar foydalanuvchi GSD buyruqlarini ishlatmasa, skill ichidagi `/gsd-*` havolalarini majburiy qilmang — bu ixtiyoriy ish jarayoni.

## Yangilanish (loyiha nusxasi)

- *2026-04-25: Loyiha `.cursor/skills`ga ko‘chirildi; "edit profile yo'q" bandi olib tashlangan — `profile/edit` mavjud.*
