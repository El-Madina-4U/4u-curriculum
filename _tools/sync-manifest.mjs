// sync-manifest.mjs — يحدث _shared/media-manifest.md من الواقع:
//   عمود «الجلسات» = الجلسات اللى فعلا بتستخدم الصورة فى الشرائح · الحالة done/pending حسب وجود الملف · إضافة صفوف للصور الجديدة فى assets/
// الاستخدام: node _tools/sync-manifest.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MF = path.join(ROOT, '_shared/media-manifest.md');
const TRACKS = { A: { assets: 'A-scratch/A1/assets', slides: 'A-scratch/A1/slides' }, B: { assets: 'B-web/B1/assets', slides: 'B-web/B1/slides' } };

// الاستخدام الفعلى: id → Set(Sxx)
const usage = {};
for (const [tr, d] of Object.entries(TRACKS)) {
  const dir = path.join(ROOT, d.slides); if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.slides.html'))) {
    const sess = f.replace('.slides.html', ''); const html = fs.readFileSync(path.join(dir, f), 'utf8');
    for (const m of html.matchAll(/assets\/([AB]-[A-Z]{2}-\d\d[a-z]?)\.png/g)) (usage[m[1]] ??= new Set()).add(sess);
  }
}
const exists = id => fs.existsSync(path.join(ROOT, TRACKS[id[0]].assets, id + '.png'));
const fmt = id => [...(usage[id] || [])].sort().map(s => '`' + s + '`').join(' ') || '—';

let s = fs.readFileSync(MF, 'utf8'); const seen = new Set(); let changed = 0;
s = s.replace(/^\| `([AB]-[A-Z]{2}-\d\d[a-z]?)` \| `([^`]+)` \| `(pending|done)` \| ([^|]*) \| ([^|]*) \| ([^|]*) \|$/gm, (m, id, file, st, src, fn, sess) => {
  seen.add(id); const ns = exists(id) ? 'done' : 'pending'; const nsess = fmt(id);
  const out = `| \`${id}\` | \`${file}\` | \`${ns}\` | ${src.trim()} | ${fn.trim()} | ${nsess} |`;
  if (out !== m) changed++; return out;
});
// صفوف جديدة لصور موجودة فى assets/ ومش فى السجل — تتضاف آخر جدول مسارها
const DESC = {
  'A-UI-11': ['لقطة `Scratch` + تحويط', 'مكتبة الخلفيات وتصنيف `Space`'], 'A-UI-12': ['لقطة `Scratch` + تحويط', 'محرر الرسم — كوستيوم `nano-b` وأداة التحديد'],
  'A-BL-14': ['لقطة `Scratch` + تحويط', '`when green flag clicked` والأتوبيس مختار'], 'A-BL-15': ['لقطة `Scratch` + تحويط', '`point towards` بقائمة فيها `City Bus`'],
  'A-SC-02b': ['لقطة `Scratch` + تحويط', 'نفس `A-SC-02` بتحويط الفجوة — لمرحلة الاستقصاء'], 'A-SC-04b': ['لقطة `Scratch` + تحويط', 'نفس `A-SC-04` بتحويط `move` خارج اللوب — للاستقصاء'],
  'A-SC-08': ['لقطة `Scratch`', 'ناتج بناء `S02`: `when this sprite clicked` ← `start sound` ← `say`'], 'A-SC-09': ['لقطة `Scratch`', 'سكربتا الأتوبيس فى `P2-final` — `wait` ← `glide` ← `hide`'],
};
for (const [tr, d] of Object.entries(TRACKS)) {
  const dir = path.join(ROOT, d.assets); if (!fs.existsSync(dir)) continue;
  const ids = fs.readdirSync(dir).filter(f => /^[AB]-[A-Z]{2}-\d\d[a-z]?\.png$/.test(f)).map(f => f.replace('.png', '')).filter(id => !seen.has(id)).sort();
  if (!ids.length) continue;
  const rows = ids.map(id => { const [src, fn] = DESC[id] || ['لقطة', '—']; return `| \`${id}\` | \`${id}.png\` | \`done\` | ${src} | ${fn} | ${fmt(id)} |`; }).join('\n');
  // أضف قبل أول فاصل "---" بعد عنوان المسار
  const head = tr === 'A' ? '## مسار `A`' : '## مسار `B`';
  const i = s.indexOf(head); const j = s.indexOf('\n---', i);
  s = s.slice(0, j) + '\n' + rows + s.slice(j); changed += ids.length;
}
fs.writeFileSync(MF, s); console.log(`media-manifest.md: ${changed} تغيير`);
