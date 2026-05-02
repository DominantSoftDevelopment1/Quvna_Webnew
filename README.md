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

- **Base URL (mobil bilan bir xil, default)**: `https://quvna.dominantsoftdevelopment.uz` — `NEXT_PUBLIC_API_BASE_URL` bilan boshqariladi.
- **Server (IP)**: `http://95.130.227.48:8066`
- **CDN**: `https://quvna-live.b-cdn.net`
- **Swagger**: `/v3/api-docs`

## Ishga Tushirish

```bash
npm install
npm run dev
```

Server standart ravishda `http://localhost:3000` da ochiladi (IPv6/OS farqlari uchun `http://127.0.0.1:3000` ham sinab ko‘ring).

### Lokal ishlamasa (Next «Another server is already running»)

1. Eskidan qolgan `next dev` hali ishlayapti — terminalda Ctrl+C bilan yoping yoki xabardagi PID bo‘yicha PowerShell/cmd: `taskkill /PID <PID> /F`
2. Shundan keyin: `npm run dev`
3. Turbopack bilan muammo bo‘lsa: **`npm run dev:webpack`**
4. Dev kesh/lock chalkash bo‘lsa (avval keraksa jarayonni to‘xtatib): **`npm run dev:fresh`**
5. Sahifa ochilmay qolsa yoki tortib qolsa: `netstat -ano | findstr :3000` — eski `next dev` (**CLOSE_WAIT** ko‘p bo‘lsa jarayon „osilib“ qolgan) — xabardagi PID uchun `taskkill /PID <PID> /F`, keyin **`npm run dev`**

**Sekin fayl tizimi:** Next ba’zan `Slow filesystem detected` deb ogohlantiradi — loyiha/network disklarda bo‘lsa (`QUVNA OBSIDIAN` ichida) dev sekin yoki noto‘g‘ri ishlashi mumkin; imkon bo‘lsa kodni lokal SSD papkaga ko‘chirib sinab ko‘ring.

**Eslatma:** PowerShellda **`&&`** ishlashi mumkin emas — alohida qatorlar yoki npm skriptlari ishlating.

## quvna.com — CI/CD

Repozitoriya: [github.com/Quvna/Quvna_web2](https://github.com/Quvna/Quvna_web2).

| Workflow | Tavsif |
|----------|--------|
| `CI` | `master` / `main` push yoki PR da `npm ci` + `npm run build` |
| `Deploy to quvna.com` | `master` ga push yoki qo‘lda (`workflow_dispatch`) — SSH orqali serverda `git` yangilaydi, `npm ci`, `npm run build`, `pm2 restart quvna_web2` |

**GitHub** → Settings → Secrets and variables → Actions:

- `VPS_HOST` — server IP yoki domeni
- `VPS_USER` — SSH foydalanuvchi
- `VPS_SSH_KEY` — to‘liq shaxsiy kalit (PEM, `-----BEGIN` …)

**Server (bir marta):** loyiha katalogi (`/var/www/quvna_web2` — workflow dagi kabi) ichida `git clone`, `npm ci`, `npm run build`, PM2: `pm2 start npm --name quvna_web2 -- start` (yoki `ecosystem.config` bilan `node` → `node_modules/.bin/next start`).

**Domen:** Nginx (yoki boshqa reverse proxy) `quvna.com` ni lokal `127.0.0.1:3000` ga, SSL — Certbot yoki panellar orqali.

CORS: brauzer to‘g‘ridan-to‘g‘ri API domeniga urilganda backend `https://quvna.com` (va kerakli subdomenlar) uchun CORS ruxsatini bering. Lokalda CORS muammosi bo‘lsa: `NEXT_PUBLIC_API_BASE_URL=/api-proxy` (Next rewrites) ishlatiladi.

## Muallif

Quvna Team
