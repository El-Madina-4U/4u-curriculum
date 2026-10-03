#!/usr/bin/env node
// يعيد حساب عمود «الجلسات» فى _shared/media-manifest.md من الاستخدام الفعلى
// داخل ملفات الشرائح. اللقطة اللى اتشالت من الشرائح تتحول تلقائيا لـ «—».
//
//   node _tools/sync-media-usage.mjs           # تقرير فروق
//   node _tools/sync-media-usage.mjs --write   # كتابة

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MANIFEST = join(ROOT, '_shared', 'media-manifest.md');

const LEVELS = [
  ['A-scratch/A1', /^A-/], ['A-scratch/A2', /^A-/], ['A-scratch/A3', /^A-/],
  ['B-web/B1', /^B-/], ['B-web/B2', /^B-/],
];

// معرف ← مجموعة الجلسات اللى بتستخدمه فعلا
const usage = new Map();
const assetsSeen = new Set();

for (const [dir] of LEVELS) {
  const slidesDir = join(ROOT, dir, 'slides');
  if (!existsSync(slidesDir)) continue;
  for (const f of readdirSync(slidesDir).filter(f => f.endsWith('.slides.html'))) {
    const sess = f.slice(0, 3);                       // Sxx
    const src = readFileSync(join(slidesDir, f), 'utf8');
    for (const m of src.matchAll(/\b([AB]-(?:UI|CD|SC|PR|GH)-\d{2})\b/g)) {
      if (!usage.has(m[1])) usage.set(m[1], new Set());
      usage.get(m[1]).add(sess);
    }
  }
  const assetsDir = join(ROOT, dir, 'assets');
  if (existsSync(assetsDir)) {
    for (const f of readdirSync(assetsDir)) {
      const m = f.match(/^([AB]-(?:UI|CD|SC|PR|GH)-\d{2})\.png$/);
      if (m) assetsSeen.add(m[1]);
    }
  }
}

const src = readFileSync(MANIFEST, 'utf8').replace(/\r\n/g, '\n');
const diffs = [], orphans = [], missing = [];

const out = src.split('\n').map(line => {
  const m = line.match(/^\|\s*`([AB]-(?:UI|CD|SC|PR|GH)-\d{2})`\s*\|/);
  if (!m) return line;
  const cells = line.split('|');
  if (cells.length !== 8) return line;               // '' + 6 أعمدة + ''
  const id = m[1];
  const used = [...(usage.get(id) || [])].sort();

  if (!used.length) orphans.push(id);
  if (!assetsSeen.has(id) && /`done`/.test(cells[3])) missing.push(id);

  const want = used.length ? used.map(s => '`' + s + '`').join(' ') : '—';
  const have = cells[6].trim();
  if (want === have) return line;
  diffs.push({ id, have, want });
  cells[6] = ' ' + want + ' ';
  return cells.join('|');
}).join('\n');

const write = process.argv.includes('--write');
if (write && diffs.length) writeFileSync(MANIFEST, out, 'utf8');

if (!diffs.length) console.log('✓ عمود «الجلسات» مطابق للاستخدام الفعلى');
else {
  console.log(`${write ? '✎ اتكتب' : '✗'} — ${diffs.length} صف مختلف`);
  for (const d of diffs) console.log(`   ${d.id}:  ${d.have || '(فاضى)'}  ←  ${d.want}`);
}
if (orphans.length) console.log(`\n⚠ ${orphans.length} لقطة مش مستخدمة فى أى شريحة:\n   ` + orphans.join(' '));
if (missing.length) console.log(`\n✗ ${missing.length} لقطة مسجلة \`done\` وملفها مش موجود:\n   ` + missing.join(' '));

// نفس العمود فى قائمة اللقطات المطلوبة — خمسة أعمدة، الأخير «الجلسات»
const SHOTS = join(ROOT, '_tools', 'capture-screenshots.md');
if (existsSync(SHOTS)) {
  const s2 = readFileSync(SHOTS, 'utf8').replace(/\r\n/g, '\n');
  const d2 = [];
  // أقسام اللقطات **المقترحة** (لسه ماتلقطتش) عمودها بيوصف النية مش الواقع —
  // الأداة بتتخطاها، وإلا بتفضيها كل تشغيلة وتضيع التخطيط
  let proposed = false;
  const o2 = s2.split('\n').map(line => {
    if (/^## /.test(line)) proposed = false;
    if (/مقترحة|ماتلقطتش/.test(line)) proposed = true;
    const m = line.match(/^\|\s*`([AB]-(?:UI|CD|SC|PR|GH)-\d{2})`\s*\|/);
    if (!m || proposed) return line;
    const cells = line.split('|');
    if (cells.length !== 7) return line;             // '' + 5 أعمدة + ''
    const used = [...(usage.get(m[1]) || [])].sort();
    const want = used.length ? used.map(x => '`' + x + '`').join(' ') : '—';
    if (want === cells[5].trim()) return line;
    d2.push({ id: m[1], have: cells[5].trim(), want });
    cells[5] = ' ' + want + ' ';
    return cells.join('|');
  }).join('\n');
  if (write && d2.length) writeFileSync(SHOTS, o2, 'utf8');
  console.log(`\n— capture-screenshots.md: ${d2.length ? (write ? '✎ اتكتب ' : '✗ ') + d2.length + ' صف' : '✓ مطابق'}`);
  for (const d of d2) console.log(`   ${d.id}:  ${d.have || '(فاضى)'}  ←  ${d.want}`);
}
