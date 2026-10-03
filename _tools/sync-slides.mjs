#!/usr/bin/env node
// يحقن CSS و JS من القالب فى كل ملفات الشرائح.
// عدّل _templates/session.slides.html ثم:   node _tools/sync-slides.mjs
// القالب يعلّم المقطعين بـ <!-- 4U:STYLE --> ... <!-- /4U:STYLE --> و <!-- 4U:SCRIPT --> ... <!-- /4U:SCRIPT -->

import { readFileSync, writeFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const tpl = readFileSync(join(ROOT, '_templates', 'session.slides.html'), 'utf8');

const grab = (src, tag) => {
  const m = src.match(new RegExp(`<!-- 4U:${tag} -->[\\s\\S]*?<!-- /4U:${tag} -->`));
  if (!m) throw new Error(`القالب لا يحتوى على علامة ${tag}`);
  return m[0];
};
const style = grab(tpl, 'STYLE');
const script = grab(tpl, 'SCRIPT');

let count = 0;
function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (!f.startsWith('_') && f !== 'assets') walk(p); continue; }
    if (!f.endsWith('.slides.html')) continue;
    let html = readFileSync(p, 'utf8');
    let changed = false;
    // مسار الخطوط نسبى لكل عرض — القالب يستخدم الرمز __FONTS__
    const fontsRel = relative(dirname(p), join(ROOT, '_shared', 'fonts')).replaceAll('\\', '/');
    for (const [tag, block0] of [['STYLE', style], ['SCRIPT', script]]) {
      const block = block0.replaceAll('__FONTS__', fontsRel);
      const re = new RegExp(`<!-- 4U:${tag} -->[\\s\\S]*?<!-- /4U:${tag} -->`);
      if (!re.test(html)) { console.warn(`⚠ ${p}: لا توجد علامة ${tag} — تخطى`); continue; }
      const next = html.replace(re, block);
      if (next !== html) { html = next; changed = true; }
    }
    if (changed) { writeFileSync(p, html); count++; console.log('✓ ' + p.replace(ROOT, '')); }
  }
}
for (const d of ['A-scratch', 'B-web', 'workshop']) if (existsSync(join(ROOT, d))) walk(join(ROOT, d));
console.log(`\nتم تحديث ${count} ملف`);
