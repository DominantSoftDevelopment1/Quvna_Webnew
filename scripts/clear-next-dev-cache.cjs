/**
 * Stale Turbopack / dev lock uchun `.next/dev` ni tozalash.
 * Ishlatishdan oldin eski `next dev` jarayonini to'xtating (Ctrl+C yoki taskkill).
 */
"use strict";

const fs = require("fs");
const path = require("path");

const targets = [".next/dev"];
const root = process.cwd();

for (const rel of targets) {
  const abs = path.join(root, rel);
  try {
    fs.rmSync(abs, { recursive: true, force: true });
    process.stderr.write(`[clear-next-dev-cache] o'chirildi: ${rel}\n`);
  } catch (_) {
    /* yo'q bo'lsa shunchaki davom etamiz */
  }
}
