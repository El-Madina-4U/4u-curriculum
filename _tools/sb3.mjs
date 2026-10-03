// sb3.mjs — قراءة وكتابة ملفات Scratch 3 (.sb3) وتعديل السكربتات بدون مكتبات خارجية
import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';

// ---------- zip ----------
export function unzip(file) {
  const buf = fs.readFileSync(file); const out = new Map();
  let p = buf.length - 22; while (p > 0 && buf.readUInt32LE(p) !== 0x06054b50) p--;
  const count = buf.readUInt16LE(p + 10); let cd = buf.readUInt32LE(p + 16);
  for (let i = 0; i < count; i++) {
    const method = buf.readUInt16LE(cd + 10), csize = buf.readUInt32LE(cd + 20), nlen = buf.readUInt16LE(cd + 28), elen = buf.readUInt16LE(cd + 30), clen = buf.readUInt16LE(cd + 32), lho = buf.readUInt32LE(cd + 42);
    const name = buf.slice(cd + 46, cd + 46 + nlen).toString();
    const lnlen = buf.readUInt16LE(lho + 26), lelen = buf.readUInt16LE(lho + 28);
    const start = lho + 30 + lnlen + lelen; const data = buf.slice(start, start + csize);
    out.set(name, method === 8 ? zlib.inflateRawSync(data) : Buffer.from(data));
    cd += 46 + nlen + elen + clen;
  }
  return out;
}
const crcTable = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
export function zipStore(files, out) {
  const parts = []; const cd = []; let off = 0;
  for (const [name, data] of files) {
    const n = Buffer.from(name), crc = crc32(data);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(n.length, 26);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(n.length, 28); ch.writeUInt32LE(off, 42);
    parts.push(lh, n, data); cd.push(ch, n); off += lh.length + n.length + data.length;
  }
  const cdBuf = Buffer.concat(cd);
  const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cdBuf.length, 12); end.writeUInt32LE(off, 16);
  fs.writeFileSync(out, Buffer.concat([...parts, cdBuf, end]));
}

// ---------- مشروع ----------
export function load(file) { const files = unzip(file); return { files, project: JSON.parse(files.get('project.json').toString()) }; }
export function save({ files, project }, out) {
  // احتفظ بالأصول المستخدمة فقط
  const used = new Set(['project.json']);
  for (const t of project.targets) for (const a of [...(t.costumes || []), ...(t.sounds || [])]) used.add(a.md5ext);
  const entries = [['project.json', Buffer.from(JSON.stringify(project))]];
  for (const [n, d] of files) if (n !== 'project.json' && used.has(n)) entries.push([n, d]);
  fs.mkdirSync(out.replace(/[\\/][^\\/]+$/, ''), { recursive: true });
  zipStore(entries, out);
}
export const sprite = (project, name) => { const t = project.targets.find(t => t.name === name); if (!t) throw new Error('سبرايت غير موجود: ' + name); return t; };
export const stage = project => project.targets.find(t => t.isStage);
export function removeSprite(project, name) { project.targets = project.targets.filter(t => t.name !== name); }
export const newId = () => 'g' + crypto.randomBytes(8).toString('hex');

// ---------- بلوكات ----------
export const tops = t => Object.keys(t.blocks).filter(id => t.blocks[id].topLevel && !t.blocks[id].shadow);
// كل البلوكات التابعة لبلوك (السلسلة + المدخلات + الفروع)
export function subtree(t, id, acc = new Set()) {
  let cur = id;
  while (cur && !acc.has(cur)) {
    acc.add(cur); const b = t.blocks[cur]; if (!b) break;
    for (const v of Object.values(b.inputs || {})) { const ref = v[1]; if (typeof ref === 'string') subtree(t, ref, acc); const ref2 = v[2]; if (typeof ref2 === 'string') subtree(t, ref2, acc); }
    cur = b.next;
  }
  return acc;
}
export function removeScript(t, topId) { for (const id of subtree(t, topId)) delete t.blocks[id]; }
export function keepScripts(t, pred) { for (const id of tops(t)) if (!pred(t.blocks[id], id)) removeScript(t, id); }
export function clearScripts(t) { t.blocks = {}; }
// بلوك بالأوبكود (nth = الترتيب بين المتطابقين حسب الظهور فى السكربتات)
export function find(t, opcode, nth = 0) {
  const seen = []; for (const top of tops(t)) for (const id of subtree(t, top)) if (t.blocks[id].opcode === opcode && !seen.includes(id)) seen.push(id);
  const id = seen[nth]; if (!id) throw new Error(`مفيش ${opcode}#${nth} فى ${t.name}`); return id;
}
export const setInput = (t, id, name, prim) => { t.blocks[id].inputs[name] = [1, prim]; };
export const NUM = v => [4, String(v)], TEXT = v => [10, String(v)], INT = v => [6, String(v)], POS = v => [5, String(v)];
// إزالة بلوك من سلسلته (ويرجع البلوك) — يوصّل اللى قبله باللى بعده
export function unlink(t, id) {
  const b = t.blocks[id]; const p = b.parent ? t.blocks[b.parent] : null;
  if (p) {
    if (p.next === id) p.next = b.next;
    else for (const [k, v] of Object.entries(p.inputs || {})) if (v[1] === id) { if (b.next) v[1] = b.next; else delete p.inputs[k]; }
  }
  if (b.next) t.blocks[b.next].parent = b.parent;
  b.parent = null; b.next = null; b.topLevel = false;
  return b;
}
export function insertAfter(t, id, afterId) { const b = t.blocks[id], a = t.blocks[afterId]; b.parent = afterId; b.next = a.next; if (a.next) t.blocks[a.next].parent = id; a.next = id; b.topLevel = false; }
export function detach(t, id, x, y) { unlink(t, id); const b = t.blocks[id]; b.topLevel = true; b.x = x; b.y = y; }
// فك بلوك تحكم: يرفع محتوى SUBSTACK مكانه ويمسحه
export function unwrap(t, id) {
  const b = t.blocks[id]; const first = b.inputs.SUBSTACK?.[1]; const parentId = b.parent; const nextId = b.next;
  if (!first) { unlink(t, id); delete t.blocks[id]; return; }
  let last = first; while (t.blocks[last].next) last = t.blocks[last].next;
  const p = t.blocks[parentId]; if (p) { if (p.next === id) p.next = first; else for (const v of Object.values(p.inputs || {})) if (v[1] === id) v[1] = first; }
  t.blocks[first].parent = parentId; t.blocks[last].next = nextId; if (nextId) t.blocks[nextId].parent = last;
  if (b.topLevel) { t.blocks[first].topLevel = true; t.blocks[first].x = b.x; t.blocks[first].y = b.y; }
  delete t.blocks[id];
}
export function addBlock(t, def, afterId) {
  const id = newId(); const blk = { opcode: def.opcode, next: null, parent: null, inputs: {}, fields: {}, shadow: false, topLevel: false };
  for (const [k, v] of Object.entries(def.inputs || {})) {
    if (Array.isArray(v)) blk.inputs[k] = [1, v];
    else { const mid = newId(); t.blocks[mid] = { opcode: v.menu, next: null, parent: id, inputs: {}, fields: { [v.field]: [v.value, null] }, shadow: true, topLevel: false }; blk.inputs[k] = [1, mid]; }
  }
  for (const [k, v] of Object.entries(def.fields || {})) blk.fields[k] = [v, null];
  t.blocks[id] = blk; if (afterId) insertAfter(t, id, afterId); return id;
}
export function md5(buf) { return crypto.createHash('md5').update(buf).digest('hex'); }
