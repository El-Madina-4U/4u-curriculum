#!/usr/bin/env node
// ---------------------------------------------------------------------------
// fetch-fonts.mjs — ينزل خطوط Google المستخدمة فى مشاريع مسار B محليا
//
// ليه: level.md بيقول «بدون إنترنت»، و19 ملف مشروع بيحمّلوا 29 خط من
// fonts.googleapis.com. النت وقع فى المعمل = الصفحة تبان مختلفة عن اللقطات
// اللى فى الشرائح، والطفل يفتكر إنه غلط.
//
// النتيجة: _shared/web-fonts/ فيه ملفات woff2 + fonts.css، وكل مشروع بياخد
// نسخة جوه فولدره (fonts/) عشان يفضل مكتفى ذاتيا لما يتنسخ لجهاز الطفل
// أو يترفع على GitHub Pages.
//
//   node _tools/fetch-fonts.mjs            # تنزيل (محتاج نت — مرة واحدة)
//   node _tools/fetch-fonts.mjs --check    # يتأكد إن كل خط مطلوب موجود محليا
//
// بعد التنزيل: node _tools/make-web-checkpoints.mjs بيربط المشاريع بالنسخة
// المحلية بدل الروابط الخارجية.
// ---------------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CK = path.join(ROOT, 'B-web/B1/checkpoints');
const DEST = path.join(ROOT, '_shared/web-fonts');

// متصفح حديث عشان جوجل يرجع woff2 مش ttf
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
         + '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// ---------- 1. لم كل روابط جوجل من ملفات المشاريع ----------
function collectUrls() {
  const urls = new Set();
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      if (!/\.(html|css)$/i.test(e.name)) continue;
      const s = fs.readFileSync(p, 'utf8');
      for (const m of s.matchAll(/https:\/\/fonts\.googleapis\.com\/css2\?[^"')\s]+/g))
        urls.add(m[0].replace(/&amp;/g, '&'));
    }
  })(CK);
  return [...urls];
}

// كل رابط ممكن يجمع أكتر من family — بنفكهم عشان نعرف نعد
function familiesOf(url) {
  return [...url.matchAll(/family=([^&]+)/g)].map(m => decodeURIComponent(m[1]));
}

const urls = collectUrls();
const families = [...new Set(urls.flatMap(familiesOf))].sort();

if (process.argv.includes('--check')) {
  const css = path.join(DEST, 'fonts.css');
  if (!fs.existsSync(css)) {
    console.log(`✗ ${DEST} مش موجود — شغّل \`node _tools/fetch-fonts.mjs\` وانت على نت`);
    process.exit(1);
  }
  const have = fs.readFileSync(css, 'utf8');
  const missing = families.filter(f => !have.includes(`font-family: '${f.split(':')[0].replace(/\+/g, ' ')}'`));
  if (missing.length) { console.log(`✗ ${missing.length} خط ناقص: ` + missing.join(' · ')); process.exit(1); }
  console.log(`✓ ${families.length} خط كلهم موجودين محليا`);
  process.exit(0);
}

// ---------- 2. تنزيل ----------
fs.mkdirSync(DEST, { recursive: true });
console.log(`${urls.length} رابط · ${families.length} خط\n`);

let cssOut = `/* 4U — خطوط Google منزّلة محليا. اتولد بـ _tools/fetch-fonts.mjs\n`
           + `   السبب: المعمل ممكن يبقى من غير نت، ولازم الصفحة تطلع زى اللقطات. */\n\n`;
const seen = new Set();
let files = 0, skipped = 0;

for (const url of urls) {
  process.stdout.write(`  ${familiesOf(url).join(', ').slice(0, 60)} … `);
  let css;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    css = await r.text();
  } catch (e) { console.log('✗ ' + e.message); continue; }

  // كل src: url(...) يتنزل ويتبدل بمسار محلى
  const jobs = [...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)];
  for (const [, u] of jobs) {
    const name = u.split('/').slice(-3).join('-').toLowerCase();
    const dst = path.join(DEST, name);
    if (!fs.existsSync(dst)) {
      const b = await fetch(u, { headers: { 'User-Agent': UA } });
      fs.writeFileSync(dst, Buffer.from(await b.arrayBuffer()));
      files++;
    } else skipped++;
    css = css.split(u).join(name);
  }
  // بنشيل التكرار: نفس الخط ممكن يبقى فى أكتر من رابط
  for (const face of css.split(/(?=@font-face)/)) {
    const key = face.replace(/\s+/g, '');
    if (!key.startsWith('@font-face') || seen.has(key)) continue;
    seen.add(key); cssOut += face.trim() + '\n\n';
  }
  console.log('✓');
}

fs.writeFileSync(path.join(DEST, 'fonts.css'), cssOut);
const kb = fs.readdirSync(DEST).reduce((a, f) => a + fs.statSync(path.join(DEST, f)).size, 0) / 1024;
console.log(`\n✓ ${seen.size} @font-face · ${files} ملف جديد (${skipped} موجود) · ${Math.round(kb)} KB`);
console.log(`  فى ${path.relative(ROOT, DEST)}`);
console.log(`  الخطوة الجاية: node _tools/make-web-checkpoints.mjs`);
