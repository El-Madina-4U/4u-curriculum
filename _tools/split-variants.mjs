#!/usr/bin/env node
// يولد ملف مستقل لكل مسار من أى عرض فيه نسختين (only-a / only-b).
//
// ليه: الرابط بـ ?track=B مابيشتغلش على كل المتصفحات لما الملف محلى
// (file://) — فايرفوكس وبعض الطرق فى فتح الملف بيتجاهلوا الـ query خالص،
// فالمدرس بيفتح ويلاقى نسخة A وهو طالب B. الملف المستقل مافيهوش الاحتمال ده.
//
//   node _tools/split-variants.mjs
//
// المخرج جنب الأصل: <name>-A.slides.html و<name>-B.slides.html
// الأصل بيفضل مصدر الحقيقة — الملفين مولدين وممنوع التعديل فيهم.

import fs from 'node:fs';
import path from 'node:path';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(dirname(fileURLToPath(import.meta.url)), '..');

const decks = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith('_') || e.name.startsWith('.')) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.slides.html') && !/-[AB]\.slides\.html$/.test(e.name)) decks.push(p);
  }
})(ROOT);

const TRACKS = { A: 'only-b', B: 'only-a' };
let made = 0;

for (const deck of decks) {
  const src = fs.readFileSync(deck, 'utf8');
  if (!/class="[^"]*only-[ab]/.test(src)) continue;      // مافيهوش نسختين

  for (const [track, drop] of Object.entries(TRACKS)) {
    let s = src;

    // 1. المسار يتثبت على body
    s = s.replace(/(<body[^>]*\bdata-track=")[AB](")/, `$1${track}$2`);

    // 2. شرائح المسار التانى تتشال بالكامل — مش تتخفى بـ CSS
    const before = (s.match(/<section class="slide/g) || []).length;
    s = s.replace(
      new RegExp(`\\s*<section class="[^"]*\\b${drop}\\b[^"]*"[\\s\\S]*?<\\/section>`, 'g'), '');
    const after = (s.match(/<section class="slide/g) || []).length;

    // 3. العناصر الداخلية (p.inst.only-a وأخواتها) تتشال كمان
    s = s.replace(new RegExp(`\\s*<(\\w+)([^>]*\\bclass="[^"]*\\b${drop}\\b[^"]*")[^>]*>[\\s\\S]*?<\\/\\1>`, 'g'), '');

    // 4. تنبيه فى أول الملف إنه مولد
    s = s.replace('<!DOCTYPE html>',
      `<!DOCTYPE html>\n<!-- ملف مولد — ممنوع التعديل. المصدر: ${path.basename(deck)}\n`
      + `     أعد التوليد بـ: node _tools/split-variants.mjs -->`);

    const outFile = deck.replace('.slides.html', `-${track}.slides.html`);
    fs.writeFileSync(outFile, s);
    made++;
    console.log(`✓ ${path.relative(ROOT, outFile).replace(/\\/g, '/')}  —  ${after} شريحة (اتشال ${before - after})`);
  }
}

console.log(made ? `\nاتولد ${made} ملف` : 'مافيش عرض فيه نسختين');
