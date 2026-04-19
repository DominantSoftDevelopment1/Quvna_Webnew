# Quvna Web 2.0

Quvna - O'zbekistonning eng yirik gaming va video platformasi. Bu Next.js 16 + React 19 + Tailwind CSS 4 asosida qurilgan zamonaviy veb-ilova.

## Texnologiyalar

- **Next.js 16.2.4** (Turbopack)
- **React 19**
- **Tailwind CSS 4.x**
- **TypeScript**
- **TanStack Query** (React Query)
- **Zustand** (state management)

## Asosiy Sahifalar

| Sahifa | Tavsif |
|--------|--------|
| `/` | Asosiy sahifa - banner, turnirlar, mini app, game club |
| `/videos` | Video sahifasi - Shorts (TikTok-style), Foydalanuvchilar, Jonli efir, Video |
| `/stream` | Jonli efirlar |
| `/miniapp` | Mini ilovalar do'koni |
| `/profile` | Profil sahifasi - umumiy ma'lumotlar, videolar, sozlamalar |
| `/auth/login` | Kirish sahifasi |
| `/auth/register` | Ro'yxatdan o'tish |

## Profil Sahifasi (Yangilandi)

Profil sahifasi to'liq qayta ishlangan:

- **Banner** - blur effekti bilan, avatar va ism banner ustida
- **Avatar** - 72px, edit tugmasi bilan
- **Rating badge** - yulduzcha bilan, yashil fon
- **Bio** - 16px margin
- **Stats** - Postlar, Obunachilar, Obunalar (16px margin)
- **Social links** - Telegram, Instagram, YouTube, Donation Alerts (pill-style)
- **Game rating cards** - PUBG, Mobile Legends, Free Fire, Steam (swipe qilinadi)
- **Tablar** - Umumiy / Videolarim (card ichida, underline indicator)
- **Menyu** - Quvna bonus, Tarix, Mening klubim, Tungi rejim, Sozlamalar, Til, Quvna haqida, Qo'llab-quvvatlash
- **Menyu orasi** - 16px gap
- **Chiqish tugmasi** - faqat login qilgan foydalanuvchilar uchun

## Videos Sahifasi (Yangilandi)

- **4 ta tab** - Shorts, Foydalanuvchilar, Jonli efir, Video
- **Shorts** - TikTok-style fullscreen vertical scroll, sidebar ko'rinadi (left: 220px)
- **Search** - video va foydalanuvchi qidirish

## Global O'zgarishlar

- **Layout padding** - `main-scroll` ga `lg:px-6 xl:px-8` qo'shildi
- **Page container** - barcha sahifalarda bir xil padding
- **Sidebar** - 220px, z-index 50

## Backend API

- **Base URL**: `http://95.130.227.48:8066`
- **CDN**: `https://quvna-live.b-cdn.net`
- **Swagger**: `/v3/api-docs`

## Ishga Tushirish

```bash
npm install
npm run dev
```

Server `http://localhost:3000` da ishga tushadi.

## Muallif

Quvna Team
