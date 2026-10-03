#!/usr/bin/env node
// يفحص كل لوحات الألوان فى مشاريع مسار B على معيار WCAG AA (نسبة 4.5:1).
// السبب: S09 بتعلّم التباين وبتطلب من الطفل «الكلام باين؟» — فلوحة راسبة
// فى الفحص بتخلى الدرس نفسه غلط.
//   node _tools/check-contrast.mjs
//   node _tools/check-contrast.mjs --min 3   # حد أدنى مختلف (نص كبير)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIN = +(process.argv.includes('--min') ? process.argv[process.argv.indexOf('--min') + 1] : 4.5);

const hex = h => {
  h = h.replace('#', '').trim();
  if (h.length === 3) h = [...h].map(c => c + c).join('');
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16));
};
// النسبة حسب WCAG 2.1
const lum = rgb => {
  const [r, g, b] = rgb.map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [x, y] = [lum(hex(a)), lum(hex(b))].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

// الأزواج اللى بيستخدمها المشروع: كل خلفية ولون كلامها
const PAIRS = [
  ['--primary', '--onprimary'], ['--secondary', '--onsecondary'],
  ['--tertiary', '--ontertiary'], ['--page', '--onpage'],
  ['--detail', '--ondetail'], ['--detail2', '--ondetail2'],
];

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.css')) files.push(p);
  }
})(path.join(ROOT, 'B-web/B1/checkpoints'));

// لوحة واحدة ممكن تتكرر فى كذا مشروع — بنفحصها مرة
const byName = new Map();
for (const f of files) {
  const name = path.basename(f);
  if (byName.has(name)) { byName.get(name).copies++; continue; }
  const src = fs.readFileSync(f, 'utf8');
  const vars = {};
  for (const m of src.matchAll(/(--[a-z0-9-]+):\s*(#[0-9a-fA-F]{3,8})/g)) vars[m[1]] = m[2];
  if (!vars['--primary'] && !vars['--page']) continue;
  byName.set(name, { file: f, vars, copies: 1 });
}

let bad = 0;
for (const [name, { vars, copies }] of [...byName].sort()) {
  const fails = [];
  for (const [bg, fg] of PAIRS) {
    if (!vars[bg] || !vars[fg]) continue;
    const r = ratio(vars[bg], vars[fg]);
    if (r < MIN) {
      // الأبيض ولا الأسود أحسن على الخلفية دى؟
      const best = ratio(vars[bg], '#000000') > ratio(vars[bg], '#ffffff') ? '#000000' : '#ffffff';
      fails.push(`${fg} ${vars[fg]} على ${bg} ${vars[bg]} = ${r.toFixed(2)}`
        + `  ←  ${best} يدى ${ratio(vars[bg], best).toFixed(2)}`);
    }
  }
  if (fails.length) {
    bad++;
    console.log(`✗ ${name}${copies > 1 ? `  (×${copies} نسخة)` : ''}`);
    fails.forEach(x => console.log('   · ' + x));
  }
}

console.log(`\n${byName.size} ملف · ${bad} راسب فى ${MIN}:1`);
process.exit(bad ? 1 : 0);
