#!/usr/bin/env node
// التحقق البنيوى والزمنى للمنهج — بدون أى مكتبة خارجية.
// التشغيل من فولدر docs/curriculum:   node _tools/validate.mjs
// الخروج بكود 1 عند أى خطأ.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SESSION_MIN = 90;
const errors = [];
const warns = [];
const err = (f, m) => errors.push(`${f}: ${m}`);
const warn = (f, m) => warns.push(`${f}: ${m}`);

// ---------- أدوات صغيرة ----------
const read = (p) => readFileSync(p, 'utf8');
const rel = (p) => p.replace(ROOT + '\\', '').replace(ROOT + '/', '').replaceAll('\\', '/');

// front-matter بسيط: key: value | key: [a, b] | key: "text"
function frontMatter(text) {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const fm = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([\w_]+):\s*(.*)$/);
    if (!kv) continue;
    let [, k, v] = kv;
    v = v.trim();
    if (v.startsWith('[') && v.endsWith(']')) {
      fm[k] = v.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      fm[k] = v.replace(/^["']|["']$/g, '');
    }
  }
  return fm;
}

// جمع معرّفات البنوك: كل عنوان ### `ID`
function bankIds(file) {
  const p = join(ROOT, '_shared', file);
  if (!existsSync(p)) return new Set();
  return new Set([...read(p).matchAll(/^###\s+`([A-Z]{2}-[A-Z0-9-]+)`/gm)].map(m => m[1]));
}
const banks = {
  UP: bankIds('bank-unplugged.md'),
  PS: bankIds('bank-parsons.md'),
  DB: bankIds('bank-debug.md'),
  SK: bankIds('skill-cards.md'),
  AN: new Set([...(existsSync(join(ROOT, '_shared/bank-analogies.md')) ? read(join(ROOT, '_shared/bank-analogies.md')) : '').matchAll(/^###\s+`(AN-[\w-]+)`/gm)].map(m => m[1])),
};
const glossary = new Set([...(existsSync(join(ROOT, '_shared/glossary.md')) ? read(join(ROOT, '_shared/glossary.md')) : '').matchAll(/`(G-\d{3})`/g)].map(m => m[1]));

// ---------- المستويات المبنية ----------
const levelDirs = [];
for (const track of ['A-scratch', 'B-web']) {
  const tp = join(ROOT, track);
  if (!existsSync(tp)) continue;
  for (const lv of readdirSync(tp)) {
    const sp = join(tp, lv, 'sessions');
    if (existsSync(sp) && statSync(sp).isDirectory()) levelDirs.push(join(tp, lv));
  }
}

const allSessionIds = new Set();
const sessionsByLevel = {};

for (const lvDir of levelDirs) {
  const lv = lvDir.split(/[\\/]/).pop();
  const sessDir = join(lvDir, 'sessions');
  const files = readdirSync(sessDir).filter(f => /^S\d{2}\.md$/.test(f)).sort();
  sessionsByLevel[lv] = files.map(f => f.replace('.md', ''));

  for (const f of files) {
    const p = join(sessDir, f);
    const text = read(p);
    const fm = frontMatter(text);
    const id = `${lv}-${f.replace('.md', '')}`;
    allSessionIds.add(id);
    if (!fm) { err(rel(p), 'لا يوجد front-matter'); continue; }

    // 1. المعرّف والمستوى
    if (fm.id !== id) err(rel(p), `id فى الملف "${fm.id}" لا يطابق "${id}"`);
    if (fm.level !== lv) err(rel(p), `level "${fm.level}" لا يطابق الفولدر "${lv}"`);

    // 2. الزمن — blocks: [open:10, primm:20, ...]
    if (Array.isArray(fm.blocks)) {
      let sum = 0;
      for (const b of fm.blocks) {
        const mm = b.match(/^([\w-]+):(\d+)$/);
        if (!mm) { err(rel(p), `بلوك غير مفهوم "${b}"`); continue; }
        const min = Number(mm[2]);
        if (min > 30) err(rel(p), `بلوك "${mm[1]}" مدته ${min} — يتجاوز 30`);
        sum += min;
      }
      if (sum !== SESSION_MIN) err(rel(p), `مجموع البلوكات ${sum} ≠ ${SESSION_MIN}`);
    } else {
      err(rel(p), 'لا يوجد حقل blocks');
    }

    // 3. الملفات الثلاثة
    const slides = join(lvDir, 'slides', `${f.replace('.md', '')}.slides.html`);
    const notes = join(lvDir, 'notes', `${f.replace('.md', '')}.notes.md`);
    if (!existsSync(slides)) err(rel(p), `ملف الشرائح غير موجود: ${rel(slides)}`);
    if (!existsSync(notes)) err(rel(p), `ملف الملاحظات غير موجود: ${rel(notes)}`);

    // 4. الشرائح: لا مراجع خارجية + الصور موجودة
    if (existsSync(slides)) {
      const html = read(slides);
      // أمثلة الكود داخل <pre> و<code> نصوص تعليمية — لا تُحسب مراجع خارجية
      const htmlNoCode = html.replace(/<pre[\s\S]*?<\/pre>/gi, '').replace(/<code[\s\S]*?<\/code>/gi, '');
      const ext = htmlNoCode.match(/\b(?:src|href)\s*=\s*["']?(https?:)?\/\//gi);
      if (ext) err(rel(slides), `مراجع خارجية (${ext.length}) — الشرائح لازم تكون مكتفية ذاتياً`);
      for (const m of html.matchAll(/<img[^>]+src\s*=\s*["']([^"']+)["']/gi)) {
        const src = m[1];
        if (src.startsWith('data:')) continue;
        const ip = resolve(dirname(slides), src);
        if (!existsSync(ip)) warn(rel(slides), `صورة غير موجودة: ${src}`);
      }
      if (!/class\s*=\s*["'][^"']*\bsources\b/.test(html)) err(rel(slides), 'لا توجد شريحة مصادر (class="slide sources")');
    }

    // 5. المتطلبات السابقة
    for (const pr of fm.prereq || []) {
      if (pr === 'none') continue;
      const target = join(lvDir, 'sessions', `${pr.split('-').pop()}.md`);
      if (!existsSync(target)) err(rel(p), `prereq "${pr}" غير موجود`);
    }

    // 6. معرّفات البنوك
    for (const b of fm.banks || []) {
      const prefix = b.slice(0, 2);
      const set = banks[prefix];
      if (!set) { err(rel(p), `بنك غير معروف "${b}"`); continue; }
      if (!set.has(b)) err(rel(p), `معرّف بنك غير موجود "${b}"`);
    }
    for (const g of fm.glossary || []) {
      if (!glossary.has(g)) err(rel(p), `مصطلح غير موجود فى المسرد "${g}"`);
    }

    // 7. الملاحظات: مثالان على الأقل لكل جزئية (العدد حسب التعقيد: بسيط 2 · متوسط 3 · صعب 4+)
    if (existsSync(notes)) {
      const nt = read(notes);
      if (!/^##\s+قبل الجلسة/m.test(nt)) err(rel(notes), 'لا يوجد قسم «قبل الجلسة»');
      // كل قسم ### يبدأ بـ «جزئية:» لازم يحتوى مثالين على الأقل مرقّمة
      const parts = nt.split(/^###\s+/m).slice(1);
      for (const part of parts) {
        const title = part.split('\n')[0].trim();
        if (!/^جزئية/.test(title)) continue;
        const ex = (part.match(/^\s*-\s*\*\*(مثال|طريقة)\s*[1-9]\*\*/gm) || []).length;
        if (ex < 2) err(rel(notes), `«${title}» فيها ${ex} أمثلة — المطلوب 2 على الأقل`);
      }
    }
  }
}

// ---------- 9. ملفات المشاريع المذكورة موجودة فعلا على القرص ----------
// السبب: مراجعة B1 كشفت 11 فولدر مشروع مذكورين 90+ مرة فى المواد ومش موجودين
// خالص، والمدقق كان بيعدى نضيف. أى ملف الطفل أو المدرس هيفتحه لازم يبقى حقيقى.
function checkpointExists(lvDir, name) {
  const base = join(lvDir, 'checkpoints');
  const dbg = /^DB-[AB]-\d+$/.test(name);
  const dir = dbg ? join(base, 'debug') : base;
  return existsSync(join(dir, name + '.sb3'))          // مسار A
      || existsSync(join(dir, name))                    // مسار B — فولدر
      || existsSync(join(dir, name + '.html'));
}
for (const lvDir of levelDirs) {
  const lv = lvDir.split(/[\\/]/).pop();
  const sessions = readdirSync(join(lvDir, 'sessions')).filter(f => /^S\d{2}\.md$/.test(f)).sort();
  const seen = new Map();                               // اسم الملف ← الجلسات اللى بتذكره
  for (const f of sessions) {
    const id = f.replace('.md', '');
    for (const src of [join(lvDir, 'sessions', f), join(lvDir, 'notes', `${id}.notes.md`)]) {
      if (!existsSync(src)) continue;
      const txt = read(src);
      // (?![-\w]) عشان P6-example-bat-simulator مايتقراش «P6-example» ناقص —
      // A2 فيه أمثلة بلاحقة وصفية (4 أمثلة للمشروع الواحد) مش مثال واحد زى A1
      for (const m of txt.matchAll(/`?\b(P\d-(?:starter|final|after-A|examples?|skeleton)|DB-[AB]-\d{2}|first-page)(?![-\w])`?/g)) {
        if (!seen.has(m[1])) seen.set(m[1], new Set());
        seen.get(m[1]).add(id);
      }
    }
  }
  for (const [name, ids] of seen) {
    if (!checkpointExists(lvDir, name)) {
      err(`${lv}/checkpoints`, `«${name}» مذكور فى ${[...ids].join(' · ')} ومش موجود على القرص`);
    }
  }
}

// ---------- 9ب. أسماء ملفات المشاريع كلها lowercase ----------
// السبب: GitHub Pages بيفرق بين الحروف الكبيرة والصغيرة، وWindows لأ. فـ
// butterfly.JPG بتشتغل فى المعمل وتتكسر على الرابط الحى قدام الأهل. اتلقى فعلا:
// 18 صورة .JPG فى 9 فولدرات مشاريع.
function scanCase(dir, hits) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { scanCase(p, hits); continue; }
    if (e.name !== e.name.toLowerCase()) hits.push(p);
  }
}
for (const lvDir of levelDirs) {
  const lv = lvDir.split(/[\\/]/).pop();
  if (!lv.startsWith('B')) continue;                    // مسار A مالوش نشر — ملفات .sb3 محلية
  const hits = [];
  scanCase(join(lvDir, 'checkpoints'), hits);
  if (hits.length) {
    err(`${lv}/checkpoints`, `${hits.length} ملف اسمه فيه حروف كابيتال — هيتكسر على GitHub Pages:\n      · `
      + hits.slice(0, 6).map(h => h.split(/[\\/]/).slice(-2).join('/')).join('\n      · ')
      + (hits.length > 6 ? `\n      · … و${hits.length - 6} غيرهم` : ''));
  }
}

// ---------- 9ج. ملفات المشاريع ما تحمّلش أى حاجة من النت ----------
// level.md بيقول «بدون إنترنت». كان فيه 19 مشروع بيحمّلوا 28 خط من
// fonts.googleapis.com — النت وقع فى المعمل = الصفحة تطلع غير اللقطات
// اللى فى الشرائح والطفل يفتكر إنه غلط. الخطوط بقت محلية فى fonts/.
// <a href> لموقع خارجى مسموح — ده لينك الطفل بيدوس عليه، مش مورد بيتحمّل.
function scanRemote(dir, hits) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) { scanRemote(p, hits); continue; }
    if (!/\.(html|css)$/i.test(e.name)) continue;
    const txt = read(p);
    for (const m of txt.matchAll(/<link[^>]*https?:\/\/[^>]*>|url\(\s*["']?https?:\/\/[^)]*\)|<script[^>]*src=["']https?:\/\/[^>]*>/gi))
      hits.push(p.split(/[\\/]/).slice(-2).join('/') + ' → ' + m[0].replace(/\s+/g, ' ').slice(0, 70));
  }
}
for (const lvDir of levelDirs) {
  const lv = lvDir.split(/[\\/]/).pop();
  if (!lv.startsWith('B')) continue;
  const hits = [];
  scanRemote(join(lvDir, 'checkpoints'), hits);
  if (hits.length) {
    err(`${lv}/checkpoints`, `${hits.length} مرجع خارجى فى ملفات المشاريع — الصفحة مش هتشتغل من غير نت:\n      · `
      + hits.slice(0, 5).join('\n      · ')
      + (hits.length > 5 ? `\n      · … و${hits.length - 5} غيرهم` : ''));
  }
}

// ---------- 10. اتجاه BiDi فى عناوين الشرائح ----------
// عنوان فيه عربى وإنجليزى مع بعض والإنجليزى بره <code> بيترسم معكوس على الشاشة.
// حصل فعلا: «180deg ← 360deg» اتعرضت بالعكس، و«</p>» اتعرضت «<p/>».
const ARABIC = /[؀-ۿ]/;
for (const lvDir of levelDirs) {
  const sessions = readdirSync(join(lvDir, 'sessions')).filter(f => /^S\d{2}\.md$/.test(f)).sort();
  for (const f of sessions) {
    const slides = join(lvDir, 'slides', `${f.replace('.md', '')}.slides.html`);
    if (!existsSync(slides)) continue;
    const html = read(slides);
    let n = 0; const hits = [];
    for (const m of html.matchAll(/<(h1|h2)\b[^>]*>([\s\S]*?)<\/\1>/gi)) {
      let inner = m[2];
      if (/dir\s*=\s*["']ltr/i.test(inner)) continue;             // معزول يدويا
      inner = inner.replace(/<code[\s\S]*?<\/code>/gi, '')        // المعزول تلقائيا
                   .replace(/<[^>]+>/g, ' ')
                   .replace(/&[a-z]+;/gi, ' ');
      if (!ARABIC.test(inner)) continue;                          // عنوان إنجليزى بالكامل — سليم
      const latin = inner.match(/[A-Za-z][A-Za-z0-9._-]{2,}/g);
      if (latin) { n += 1; hits.push(inner.replace(/\s+/g, ' ').trim().slice(0, 55) + '  ←  ' + latin.join(',')); }
    }
    if (n) warn(rel(slides), `${n} عنوان فيه مصطلح إنجليزى بره <code>:\n      · ` + hits.join('\n      · '));
  }
}

// 8. manifest: كل جلسة مذكورة لها ملف
const manifestPath = join(ROOT, 'manifest.yml');
if (existsSync(manifestPath)) {
  const mf = read(manifestPath);
  // سطر بسطر: المستوى = مفتاح بمسافتين، والحالة = status بأربع مسافات تحته
  const builtLevels = [];
  let cur = null;
  for (const line of mf.split(/\r?\n/)) {
    const lv = line.match(/^  ([AB]\d):\s*$/);
    if (lv) { cur = lv[1]; continue; }
    if (/^\S/.test(line)) { cur = null; continue; }
    if (cur && /^    status:\s*built\s*$/.test(line)) builtLevels.push(cur);
  }
  for (const lv of builtLevels) {
    if (!sessionsByLevel[lv]) { err('manifest.yml', `المستوى ${lv} مبنى حسب الـ manifest لكن لا فولدر جلسات`); continue; }
    for (let i = 1; i <= 16; i++) {
      const s = `S${String(i).padStart(2, '0')}`;
      if (!sessionsByLevel[lv].includes(s)) err('manifest.yml', `${lv}: الجلسة ${s} ناقصة`);
    }
  }
} else {
  warn('manifest.yml', 'غير موجود');
}

// ---------- التقرير ----------
console.log(`\nالمستويات المفحوصة: ${Object.keys(sessionsByLevel).join(', ') || 'لا شىء'}`);
console.log(`الجلسات المفحوصة: ${allSessionIds.size}`);
if (warns.length) { console.log(`\nتحذيرات (${warns.length}):`); warns.forEach(w => console.log('  ⚠ ' + w)); }
if (errors.length) { console.log(`\nأخطاء (${errors.length}):`); errors.forEach(e => console.log('  ✗ ' + e)); process.exit(1); }
console.log('\n✓ كل الفحوصات نجحت');
