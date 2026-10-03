#!/usr/bin/env node
// يفحص كل ملفات مشاريع Scratch فى المنهج بنيويا — قبل ما تتفتح قدام طفل.
// السبب: الملفات المولدة (after-A · debug) بتتعمل بتعديل JSON مباشر، وحذف
// بلوك بيسيب shadow يتيم أو parent مكسور — وScratch بيفتح الملف وبعدين
// يتصرف غلط من غير رسالة خطأ.
//   node _tools/check-sb3.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from './sb3.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// أصول بلا md5ext موجودة فى ملفات Raspberry Pi الأصلية نفسها — مش عيب عندنا
const srcMissing = new Set();
const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!e.name.endsWith('.sb3')) continue;
    if (p.includes('_src')) {
      const q = S.load(p);
      for (const t of q.project.targets)
        for (const a of [...(t.costumes || []), ...(t.sounds || [])])
          if (!a.md5ext) srcMissing.add(a.name);
    } else files.push(p);
  }
})(ROOT);

let bad = 0;
for (const f of files.sort()) {
  const rel = path.relative(ROOT, f).replace(/\\/g, '/');
  const errs = [];
  try {
    const p = S.load(f);
    const j = p.project;
    if (!j.targets?.some(t => t.isStage)) errs.push('مافيش Stage');

    for (const t of j.targets) {
      for (const [id, b] of Object.entries(t.blocks || {})) {
        if (typeof b !== 'object') continue;                  // متغير مختصر
        if (b.next && !t.blocks[b.next]) errs.push(`${t.name}: next مكسور فى ${b.opcode}`);
        if (b.parent && !t.blocks[b.parent]) errs.push(`${t.name}: parent مكسور فى ${b.opcode}`);
        for (const inp of Object.values(b.inputs || {}))
          if (Array.isArray(inp)) for (const q of inp)
            if (typeof q === 'string' && !t.blocks[q]) errs.push(`${t.name}: input مكسور فى ${b.opcode}`);
      }
      for (const a of [...(t.costumes || []), ...(t.sounds || [])]) {
        if (a.md5ext && !p.files.has(a.md5ext)) errs.push(`أصل ناقص من الأرشيف: ${a.name}`);
        if (!a.md5ext && !srcMissing.has(a.name)) errs.push(`أصل بلا md5ext: ${a.name}`);
      }
      // رسالة مستقبَلة ومش معرّفة على الستيج = بلوك ميت
      const known = new Set(Object.values(S.stage(j).broadcasts || {}));
      for (const b of Object.values(t.blocks || {})) {
        if (typeof b !== 'object') continue;
        const m = b.fields?.BROADCAST_OPTION?.[0];
        if (m && !known.has(m)) errs.push(`${t.name}: رسالة «${m}» مستقبَلة ومش معرّفة`);
      }
    }
  } catch (e) { errs.push('مابيتقريش: ' + e.message); }

  // حالات متوقعة: أخطاء مقصودة فى تحديات Debug It، وعيوب موجودة أصلا فى
  // ملفات Raspberry Pi اللى لسه ماتولدش منها حاجة (مسار A3 كله تحميل خام)
  const EXPECTED = [
    [/DB-A-10\.sb3$/, /رسالة «groww»/],
    [/A3[\\/]checkpoints/, /أصل بلا md5ext/],
  ];
  const uniq = [...new Set(errs)].filter(e =>
    !EXPECTED.some(([fp, ep]) => fp.test(f) && ep.test(e)));
  if (uniq.length) { bad++; console.log(`✗ ${rel}`); uniq.slice(0, 5).forEach(x => console.log('   · ' + x)); }
  else console.log(`✓ ${rel}`);
}

console.log(`\n${files.length} ملف · ${bad} فيه مشاكل`);
process.exit(bad ? 1 : 0);
