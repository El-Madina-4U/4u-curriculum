#!/usr/bin/env node
// يعيد حساب عمود «البنوك» فى خريطة جلسات level.md من frontmatter الجلسات نفسها.
// القاعدة: العمود = banks: بتاعة الجلسة، ناقص بطاقات SK (ليها جدول مستقل)،
// مرتبة ترتيبا ثابتا: UP → UP-M → PS → DB → AN.
//
//   node _tools/sync-level-banks.mjs              # تقرير فروق لكل المستويات
//   node _tools/sync-level-banks.mjs --write B1   # يكتب التعديل فى مستوى واحد

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const LEVELS = {
  A1: 'A-scratch/A1', A2: 'A-scratch/A2', A3: 'A-scratch/A3',
  B1: 'B-web/B1', B2: 'B-web/B2',
};

// أسبقية النوع فى العمود
const RANK = id =>
  /^UP-M-/.test(id) ? 1 :
  /^UP-/.test(id)   ? 0 :
  /^PS-/.test(id)   ? 2 :
  /^DB-/.test(id)   ? 3 :
  /^AN-/.test(id)   ? 4 : 5;

function banksOf(sessionFile) {
  const src = readFileSync(sessionFile, 'utf8').replace(/\r\n/g, '\n');
  const m = src.match(/^banks:\s*\[([^\]]*)\]/m);
  if (!m) return [];
  return m[1].split(',').map(s => s.trim()).filter(Boolean);
}

function expected(sessionFile) {
  const ids = banksOf(sessionFile).filter(id => !/^SK-/.test(id));
  // إزالة التكرار مع الحفاظ على أول ظهور داخل نفس الرتبة
  const seen = new Set();
  const uniq = ids.filter(id => (seen.has(id) ? false : (seen.add(id), true)));
  uniq.sort((a, b) => RANK(a) - RANK(b) || a.localeCompare(b));
  return uniq.map(id => '`' + id + '`').join(' ');
}

function run(lv, write) {
  const dir = join(ROOT, LEVELS[lv]);
  const levelFile = join(dir, 'level.md');
  if (!existsSync(levelFile)) return null;

  let src = readFileSync(levelFile, 'utf8').replace(/\r\n/g, '\n');
  const diffs = [];

  // صفوف خريطة الجلسات: | `Sxx` | ... | البنوك |  (6 أعمدة)
  const out = src.split('\n').map(line => {
    const m = line.match(/^\|\s*`(S\d{2})`\s*\|/);
    if (!m) return line;
    const cells = line.split('|');
    if (cells.length !== 8) return line;          // '' + 6 أعمدة + ''
    const sess = join(dir, 'sessions', m[1] + '.md');
    if (!existsSync(sess)) return line;

    const want = expected(sess);
    const have = cells[6].trim();
    if (want === have) return line;
    diffs.push({ s: m[1], have, want });
    cells[6] = ' ' + want + ' ';
    return cells.join('|');
  }).join('\n');

  if (write && diffs.length) writeFileSync(levelFile, out, 'utf8');
  return diffs;
}

const write = process.argv.includes('--write');
const only = process.argv.find(a => LEVELS[a]);
let total = 0;

for (const lv of Object.keys(LEVELS)) {
  if (only && lv !== only) continue;
  const diffs = run(lv, write && (!only || lv === only));
  if (diffs === null) continue;
  if (!diffs.length) { console.log(`✓ ${lv} — عمود البنوك مطابق`); continue; }
  total += diffs.length;
  console.log(`${write ? '✎' : '✗'} ${lv} — ${diffs.length} صف مختلف`);
  for (const d of diffs) {
    console.log(`   ${d.s}`);
    console.log(`     الحالى : ${d.have || '(فاضى)'}`);
    console.log(`     المحسوب: ${d.want || '(فاضى)'}`);
  }
}

if (!write && total) {
  console.log(`\nشغّل \`node _tools/sync-level-banks.mjs --write <المستوى>\` للكتابة.`);
}
