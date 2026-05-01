<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Skill Mapping (Project Local Guide)

Bu loyiha `C:\Users\Сomp X\.claude\skills\` ichidagi skilllardan foydalanadi. Skill fayllarini bu repo ichiga ko'chirmang; bu yerda faqat qaysi skillni qachon chaqirish kerakligi yoziladi.

### Core Skills (Always Prefer)

- `agent-coder`: default kod yozish, refactor, fix, test.
- `quvna-web`: Quvna web stack, tokenlar, API patternlari, frontend qoidalari.

### UI / Design

- `figma-capture`: Figma dizaynni olish, ko'rish, implementatsiyaga tayyorlash.
- `gsd-sketch`: tezkor UI variantlar (throwaway HTML mockup).
- `gsd-ui-review`: retro UI audit (6 pillar).

### Planning / Delivery

- `gsd-fast`: trivial tasklarni tez bajarish (kam overhead).
- `gsd-plan-phase`: phase-level plan tuzish.
- `gsd-execute-phase`: phase planlarni wave-based bajarish.
- `gsd-verify-work`: conversational UAT va tekshiruv.

### Quality / Safety

- `gsd-code-review`: bug, risk, code quality review.
- `gsd-code-review-fix`: review topilmalarini auto-fix.
- `security-audit`: auth, user data, API security-sensitive o'zgarishlar.

### GitHub Workflow (When Needed)

- `github-automation`: PR, issue, review, workflow avtomatlashtirish.

### Trigger Notes

- Figma URL yoki "figmadan ol" bo'lsa: avval `figma-capture`.
- Quvna UI/API tasklari: avval `quvna-web`, keyin `agent-coder`.
- Katta/noaniq ishlar: `gsd-plan-phase` -> `gsd-execute-phase`.
- "review" so'rovi: `gsd-code-review` (finding-first format).

## UI Fix Instruksiya (Parent-first)

`D:\QUVNA OBSIDIAN\ui_fix_instruksiya.txt` bo'yicha doimiy qoida:

- UI muammo ko'pincha parent/wrapperda; faqat childni emas, avval parentni tuzat.
- Majburiy anti-squeeze pattern: `w-full`, `min-w-0`, `box-border`.
- Card struktura: `header -> content-wrapper -> footer` va bloklar orasida aniq spacer (`h-6`/`h-8`) ishlat.
- Spacing diapazoni: section gap `24-32px`, card padding `16-24px`, element gap `12-20px`.
- Grid breakpoint: mobile `1fr`, desktop `1fr 420px` (yoki kontekstga mos kengroq variant).
- DOM path bo'yicha cheklayotgan parentni topib fix qil; kerak bo'lsa avval inline smoke-test, keyin Tailwindga qaytar.
