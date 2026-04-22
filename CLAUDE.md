# Quvna Web - Next.js Frontend

@AGENTS.md

---

## Wiki Integration — Ikki Miya Tizimi

**Wiki Location:** `D:\QUVNA OBSIDIAN\Quvna\wiki\`

### Dual-Brain Architecture

Bu loyiha **ikki miya** tizimi bilan ishlaydi:

1. **Session Brain (Joriy Xotira)** — Hozirgi suhbatdagi task, plan, kod o'zgarishlari
2. **Wiki Brain (Doimiy Xotira)** — Barcha sesiyalar bo'ylab to'plangan bilim

### AI Agent Qoidalari

Agar siz AI agent bo'lsangiz va bu loyihada ishlayotgan bo'lsangiz:

#### 1. Session Boshida (LOAD)
```
1. Wiki'ni o'qi: D:\QUVNA OBSIDIAN\Quvna\wiki\index.md
2. Bu loyiha haqida: D:\QUVNA OBSIDIAN\Quvna\wiki\entities\WebApp.md
3. Bog'liq feature'lar: wiki/features/ papkasidan tegishli fayllar
```

#### 2. Ish Jarayonida (SYNC)
Har bir muhim o'zgarishda wiki'ni yangilang:

**Yangilanadigan holatlar:**
- ✅ Yangi feature qo'shildi → `wiki/features/FeatureName.md` yarating
- ✅ Arxitektura o'zgardi → `wiki/entities/WebApp.md` yangilang
- ✅ Muhim qaror qabul qilindi → `wiki/decisions/ADR-XXX.md` yarating
- ✅ API endpoint o'zgardi → `wiki/entities/WebApp.md` hooks bo'limini yangilang
- ✅ Yangi sahifa qo'shildi → `wiki/entities/WebApp.md` pages jadvalini yangilang

**Yozish formati:**
```markdown
## [YYYY-MM-DD HH:MM] ingest | <qisqa sarlavha>

Task: <task ID yoki tavsif>
Changes:
- <o'zgarish 1>
- <o'zgarish 2>

Files: <o'zgargan fayllar ro'yxati>
```

#### 3. Task/Plan Tracking

Har bir task yoki plan yaratganingizda:

1. **Session'da** — TaskCreate/Plan bilan ishlang
2. **Wiki'da** — `wiki/log.md` ga qo'shing:
   ```markdown
   ## [2026-04-20 19:59] task | <task nomi>
   Status: in_progress
   Goal: <maqsad>
   Key files: <asosiy fayllar>
   ```

3. **Task tugaganda** — wiki'ni yangilang:
   ```markdown
   ## [2026-04-20 20:15] task | <task nomi> ✅
   Status: completed
   Result: <natija>
   Wiki updated: <yangilangan wiki sahifalar>
   ```

#### 4. Kalit Momentlar (Key Moments)

Faqat **muhim** momentlarni saqlang (joy tejash uchun):

**✅ Saqlash kerak:**
- Yangi feature/modul qo'shildi
- Breaking change
- Arxitektura qarorlari
- API o'zgarishlari
- Bug fix (agar takrorlanishi mumkin bo'lsa)

**❌ Saqlamaslik kerak:**
- Oddiy typo tuzatish
- CSS styling o'zgarishlari
- Console.log qo'shish/o'chirish
- Vaqtinchalik debug kod

#### 5. Ixcham Yozish (Compact Format)

Joy tejash uchun:
- Faqat o'zgargan fayl nomlari (to'liq path emas)
- Qisqa bullet point'lar
- Kod snippet'lar emas, faqat tavsif
- Har bir log entry maksimum 5-7 qator

**Yaxshi misol:**
```markdown
## [2026-04-20 19:59] ingest | Shorts video mute button qo'shildi
- ShortVideoPlayer.tsx: mute state + toggle
- globals.css: .mute-btn style
Result: Video ovozini on/off qilish mumkin
```

**Yomon misol (juda uzun):**
```markdown
## [2026-04-20 19:59] ingest | Video player'ga mute funksiyasi qo'shildi

Men bugun video player komponentiga mute button qo'shdim. 
Avval foydalanuvchilar ovozni o'chira olmas edi...
[50 qator kod snippet]
[10 qator tushuntirish]
```

---

## Wiki Struktura

```
wiki/
├── index.md              ← Barcha sahifalar katalogi
├── log.md                ← Faoliyat jurnali (append-only)
├── entities/WebApp.md    ← Bu loyiha haqida
├── features/             ← Feature hujjatlari
├── concepts/             ← Arxitektura patternlar
└── decisions/            ← ADR'lar
```

---

## Misol: Yangi Feature Qo'shish

```bash
# 1. Session'da task yarating
TaskCreate: "Add video download button"

# 2. Kod yozing
# ... ShortVideoPlayer.tsx o'zgartirish ...

# 3. Wiki'ni yangilang
echo "## [2026-04-20 20:00] ingest | Video download button
- ShortVideoPlayer.tsx: download action
- useMedia.ts: useDownloadVideo hook
- Backend: GET /api/video/download/{id}
Status: ✅ Tayyor" >> D:\QUVNA OBSIDIAN\Quvna\wiki\log.md

# 4. Feature sahifasini yarating/yangilang
# wiki/features/WebVideoDownload.md

# 5. Index'ni yangilang
# wiki/index.md ga qo'shing
```

---

## Eslatma

- Wiki faqat **doimiy bilim** uchun
- Session state (task, plan) **vaqtinchalik**
- Har 10-15 muhim o'zgarishda wiki'ni yangilang
- Kichik o'zgarishlarni batch qiling (birlashtirib yozing)