#!/usr/bin/env node
// ينزّل مشروع ويب من محرر Raspberry Pi كفولدر (index.html + css + الصور).
// الاستخدام:  node _tools/fetch-rpi-web.mjs <identifier> <outDir>
//            node _tools/fetch-rpi-web.mjs --b1   ← ينزّل كل مشاريع B1 فى checkpoints/
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const H = { 'user-agent': 'Mozilla/5.0 4U-curriculum-fetch' };

async function fetchProject(identifier, outDir) {
  const r = await fetch(`https://editor-api.raspberrypi.org/api/projects/${identifier}`, { headers: H });
  if (!r.ok) throw new Error(`${identifier}: ${r.status}`);
  const p = await r.json();
  mkdirSync(outDir, { recursive: true });
  let n = 0;
  for (const c of p.components || []) { writeFileSync(join(outDir, `${c.name}.${c.extension}`), c.content ?? ''); n++; }
  const imgs = p.image_list || p.images || [];
  let m = 0;
  for (const img of imgs) {
    const url = img.url || img.image_url; const fn = img.filename || img.name; if (!url || !fn) continue;
    const ir = await fetch(url, { headers: H }); if (!ir.ok) { console.error(`  ✗ صورة ${fn}: ${ir.status}`); continue; }
    writeFileSync(join(outDir, fn), Buffer.from(await ir.arrayBuffer())); m++;
  }
  console.log(`✓ ${outDir}  ←  "${p.name}" (${n} ملف كود، ${m} صورة)`);
}

const B1 = [
  ['P1-starter',  'anime-expressions-starter'],
  ['P1-final',    'anime-expressions-step-8'],
  ['P2-starter',  'top-5-emoji-list-starter'],
  ['P2-final',    'top-5-emoji-list-complete'],
  ['P3-starter',  'flip-treat-webcards-starter'],
  ['P3-final',    'flip-treat-webcards-step-5'],
  ['P4-starter',  'mood-board-starter'],
  ['P4-examples/happiness', 'happiness-mood-board'],
  ['P4-examples/beetle',    'beetle-mood-board'],
  ['P5-starter',  'sell-me-something-starter'],
  ['P5-examples/skateboarding', 'skateboarding'],
  ['P5-examples/mood-lamp',     'mood-lamp'],
  ['P6-starter',  'build-a-web-page-starter'],
  ['P6-examples/favourite-things', 'favourite-things'],
  ['P6-examples/egypt',            'egypt'],
];

const [, , a, b] = process.argv;
if (a === '--b1') {
  const dir = join(ROOT, 'B-web', 'B1', 'checkpoints');
  for (const [name, id] of B1) { try { await fetchProject(id, join(dir, name)); } catch (e) { console.error(`✗ ${name}: ${e.message}`); } }
} else if (a && b) {
  await fetchProject(a, resolve(b));
} else {
  console.log('node _tools/fetch-rpi-web.mjs <identifier> <outDir>   |   --b1');
}
