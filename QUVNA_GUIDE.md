# Quvna Web2 — To'liq Qo'llanma
## (Claude Code, Skills, Obsidian va Loyiha Arxitekturasi)

---

## 1. LOYIHA NIMA?

**Quvna** — O'zbekiston uchun gaming video streaming platformasi.  
TikTok/YouTube analogu: Shorts, Jonli Efirlar, Turnirlar, Mini O'yinlar, Game Klublar.

**Maqsad:** Quvna mobil ilovasi uchun web versiya (Next.js).

---

## 2. TEXNOLOGIYALAR STACK

| Texnologiya | Versiya | Maqsad |
|---|---|---|
| Next.js | 16.2.4 | App Router — asosiy framework |
| React | 19.2.4 | UI |
| TypeScript | strict | Tip xavfsizligi |
| Tailwind CSS | 4.x | Stillar (`@import "tailwindcss"` via globals.css) |
| @tanstack/react-query | 5 | Server state — API ma'lumotlari |
| Zustand | 5 | Client state — Auth |
| Axios | 1.x | HTTP client |
| lucide-react | 1.x | Ikonlar |
| react-player | 3.x | Video ijro |

---

## 3. LOYIHA FAYL TUZILMASI

```
quvna_web2/
├── src/
│   ├── app/                          # Next.js App Router sahifalari
│   │   ├── layout.tsx                # Root layout: Sidebar + Topbar + BottomNav
│   │   ├── page.tsx                  # Home sahifasi
│   │   ├── globals.css               # BARCHA CSS classlar shu yerda
│   │   ├── providers.tsx             # ReactQuery + Zustand wrapper
│   │   ├── auth/
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── videos/page.tsx           # Shorts, Foydalanuvchilar, Videolar tabs
│   │   ├── stream/page.tsx           # Jonli efirlar grid
│   │   ├── profile/page.tsx          # Profil sahifasi
│   │   ├── rating/page.tsx           # Reyting (PUBG UC, Steam, ML, Free Fire)
│   │   ├── notifications/page.tsx    # Bildirishnomalar
│   │   ├── donate/page.tsx           # Donat
│   │   ├── game-clubs/page.tsx       # Game klublar
│   │   ├── games/page.tsx            # O'yinlar
│   │   ├── miniapp/page.tsx          # Mini ilovalar
│   │   └── tournaments/page.tsx      # Turnirlar
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Chap sidebar (desktop)
│   │   │   ├── Topbar.tsx            # Yuqori panel
│   │   │   └── BottomNav.tsx         # Quyi navigatsiya (mobile)
│   │   ├── home/
│   │   │   ├── HomeBanner.tsx
│   │   │   ├── HomeDonate.tsx
│   │   │   ├── HomeTournaments.tsx
│   │   │   ├── HomeMiniApps.tsx
│   │   │   └── HomeGameClubs.tsx
│   │   ├── videos/
│   │   │   ├── ShortVideoPlayer.tsx  # Bitta short video player
│   │   │   ├── ShortsFullScreen.tsx  # Full-screen feed (IntersectionObserver)
│   │   │   ├── CommentsSheet.tsx     # Bottom sheet izohlar
│   │   │   ├── ShortsTab.tsx
│   │   │   ├── UsersTab.tsx          # Foydalanuvchilar grid
│   │   │   └── VideosTab.tsx         # Video grid (YouTube uslubi)
│   │   └── ui/
│   │       ├── SectionTitle.tsx
│   │       └── Skeleton.tsx
│   │
│   ├── hooks/
│   │   ├── useMedia.ts               # useInfiniteShorts, useLikeVideo, useFollowUser
│   │   ├── useHome.ts                # Home API hooks
│   │   ├── useProfile.ts             # Profil hooks
│   │   ├── useRating.ts              # Reyting hooks
│   │   └── useNotifications.ts       # Bildirishnoma hooks
│   │
│   ├── lib/
│   │   ├── api.ts                    # Axios singleton, Bearer token, 401 auto-refresh
│   │   ├── constants.ts              # BASE_URL, CDN_BASE_URL, WS_URL
│   │   └── utils.ts                  # cn(), formatCount(), timeAgo(), cdnUrl()
│   │
│   └── store/
│       └── auth.store.ts             # Zustand auth (persist → localStorage "quvna-auth")
│
├── .planning/                        # GSD planning tizimi
│   ├── STATE.md                      # Joriy holat va progress
│   └── phases/
│       └── 01-video-page/            # Phase 01 (yakunlangan)
│           ├── PLAN.md
│           └── SUMMARY.md
│
├── AGENTS.md                         # Claude uchun ko'rsatmalar
├── CLAUDE.md                         # @AGENTS.md havolasi
└── QUVNA_GUIDE.md                    # Bu fayl
```

---

## 4. DIZAYN TIZIMI

### CSS Custom Properties (`globals.css`)
```css
--primary: #03FF93        /* Yashil — asosiy rang */
--bg-dark: #141414        /* Qora fon */
--bg-card: #1C1C1C        /* Karta foni */
```

### QOIDALAR
- **INLINE STYLE ISHLATILMAYDI** — hamma stil `globals.css` da class sifatida
- `cn()` utility: `clsx + tailwind-merge` kombinatsiyasi
- Mobile-first dizayn: `BottomNav` mobil, `Sidebar` desktop

---

## 5. BACKEND API

| | |
|---|---|
| Base URL | `http://95.130.227.48:8066` |
| CDN | `https://quvna-live.b-cdn.net` |
| WebSocket | `ws://quvna.dominantsoftdevelopment.uz` (hali ishlatilmagan) |

### `src/lib/api.ts` — Axios Singleton
- Bearer token avtomatik qo'shiladi
- 401 javobda avtomatik refresh token + retry
- Constants: `src/lib/constants.ts` dan olinadi

---

## 6. STATE MANAGEMENT

### Server State — React Query
```typescript
// hooks/useMedia.ts
useInfiniteShorts()    // Shorts infinite scroll
useLikeVideo()         // Mutation
useFollowUser()        // Mutation
useSendComment()       // Mutation
```

### Client State — Zustand
```typescript
// store/auth.store.ts
// localStorage: "quvna-auth" kalitida persist
// auth: { user, token, refreshToken, setAuth, logout }
```

---

## 7. CLAUDE CODE BILAN ISHLASH

### Claude Code nima?
Claude Code — Anthropic'ning CLI vositasi. Terminal orqali loyihada ishlaydigan AI assistant.

### Asosiy buyruqlar
```bash
claude          # Interaktiv chat rejimi
claude "..."    # Bir martalik buyruq
```

---

## 8. SKILLS (MAXSUS BUYRUQLAR) — TO'LIQ RO'YXAT

Skills — `/` belgisi bilan chaqiriladigan maxsus buyruqlar.

### GSD (Get Stuff Done) — Loyiha Boshqaruvi

| Skill | Maqsad |
|---|---|
| `/gsd-new-project` | Yangi loyihani boshlash (tadqiqot + roadmap) |
| `/gsd-discuss-phase` | Keyingi phase'ni muhokama qilish |
| `/gsd-plan-phase` | Phase uchun batafsil PLAN.md yaratish |
| `/gsd-execute-phase` | Phase'ni bajarish (kod yozish) |
| `/gsd-verify-work` | Bajarilgan ishni tekshirish |
| `/gsd-progress` | Joriy holat va progress ko'rish |
| `/gsd-next` | Keyingi mantiqiy qadamga o'tish |
| `/gsd-quick` | Tez vazifa bajarish |
| `/gsd-fast` | Juda oddiy inline vazifa |
| `/gsd-resume-work` | Oldingi sessiyadan davom ettirish |
| `/gsd-pause-work` | Ishni to'xtatish va kontekst saqlash |

### Kod Sifati

| Skill | Maqsad |
|---|---|
| `/gsd-code-review` | Kod tekshiruvi (REVIEW.md yaratadi) |
| `/gsd-code-review-fix` | Tekshiruv natijalarini avtomatik tuzatish |
| `/gsd-secure-phase` | Xavfsizlik tekshiruvi |
| `/gsd-validate-phase` | Phase to'liqligini tekshirish |
| `/gsd-ui-review` | UI/vizual audit (6 o'lchovda) |
| `/gsd-debug` | Sistemali debug sessiyasi |

### Hujjatlar va Tahlil

| Skill | Maqsad |
|---|---|
| `/gsd-map-codebase` | Kod bazasini xaritalash va tahlil qilish |
| `/gsd-scan` | Tez kod bazasi baholash |
| `/gsd-docs-update` | Hujjatlarni yangilash |
| `/gsd-milestone-summary` | Milestone yakuniy xisobot |
| `/gsd-session-report` | Sessiya xisoboti |

### Boshqalar

| Skill | Maqsad |
|---|---|
| `/simplify` | Kodni soddalashtirish va optimallashtirish |
| `/security-audit` | Xavfsizlik skanerlash |
| `/gsd-sketch` | UI/dizayn eskizlash |
| `/gsd-spike` | G'oyani tez sinab ko'rish |
| `/gsd-research-phase` | Phase tadqiqoti |
| `/gsd-add-phase` | Roadmapga yangi phase qo'shish |
| `/gsd-new-milestone` | Yangi milestone boshlash |
| `/gsd-health` | Planning papkasi salomatligi |
| `/gsd-stats` | Loyiha statistikasi |
| `/gsd-help` | Barcha GSD buyruqlarini ko'rish |

---

## 9. GSD WORKFLOW — QANDAY ISHLAYDI?

```
Yangi phase boshlash:
1. /gsd-discuss-phase    → Nima qilishni muhokama qil
2. /gsd-plan-phase       → Batafsil rejani tuzing (PLAN.md)
3. /gsd-execute-phase    → Kodni yozing
4. /gsd-verify-work      → Ishni tekshiring
5. /gsd-code-review      → Kod sifatini tekshiring (ixtiyoriy)

Tezkor vazifa:
/gsd-quick "Topbar da search inputi qo'sh"

Davom ettirish:
/gsd-resume-work         → Oldingi sessiyadan davom et
```

### Planning Fayl Tuzilmasi
```
.planning/
├── STATE.md              # Joriy holat (har doim yangi)
├── codebase/             # Kod bazasi tahlili
└── phases/
    └── 01-video-page/
        ├── PLAN.md       # Batafsil reja
        └── SUMMARY.md    # Yakuniy xisobot
```

---

## 10. OBSIDIAN BILAN INTEGRATSIYA

### Obsidian nima bu loyihada?
Loyiha papkasi `d:\QUVNA OBSIDIAN\quvna_web2\` — Obsidian vault ichida.  
Bu degani: loyiha fayllari va Obsidian notes bir joyda.

### Qanday ishlatish mumkin?
- `QUVNA_GUIDE.md` (bu fayl) — Obsidian'da to'liq ko'rinadi
- `.planning/` papkasidagi `.md` fayllar — Obsidian'da wiki ko'rinishida
- `[[wiki-links]]` sintaksisi ishlaydi
- GSD'ning `PLAN.md`, `SUMMARY.md` fayllarini Obsidian'da ko'rish mumkin

### Obsidian'da Wiki Yaratish
Har bir phase'dan keyin:
```
.planning/phases/02-stream-page/
├── PLAN.md       → Obsidian'da: Phase 02 rejasi
├── SUMMARY.md    → Obsidian'da: Nima qilindi
└── NOTES.md      → Obsidian'da: Shaxsiy eslatmalar
```

---

## 11. CLAUDE MEMORY TIZIMI

Claude sessiyalar orasida ma'lumot saqlab qoladi:

```
C:\Users\Сomp X\.claude\projects\d--QUVNA-OBSIDIAN-quvna-web2\memory\
├── MEMORY.md              # Indeks (har doim yuklanadi)
├── project_overview.md    # Loyiha arxitekturasi
├── phase01_status.md      # Phase 01 holati
└── [yangi fayllar...]
```

**Nima saqlanadi:** Loyiha holati, foydalanuvchi afzalliklari, muhim qarorlar  
**Nima saqlanmaydi:** Fayl tuzilmasi, kod, git tarix (bular kod dan olinadi)

---

## 12. PHASE 01 — NIMA QILINDI (YAKUNLANGAN)

**Video Sahifasi** — TikTok/Instagram Reels uslubi

### Bajarilgan komponentlar:
- `ShortVideoPlayer.tsx` — tap play/pause, double-tap like, mute, progress bar
- `ShortsFullScreen.tsx` — IntersectionObserver, snap scroll, infinite load
- `CommentsSheet.tsx` — bottom sheet, izohlar ro'yxati va input
- `UsersTab.tsx` — foydalanuvchilar grid (API dan)
- `VideosTab.tsx` — video grid (YouTube uslubi)
- `videos/page.tsx` — 3 tab: Shorts | Foydalanuvchilar | Videolar

### Hooks:
- `useInfiniteShorts()` — `/api/video/all/video`, size=20, infinite scroll
- `useLikeVideo()`, `useFollowUser()`, `useSendComment()` — mutations

---

## 13. KEYINGI PHASELAR (REJALASHTIRILGAN)

| Phase | Mavzu | Holat |
|---|---|---|
| Phase 02 | Stream detail (WebSocket jonli efir) | Rejalashtirilmagan |
| Phase 03 | Auth oqimi (login/register to'liq) | Rejalashtirilmagan |
| Phase 04 | Tournaments/GameClubs detail | Rejalashtirilmagan |
| Phase 05 | Profile tahrirlash, video yuklash | Rejalashtirilmagan |

---

## 14. YANGI CLAUDE SESSION BOSHLASH

Har yangi sessiyada Claude avtomatik eslab qoladi, lekin quyidagini aytish tavsiya:

```
/gsd-resume-work
```

Yoki:
```
Quvna web2 loyihasida ishlayapmiz. Keyingi phase'ni boshlashim kerak.
```

---

## 15. MUHIM QOIDALAR (CLAUDE UCHUN)

1. **Inline style ishlatma** — faqat `globals.css` da class
2. **`cn()` ishlat** — `clsx + tailwind-merge`
3. **API call** — faqat `src/lib/api.ts` orqali (Axios singleton)
4. **Constants** — `src/lib/constants.ts` dan olish
5. **Next.js 16 hujjatlari** — `node_modules/next/dist/docs/` dan o'qi (breaking changes bor!)
6. **Phase bajarilgandan keyin** — `.planning/phases/XX/SUMMARY.md` yozish
7. **STATE.md** — har phase'dan keyin yangilash

---

## 16. TEZKOR CHEATSHEET

```bash
# Loyiha holati
/gsd-progress

# Yangi ish boshlash
/gsd-discuss-phase
/gsd-plan-phase
/gsd-execute-phase

# Tez vazifa
/gsd-quick "vazifa tavsifi"

# Kod tekshiruvi
/gsd-code-review
/gsd-ui-review

# Debug
/gsd-debug

# Davom ettirish
/gsd-resume-work
```

---

## 17. LOYIHANI ISHGA TUSHIRISH

### Development Server

**Loyiha joylashuvi:**
```
D:\QUVNA OBSIDIAN\3. Quvna_web\
```

### Bosqichma-bosqich ishga tushirish:

#### 1. Loyiha papkasiga o'tish
```bash
cd "/d/QUVNA OBSIDIAN/3. Quvna_web"
```

#### 2. Dependencies o'rnatish (birinchi marta)
```bash
npm install
# yoki
yarn install
# yoki
pnpm install
```

#### 3. Development server ishga tushirish
```bash
npm run dev
# yoki
yarn dev
# yoki
pnpm dev
```

#### 4. Brauzerda ochish
```
http://localhost:3000
```

### Mavjud scriptlar:

| Script | Buyruq | Maqsad |
|---|---|---|
| Development | `npm run dev` | Dev server (hot reload) |
| Build | `npm run build` | Production build |
| Start | `npm start` | Production server (build keyin) |
| Lint | `npm run lint` | ESLint tekshiruvi |
| Type check | `npx tsc --noEmit` | TypeScript xatolarini tekshirish |

### Port band bo'lsa:

Agar 3000 port band bo'lsa, Next.js avtomatik boshqa port taklif qiladi (3001, 3002...).

Yoki qo'lda port belgilash:
```bash
PORT=3001 npm run dev
```

### Environment Variables

`.env.local` faylida:
```env
NEXT_PUBLIC_API_URL=http://95.130.227.48:8066
NEXT_PUBLIC_CDN_URL=https://quvna-live.b-cdn.net
NEXT_PUBLIC_WS_URL=ws://quvna.dominantsoftdevelopment.uz
```

### Muammolarni hal qilish:

**1. Port band:**
```bash
# Windows'da portni bo'shatish
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**2. Node modules muammosi:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**3. Cache tozalash:**
```bash
rm -rf .next
npm run dev
```

**4. TypeScript xatolari:**
```bash
npx tsc --noEmit
```

### Hot Reload

Next.js avtomatik hot reload qiladi:
- Fayl o'zgarsa → brauzer avtomatik yangilanadi
- Komponent o'zgarsa → state saqlanadi (Fast Refresh)
- `globals.css` o'zgarsa → stil avtomatik yangilanadi

---

## 18. VIDEO YARATISH (RASMLARDAN REKLAMA)

### FFmpeg bilan rasmlardan video yaratish

**Maqsad:** Bir nechta rasmdan professional reklama video yaratish (fade transition'lar bilan)

### Bosqichma-bosqich jarayon:

#### 1. FFmpeg o'rnatish
```bash
# Windows (winget orqali)
winget install --id=Gyan.FFmpeg -e --silent
```

#### 2. FFmpeg yo'lini topish
```bash
# Winget packages papkasida
ls "/c/Users/[USERNAME]/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin"
```

#### 3. Video yaratish buyrug'i
```bash
FFMPEG="/c/Users/[USERNAME]/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe"

cd "/d/QUVNA OBSIDIAN/quvna videos"

"$FFMPEG" \
  -loop 1 -t 5 -i "rasm1.png" \
  -loop 1 -t 5 -i "rasm2.png" \
  -loop 1 -t 5 -i "rasm3.png" \
  -filter_complex "\
    [0:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=t=in:st=0:d=0.5,fade=t=out:st=4.5:d=0.5[v0];\
    [1:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=t=in:st=0:d=0.5,fade=t=out:st=4.5:d=0.5[v1];\
    [2:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,setsar=1,fade=t=in:st=0:d=0.5,fade=t=out:st=4.5:d=0.5[v2];\
    [v0][v1][v2]concat=n=3:v=1:a=0,format=yuv420p[v]" \
  -map "[v]" -c:v libx264 -preset medium -crf 23 -r 30 -movflags +faststart \
  "output_video.mp4"
```

### Parametrlar tushuntirish:

| Parametr | Maqsad |
|---|---|
| `-loop 1 -t 5` | Har bir rasmni 5 sekund ko'rsatish |
| `scale=1920:1080` | Full HD o'lchamga keltirish |
| `force_original_aspect_ratio=decrease` | Aspect ratio saqlab qolish |
| `pad=1920:1080:(ow-iw)/2:(oh-ih)/2` | Markazga joylashtirish (qora border) |
| `fade=t=in:st=0:d=0.5` | 0.5 sekund fade in |
| `fade=t=out:st=4.5:d=0.5` | 0.5 sekund fade out |
| `concat=n=3:v=1:a=0` | 3 ta videoni birlashtirish (audio yo'q) |
| `-c:v libx264` | H.264 codec |
| `-preset medium` | Sifat/tezlik balansi |
| `-crf 23` | Sifat (18-28, past = yuqori sifat) |
| `-r 30` | 30 FPS |
| `-movflags +faststart` | Web uchun optimallash |

### Misol: Quvna reklama video (2026-04-24)

**Input rasmlar:**
1. hopme page Asosiy.png
2. Live.png
3. Shorts.png
4. Sovg'a chat.png
5. Donat qilish.png
6. Гайд.png

**Output:**
- Fayl: `quvna_reklama_30sec.mp4`
- Davomiyligi: 30 sekund (6 rasm × 5 sek)
- Sifat: Full HD 1920x1080
- Hajm: ~719 KB
- Effektlar: Fade in/out transitions

### Qo'shimcha imkoniyatlar:

**Musiqa qo'shish:**
```bash
-i "background_music.mp3" -shortest
```

**Matn qo'shish:**
```bash
drawtext=text='QUVNA':fontsize=72:fontcolor=white:x=(w-text_w)/2:y=100
```

**Har xil davomiylik:**
```bash
-loop 1 -t 3 -i "rasm1.png"  # 3 sekund
-loop 1 -t 7 -i "rasm2.png"  # 7 sekund
```

---

*Yaratildi: 2026-04-18 | Yangilandi: 2026-04-24 | Claude Code (claude-sonnet-4-6)*
