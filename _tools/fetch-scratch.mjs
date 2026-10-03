#!/usr/bin/env node
// ينزّل مشروع Scratch عام ويحوّله لملف .sb3 — بدون مكتبات خارجية.
// الاستخدام:  node _tools/fetch-scratch.mjs <projectId> <output.sb3>
//            node _tools/fetch-scratch.mjs --a1     ← ينزّل الـ 12 مشروع الخاصة بـ A1 فى checkpoints/
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');

// ---------- zip بسيط (store — بدون ضغط) ----------
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (buf) => { let c = 0xFFFFFFFF; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xFF] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function zip(files) { // files: [{name, data:Buffer}]
  const locals = [], centrals = []; let offset = 0;
  for (const f of files) {
    const name = Buffer.from(f.name, 'utf8'), crc = crc32(f.data), n = f.data.length;
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0x0800, 6); lh.writeUInt16LE(0, 8); lh.writeUInt32LE(0, 10); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(n, 18); lh.writeUInt32LE(n, 22); lh.writeUInt16LE(name.length, 26); lh.writeUInt16LE(0, 28);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0x0800, 8); ch.writeUInt16LE(0, 10); ch.writeUInt32LE(0, 12); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(n, 20); ch.writeUInt32LE(n, 24); ch.writeUInt16LE(name.length, 28); ch.writeUInt16LE(0, 30); ch.writeUInt16LE(0, 32); ch.writeUInt16LE(0, 34); ch.writeUInt16LE(0, 36); ch.writeUInt32LE(0, 38); ch.writeUInt32LE(offset, 42);
    locals.push(lh, name, f.data); centrals.push(ch, name); offset += lh.length + name.length + n;
  }
  const cdSize = centrals.reduce((s, b) => s + b.length, 0);
  const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(0, 4); end.writeUInt16LE(0, 6); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cdSize, 12); end.writeUInt32LE(offset, 16); end.writeUInt16LE(0, 20);
  return Buffer.concat([...locals, ...centrals, end]);
}

// ---------- التنزيل ----------
const H = { 'user-agent': 'Mozilla/5.0 4U-curriculum-fetch' };
async function fetchProject(id) {
  const meta = await (await fetch(`https://api.scratch.mit.edu/projects/${id}`, { headers: H })).json();
  if (!meta.project_token) throw new Error(`مشروع ${id}: لا token — غير عام أو غير موجود`);
  const pj = await (await fetch(`https://projects.scratch.mit.edu/${id}?token=${meta.project_token}`, { headers: H })).text();
  const json = JSON.parse(pj);
  const assets = new Map();
  for (const t of json.targets || []) for (const a of [...(t.costumes || []), ...(t.sounds || [])]) if (a.md5ext) assets.set(a.md5ext, null);
  let i = 0;
  for (const md5 of assets.keys()) {
    const r = await fetch(`https://assets.scratch.mit.edu/internalapi/asset/${md5}/get/`, { headers: H });
    if (!r.ok) throw new Error(`أصل ${md5} فشل: ${r.status}`);
    assets.set(md5, Buffer.from(await r.arrayBuffer()));
    process.stdout.write(`\r  ${meta.title}: أصول ${++i}/${assets.size}   `);
  }
  console.log();
  return { title: meta.title, files: [{ name: 'project.json', data: Buffer.from(pj, 'utf8') }, ...[...assets].map(([name, data]) => ({ name, data }))] };
}
async function save(id, out) {
  const { title, files } = await fetchProject(id);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, zip(files));
  console.log(`✓ ${out}  ←  "${title}" (${files.length - 1} أصل)`);
}

// ---------- قائمة A1 ----------
const A1 = [
  ['P1-final',   485673032, 'Space talk — مكتمل'],
  ['P1-starter', 582213331, 'Space talk — بداية'],
  ['P2-final',   724160134, 'Catch the bus — مكتمل'],
  ['P2-starter', 582214330, 'Catch the bus — بداية'],
  ['P3-final',   486719939, 'Find the bug — مكتمل'],
  ['P3-starter', 582214723, 'Find the bug — بداية'],
  ['P4-final',   495141114, 'Silly eyes — مثال Gobo'],
  ['P4-starter', 582221984, 'Silly eyes — بداية'],
  ['P5-final',   495932563, 'Surprise! animation — مثال الديناصور'],
  ['P5-starter', 582222532, 'Surprise! animation — بداية'],
  ['P6-example', 500189097, 'I made you a book — Tickle monster'],
  ['P6-starter', 582223042, 'I made you a book — بداية'],
];

const [, , a, b] = process.argv;
if (a === '--a1') {
  const dir = join(ROOT, 'A-scratch', 'A1', 'checkpoints');
  for (const [name, id] of A1) { try { await save(id, join(dir, `${name}.sb3`)); } catch (e) { console.error(`✗ ${name}: ${e.message}`); } }
} else if (a && b) {
  await save(Number(a), resolve(b));
} else {
  console.log('node _tools/fetch-scratch.mjs <projectId> <out.sb3>   |   --a1');
}
