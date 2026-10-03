#!/usr/bin/env node
// ---------------------------------------------------------------------------
// make-web-checkpoints.mjs — توليد ملفات مشاريع مسار B المشتقة
//
// بيولد:
//   P1-after-A .. P5-after-A   حالة المشروع بعد الجلسة A (نقطة رجوع الغايب والمتعثر)
//   debug/DB-B-01 .. DB-B-08   تحديات التصحيح — كل واحد فيه خطأ واحد بس
//   first-page/                فولدر بلوك البناء فى S01
//
// الاستخدام (من docs/curriculum/):
//   node _tools/make-web-checkpoints.mjs
//   node _tools/make-web-checkpoints.mjs --only P1-after-A,DB-B-03
//
// المبدأ: نفس منطق make-checkpoints.mjs بتاع مسار A — كل ملف مشتق ليه قاعدة
// مكتوبة، فأى تعديل فى الأصل بينتشر بإعادة التشغيل. ممنوع التعديل اليدوى.
// ---------------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const CK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../B-web/B1/checkpoints');
const only = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1].split(',')
  : null;

const jobs = {};
const job = (name, fn) => { jobs[name] = fn; };
const out = name => path.join(CK, name.startsWith('DB-B-') ? 'debug/' + name : name);

// ---------- أدوات ----------
// ملفات المصدر من Raspberry Pi بتيجى بـ CRLF — بنوحّدها على LF عشان
// المطابقة النصية تشتغل، والمخرج كله يبقى بنهايات سطور واحدة
const rd = f => fs.readFileSync(f, 'utf8').replace(/\r\n/g, '\n');
const wr = (f, s) => { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, s); };

function copyFrom(base, dst) {
  fs.rmSync(dst, { recursive: true, force: true });
  fs.cpSync(path.join(CK, base), dst, { recursive: true });
}

// استبدال نصى صارم — بيرمى لو النص الأصلى مش موجود، عشان ما نطلعش ملف نص مبنى
function edit(file, pairs) {
  let s = rd(file);
  for (const [a, b] of pairs) {
    if (!s.includes(a)) throw new Error('النص مش موجود فى ' + path.basename(file) + ': ' + a.slice(0, 60));
    s = s.split(a).join(b);
  }
  wr(file, s);
}

// صفحة تصحيح مكتفية ذاتيا — ملف واحد بـ style داخلى
const dbgOne = (title, style, body) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
${style}
  </style>
</head>
<body>
${body}
</body>
</html>
`;

// صفحة تصحيح بملف CSS منفصل — لما الدرس بيطلب من الطالب يفتح style.css
const dbgHtml = (title, body) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <link href="style.css" rel="stylesheet" type="text/css">
</head>
<body>
${body}
</body>
</html>
`;

// ===========================================================================
// تجهيز الفولدرات المصدر: لم ملفات لوحات الألوان فى palettes/
// المواد بتقول للطالب «افتح palettes/» فى 15 موضع، والملفات الـ20 كانت مرمية
// فى جذر الفولدر وسط الصور والملفات المربوطة — مربك لطفل 13 سنة، وغير مطابق.
// style.css و animation.css و default.css بيفضلوا فى الجذر لأنهم مربوطين فعلا.
// ===========================================================================
const CORE_CSS = new Set(['style.css', 'animation.css', 'default.css']);
function makePalettes(folder) {
  const d = path.join(CK, folder);
  if (!fs.existsSync(d)) return 0;
  const pal = path.join(d, 'palettes');
  fs.mkdirSync(pal, { recursive: true });
  let n = 0;
  for (const f of fs.readdirSync(d)) {
    if (!f.endsWith('.css') || CORE_CSS.has(f)) continue;
    fs.renameSync(path.join(d, f), path.join(pal, f));
    n++;
  }
  return n;
}
job('palettes', () => {
  let n = 0;
  for (const f of ['P4-starter', 'P5-starter', 'P6-starter']) n += makePalettes(f);
  console.log(`    (${n} ملف لوحة اتنقل لـ palettes/)`);
});

// نفس الحكاية مع الصور: المواد بتقول «صورة من images/» فى S09 و S13، والـ 38
// صورة كانت مرمية فى الجذر. مافيش صورة مربوطة فى index.html فالنقل آمن.
function makeImages(folder) {
  const d = path.join(CK, folder);
  if (!fs.existsSync(d)) return 0;
  const img = path.join(d, 'images');
  fs.mkdirSync(img, { recursive: true });
  let n = 0;
  for (const f of fs.readdirSync(d)) {
    if (!/\.(jpe?g|png|gif|svg|webp)$/i.test(f)) continue;
    // الاسم بيتحول lowercase بالكامل: GitHub Pages بيفرق بين الحروف وWindows لأ،
    // فـ butterfly.JPG بتشتغل فى المعمل وتتكسر على الرابط الحى قدام الأهل
    fs.renameSync(path.join(d, f), path.join(img, lower(f)));
    n++;
  }
  return n;
}

// إعادة تسمية آمنة على Windows: النظام مابيفرقش بين الحروف فالنقل المباشر
// من A.JPG لـ a.jpg ممكن يتجاهل، فبنعدى على اسم مؤقت
function lower(f) { return f.toLowerCase(); }
function lowercaseTree(dir) {
  if (!fs.existsSync(dir)) return 0;
  let n = 0;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) { n += lowercaseTree(p); continue; }
    const want = lower(e.name);
    if (want === e.name) continue;
    const tmp = path.join(dir, '__tmp__' + want);
    fs.renameSync(p, tmp);
    fs.renameSync(tmp, path.join(dir, want));
    n++;
  }
  return n;
}
job('images', () => {
  let n = 0;
  for (const f of ['P4-starter', 'P5-starter', 'P6-starter']) n += makeImages(f);

  // S11 خطوة 2 بتقول «انسخ HTML الكارت من P3». الـ HTML بيجى معاه
  // <img src="knafeh.png"> — والصورة مش موجودة فى فولدر P5 فالكارت بيطلع
  // مربع مكسور. بننسخ صور الحلويات لـ P5 عشان النسخ يشتغل.
  const src = path.join(CK, 'P3-final');
  let c = 0;
  if (fs.existsSync(src)) {
    for (const f of ['P5-starter', 'P5-after-A']) {
      const dst = path.join(CK, f, 'images');
      if (!fs.existsSync(dst)) continue;
      for (const g of fs.readdirSync(src)) {
        if (!/\.png$/i.test(g)) continue;
        const t = path.join(dst, g.toLowerCase());
        if (!fs.existsSync(t)) { fs.copyFileSync(path.join(src, g), t); c++; }
      }
    }
  }
  console.log(`    (${n} صورة اتنقلت لـ images/ · ${c} صورة حلويات اتنسخت لـ P5)`);
});

// كل أسماء ملفات المشاريع lowercase — بيتنفذ آخر حاجة عشان يمسك اللى اتنسخ
// من مجلدات تانية كمان. المرجع: bank-debug.md حساسية الحروف على GitHub Pages.
// الصور فى ملفات Raspberry Pi بترسم بحجمها الطبيعى: صورة 1920px على شاشة معمل
// 1366px = سكرول أفقى لكل طالب. وS15 بتطلب فحص «الصفحة على الموبايل» وهو مستحيل
// ينجح لأن main عنده min-width: 25rem. القاعدتان دول بيحلوا الاتنين.
const RESPONSIVE = `

/* 4U — الصورة ماتعدّيش عرض حاويتها. من غير السطر ده صورة الكاميرا الأصلية
   بتخلى الصفحة أعرض من الشاشة. */
img {
  max-width: 100%;
  height: auto;
}

/* 4U — .wide و.narrow كانوا width ثابت (20rem و10rem) فالصفحة ما بتقدرش
   تضيق على الموبايل. max-width بيدى نفس الشكل على الشاشة الكبيرة. */
.wrap .narrow { width: auto; max-width: 10rem; }
.wrap .wide   { width: auto; max-width: 20rem; }

/* 4U — عناصر الأنيميشن (rollme / moveme) بتتحرك بره الشاشة عن قصد. من غير
   السطر ده بتعمل سكرول أفقى مالوش لازمة. clip مش hidden عشان مايعملش
   حاوية سكرول جديدة. */
html, body { overflow-x: clip; }

/* 4U — على الشاشة الصغيرة الحشو الجانبى بياكل نص العرض */
@media (max-width: 480px) {
  section { padding-left: 0.75rem; padding-right: 0.75rem; }
}
`;
job('responsive', () => {
  let n = 0;
  const dirs = [];
  for (const f of fs.readdirSync(CK, { withFileTypes: true })) {
    if (!f.isDirectory() || f.name === 'debug') continue;   // debug فيه أخطاء مقصودة — ماينلمسش
    dirs.push(path.join(CK, f.name));
    for (const g of fs.readdirSync(path.join(CK, f.name), { withFileTypes: true }))
      if (g.isDirectory()) dirs.push(path.join(CK, f.name, g.name));
  }
  for (const d of dirs) {
    const css = path.join(d, 'style.css');
    if (!fs.existsSync(css)) continue;
    let s = rd(css);
    // min-width بيمنع الصفحة من إنها تضيق على الموبايل. القيمة بتختلف من
    // مشروع للتانى (25rem فى P6 · 20rem فى skateboarding) فالمطابقة بالخاصية.
    s = s.replace(/^(\s*)min-width:\s*\d+(?:\.\d+)?rem;(.*)$/gm,
      '$1min-width: 0; /* 4U — كان عرض أدنى ثابت: بيمنع الصفحة تضيق على الموبايل */');
    // الكتلة بتتشال وتتكتب من جديد كل تشغيلة — عشان السكربت يفضل idempotent
    // ويقدر يحدّث القواعد من غير ما يكوّم نسخ
    s = s.replace(/\n*\/\* 4U — الصورة ماتعدّيش[\s\S]*$/, '') + RESPONSIVE;
    wr(css, s); n++;
  }
  console.log(`    (${n} ملف style.css اتظبط للموبايل والصور)`);
});

// ===========================================================================
// نموذج Invent عن مصر
// ===========================================================================
// الملف القديم اللى كان هنا مكانش مشروع من مسار Raspberry Pi أصلا: div-soup
// بلا header/main/footer · صفر section · صفر ol · صفر blockquote · صفر alt ·
// <title>Document</title> · Font Awesome من CDN خارجى · صورة بعلامة مائية.
// وبلوك البناء 1 فى S12 (10 دقايق) قايم على «عدوا إيه فى الصفحة دى من اللى
// اتعلمناه» — فكان بيعد حاجات مش موجودة.
// النموذج الجديد مبنى من P6-starter بنفس مفردات B1 بالظبط، والصور المصرية
// اللى كانت فى الفولدر القديم بتتنقل معاه.
job('P6-egypt', () => {
  const d = out('P6-examples/egypt');
  const OLD = path.join(CK, 'P6-examples/egypt');
  const keep = path.join(CK, '__egypt-photos');

  // نحفظ الصور المصرية قبل ما نمسح الفولدر
  if (fs.existsSync(OLD) && !fs.existsSync(keep)) {
    fs.mkdirSync(keep, { recursive: true });
    for (const f of fs.readdirSync(OLD))
      if (/\.(jpe?g|png)$/i.test(f)) fs.copyFileSync(path.join(OLD, f), path.join(keep, f.toLowerCase()));
  }
  if (!fs.existsSync(keep)) throw new Error('صور مصر مش موجودة — الفولدر الأصلى اتمسح');

  copyFrom('P6-starter', d);
  for (const f of fs.readdirSync(keep))
    fs.copyFileSync(path.join(keep, f), path.join(d, 'images', f));

  // الرأس من P6-starter بالظبط (نفس الخطوط ونفس ملفات CSS)، والجسم من عندنا
  const starter = rd(path.join(CK, 'P6-starter/index.html'));
  const head = starter.slice(0, starter.indexOf('<body>'))
    .replace('<title>My website title</title>', '<title>Egypt</title>')
    // اللوحة تتضاف **تحت** default.css زى ما S12 خطوة 2 بتقول بالظبط —
    // مش بدالها. الطفل بيقارن ملفه بالنموذج، فلازم نفس عدد سطور الـ link.
    .replace(/^(.*href="default\.css".*)$/m,
      '$1\n     <link href="palettes/sunset.css" rel="stylesheet" type="text/css" />');
  wr(path.join(d, 'index.html'), head + rd(path.join(path.dirname(fileURLToPath(import.meta.url)), '.egypt-body.html')));
});

// ===========================================================================
// حالات «بعد الجلسة A»
// ===========================================================================

// --- P1-after-A — بعد S02 خطوة 12 (Anime expressions) ---------------------
// المحتوى: h1 + قسم العنوان والفقرة + قسم الصورة الأولى.
// بلا كلاسات وبلا CSS — الكلاسات وربط الملفات بيتعلموا فى S03.
job('P1-after-A', () => {
  const d = out('P1-after-A'); copyFrom('P1-starter', d);
  edit(path.join(d, 'index.html'), [
    ['    <header>\n      \n    </header>',
     '    <header>\n      <h1>Draw anime with me</h1>\n    </header>'],
    ['    <main>\n     \n     \n      <!-- The first drawing and instructions go here -->     \n     \n',
     '    <main>\n\n      <section>\n        <h2>Facial expressions</h2>\n' +
     '        <p>Take a look at these facial expressions and try them in your own drawings.</p>\n' +
     '      </section>\n\n' +
     '      <!-- The first drawing and instructions go here -->\n\n' +
     '      <section>\n        <img src="love.png" alt="The love facial expression.">\n' +
     '        <p>To make your anime character look like they are in love, replace the eyes with two rounded hearts.</p>\n' +
     '      </section>\n\n'],
  ]);
});

// --- P2-after-A — بعد S04 خطوة 11 (Top 5 emojis) --------------------------
// المحتوى: h1 + قائمة مرقمة بخمسة إيموجى + كأس بيلف بكلاس spinme.
job('P2-after-A', () => {
  const d = out('P2-after-A'); copyFrom('P2-starter', d);
  edit(path.join(d, 'index.html'), [
    ['  <header class="secondary border-bottom">\n\n  </header>',
     '  <header class="secondary border-bottom">\n    <h1>Top 5 Emojis!</h1>\n  </header>'],
    ['    <main>\n\n    </main>',
     '    <main>\n\n      <section class="wrap">\n        <ol class="wide">\n' +
     '          <li>🤣 – Rolling on the floor laughing.</li>\n' +
     '          <li>😍 – Smiling face with heart eyes.</li>\n' +
     '          <li>🥳 – Partying face.</li>\n' +
     '          <li>😴 – Sleeping face.</li>\n' +
     '          <li>🤔 – Thinking face.</li>\n' +
     '        </ol>\n' +
     '        <p class="hugefont narrow spinme">🏆</p>\n' +
     '      </section>\n\n    </main>'],
  ]);
});

// --- P3-after-A — بعد S06 خطوة 12 (Flip treat webcards) -------------------
// المحتوى: title + كارت واحد بالتداخل التلاتى card / card-content / card-face.
// بلا gradient ولا rounded ولا shadow — دى بتتعلم فى S07.
job('P3-after-A', () => {
  const d = out('P3-after-A'); copyFrom('P3-starter', d);
  edit(path.join(d, 'index.html'), [
    ['<title>My website title</title>', '<title>Treat flip cards</title>'],
    ['    <main>\n\n\n\n    </main>',
     '    <main>\n\n      <section class="wrap">\n        <div class="card">\n' +
     '          <div class="card-content">\n' +
     '            <div class="card-face">\n' +
     '              <img src="LapisSarawak02.png" alt="Lapis Sarawak">\n' +
     '            </div>\n' +
     '            <div class="card-face">\n' +
     '              <h2>Lapis Sarawak</h2>\n' +
     '              <p>A cake baked in layers to make colourful patterns.</p>\n' +
     '            </div>\n' +
     '          </div>\n' +
     '        </div>\n      </section>\n\n    </main>'],
  ]);
});

// --- P4-after-A — بعد S08 خطوة 8 (Mood board) -----------------------------
// مشروع Design: الطالب بيختار موضوعه. الملف ده **مثال شغال** للغايب —
// موضوع «الفضاء» بلوحة space.css وتلات أقسام بمحتوى مؤقت.
job('P4-after-A', () => {
  const d = out('P4-after-A'); copyFrom('P4-starter', d);
  const f = path.join(d, 'index.html');
  let s = rd(f);
  s = s.replace(/<title>[^<]*<\/title>/, '<title>Space mood board</title>');
  // الخطوة 2 بتقول «<title> و<h1> بالموضوع» — يعنى **استبدال** العنوان الموجود،
  // مش إضافة تانى. الـ starter فيه <h1>Big Title</h1> جوه الـ header.
  s = s.replace('<h1>Big Title</h1>', '<h1>Space</h1>');
  // الخطوة 3 بتقول «<link> فى <head> ← اسم الملف» — يعنى **استبدال** سطر اللوحة
  // الافتراضية default.css، مش سطر زيادة جنبه.
  s = s.replace(/^.*href="default\.css".*$/m,
    '     <link href="palettes/space.css" rel="stylesheet" type="text/css" />');
  s = s.replace(/<main([^>]*)>[\s\S]*?<\/main>/,
    '<main$1>\n\n      <section class="primary">\n        <h2>What space means to me</h2>\n        <p>Lorem ipsum — الكلام النهائى بعدين.</p>\n      </section>\n\n' +
    '      <section class="secondary">\n        <p class="hugefont">🚀</p>\n      </section>\n\n' +
    '      <section class="tertiary">\n        <p>Lorem ipsum — قسم تالت.</p>\n      </section>\n\n    </main>');
  wr(f, s);
});

// --- P5-after-A — بعد S10 خطوة 9 (Sell me something) ----------------------
// مشروع Design: مثال شغال — صفحة هبوط لفكرة «نادى الرسم» بأربعة أقسام والنداء.
job('P5-after-A', () => {
  const d = out('P5-after-A'); copyFrom('P5-starter', d);
  const f = path.join(d, 'index.html');
  let s = rd(f);
  s = s.replace(/<title>[^<]*<\/title>/, '<title>Drawing club</title>');
  if (!/href="pastel\.css"/.test(s)) {
    s = s.replace('</head>', '    <link href="palettes/pastel.css" rel="stylesheet" type="text/css">\n  </head>');
  }
  s = s.replace(/<header([^>]*)>[\s\S]*?<\/header>/,
    '<header$1>\n      <h1>Drawing club</h1>\n      <div class="hugefont">🎨</div>\n    </header>');
  s = s.replace(/<main([^>]*)>[\s\S]*?<\/main>/,
    '<main$1>\n\n      <section class="primary">\n        <p>A weekly club where you learn to draw with friends.</p>\n      </section>\n\n' +
    '      <section class="secondary">\n        <ul>\n          <li>No experience needed.</li>\n          <li>All materials provided.</li>\n          <li>One hour a week.</li>\n        </ul>\n      </section>\n\n' +
    // blockquote جواها p و cite — زى ما S05 بتعلم بالظبط
    '      <section class="tertiary">\n        <blockquote>\n          <p>I could not draw a circle. Now I draw every day.</p>\n          <cite>Mona, age 14</cite>\n        </blockquote>\n      </section>\n\n' +
    // hugefont معرفة فى style.css «للإيموجى الكبير» (6rem) — غلط على عنوان.
    // التوسيط بـ xcenter والعنوان يفضل h2 عادى.
    '      <section class="primary xcenter">\n        <h2>Join us on Saturday</h2>\n        <a href="#">Sign up</a>\n      </section>\n\n    </main>');
  wr(f, s);
});

// --- P6-skeleton — بعد S12 خطوة 6 (Build a webpage) -----------------------
// هيكل صفحة Invent للغايب: عنوان + لوحة ألوان + أربع أقسام بمحتوى مؤقت + فوتر.
job('P6-skeleton', () => {
  const d = out('P6-skeleton'); copyFrom('P6-starter', d);
  const f = path.join(d, 'index.html');
  let s = rd(f);
  // الملف ده اللى الغايب بياخده، فلازم يبان إن خطوة 1 اتعملت فعلا:
  // العنوان والـ h1 بموضوع حقيقى مش placeholder
  s = s.replace(/<title>[^<]*<\/title>/, '<title>Football</title>');
  // الملف فيه عربى، فلازم dir="rtl" وإلا الأسطر العربية بتترسم بالعكس
  s = s.replace('<html lang="en">',
    '<!-- هتكتب عربى؟ السطر اللى تحت لازم يبقى: <html lang="ar" dir="rtl"> -->\n<html lang="ar" dir="rtl">');
  // العنوان الرئيسى واحد بس فى الصفحة — كان فيه <h1> فى الهيدر و<h1> تانى
  // جوه أول section، وS02 بتعلم إن h1 واحد وPS-B-07 بيمتحن فيه
  s = s.replace('<h1>Big Title</h1>', '<h1>Football</h1>');
  if (!/href="sunshine\.css"/.test(s)) {
    s = s.replace('</head>', '    <link href="palettes/sunshine.css" rel="stylesheet" type="text/css">\n  </head>');
  }
  s = s.replace(/<main([^>]*)>[\s\S]*?<\/main>/,
    '<main$1>\n\n      <section class="primary">\n        <h2>What it is</h2>\n        <p>سطر مؤقت — يتغير.</p>\n      </section>\n\n' +
    '      <section class="secondary">\n        <h2>Why I like it</h2>\n        <p>سطر مؤقت — يتغير.</p>\n      </section>\n\n' +
    '      <section class="tertiary">\n        <h2>Three facts</h2>\n        <p>سطر مؤقت — يتغير.</p>\n      </section>\n\n' +
    '      <section class="primary">\n        <h2>Find out more</h2>\n        <p>سطر مؤقت — يتغير.</p>\n      </section>\n\n    </main>');
  if (/<footer([^>]*)>[\s\S]*?<\/footer>/.test(s)) {
    s = s.replace(/<footer([^>]*)>[\s\S]*?<\/footer>/, '<footer$1>\n      <p>عملها [اسمك الأول] — 2026</p>\n    </footer>');
  } else {
    s = s.replace('</body>', '  <footer>\n      <p>عملها [اسمك الأول] — 2026</p>\n    </footer>\n\n</body>');
  }
  wr(f, s);
});

// ===========================================================================
// تحديات التصحيح — خطأ واحد بس فى كل ملف، والباقى حالة الطالب فى اللحظة دى
// ===========================================================================

// DB-B-01 — S03: <h1> مش مقفول، فالفقرة بقت جواه
// الملف بملف CSS منفصل عشان مرحلة Modify بتطلب فتح style.css وتغيير قاعدة h2
job('DB-B-01', () => {
  const d = out('DB-B-01');
  wr(path.join(d, 'index.html'), dbgHtml('My anime page',
`  <header>
    <h1>Draw anime with me
  </header>

  <main>
    <section>
      <h2>Facial expressions</h2>
      <p>Take a look at these facial expressions and try them in your own drawings.</p>
    </section>
  </main>`));
  wr(path.join(d, 'style.css'),
`body {
  font-family: Arial, sans-serif;
  padding: 24px;
}

h1 {
  color: #7c3aed;
}

h2 {
  text-align: left;
}
`);
});

// DB-B-02 — S03 بديل: اسم ملف الصورة غلط
// ملحوظة: الخطأ الأصلى فى البنك كان حرف كبير (`Happy.png`) — ودى **مابتفشلش على
// Windows** لأن نظام الملفات مش حساس لحالة الحروف، فالباج مكانش هيظهر فى المعمل.
// غيرناه لاسم مختلف فعلا عشان يفشل على أى نظام. درس حساسية الحروف مكانه الطبيعى
// جلسات GitHub Pages (S12–S15) لأن السيرفر هناك حساس فعلا.
job('DB-B-02', () => {
  const d = out('DB-B-02');
  fs.mkdirSync(d, { recursive: true });
  fs.copyFileSync(path.join(CK, 'P1-starter/happy.png'), path.join(d, 'happy.png'));
  wr(path.join(d, 'index.html'), dbgOne('My anime page',
`    body { font-family: Arial, sans-serif; padding: 24px; }
    img { width: 220px; }`,
`  <h1>Draw anime with me</h1>
  <img src="happy-face.png" alt="A happy anime face.">
  <p>A happy expression uses big eyes and a wide smile.</p>`));
});

// DB-B-03 — S05: colour بالإملاء البريطانى — CSS بتفهم color بس
job('DB-B-03', () => {
  const d = out('DB-B-03');
  wr(path.join(d, 'index.html'), dbgHtml('Top 5 Emojis!',
`  <h1>Top 5 Emojis!</h1>
  <ol>
    <li>🤣 – Rolling on the floor laughing.</li>
    <li>😍 – Smiling face with heart eyes.</li>
    <li>🥳 – Partying face.</li>
  </ol>`));
  wr(path.join(d, 'style.css'),
`body {
  font-family: Arial, sans-serif;
  padding: 24px;
}

h1 {
  colour: purple;
}
`);
});

// DB-B-04 — S05 بديل: <li> بره <ul>
job('DB-B-04', () => {
  const d = out('DB-B-04');
  wr(path.join(d, 'index.html'), dbgOne('Top 5 Emojis!',
`    body { font-family: Arial, sans-serif; padding: 24px; }`,
`  <h1>Top 5 Emojis!</h1>
  <li>🤣 – Rolling on the floor laughing.</li>
  <li>😍 – Smiling face with heart eyes.</li>
  <li>🥳 – Partying face.</li>`));
});

// DB-B-05 — S07: } ناقصة فى نهاية قاعدة، فكسرت كل القواعد اللى بعدها
job('DB-B-05', () => {
  const d = out('DB-B-05');
  fs.mkdirSync(d, { recursive: true });
  fs.copyFileSync(path.join(CK, 'P3-starter/Knafeh.png'), path.join(d, 'Knafeh.png'));
  wr(path.join(d, 'index.html'), dbgHtml('Treat flip cards',
`  <section class="wrap">
    <div class="card">
      <div class="card-content">
        <div class="card-face">
          <img src="Knafeh.png" alt="Knafeh">
        </div>
        <div class="card-face flipme">
          <h2>Knafeh</h2>
          <p>A warm pastry soaked in syrup, filled with cheese.</p>
        </div>
      </div>
    </div>
  </section>`));
  wr(path.join(d, 'style.css'),
`body {
  font-family: Arial, sans-serif;
  padding: 24px;
}

.card {
  width: 240px;
  height: 300px;
  perspective: 800px;

.card-content {
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.card:hover .card-content {
  transform: rotateY(180deg);
}

.card-face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
}

.flipme {
  transform: rotateY(180deg);
}
`);
});

// DB-B-06 — S09: الكلاس على فقرة واحدة بس من التلاتة
job('DB-B-06', () => {
  const d = out('DB-B-06');
  wr(path.join(d, 'index.html'), dbgHtml('My mood board',
`  <h1>Space</h1>
  <p class="red">The first thing I love about space.</p>
  <p>The second thing I love about space.</p>
  <p>The third thing I love about space.</p>`));
  wr(path.join(d, 'style.css'),
`body {
  font-family: Arial, sans-serif;
  padding: 24px;
}

.red {
  color: #d12b2b;
}
`);
});

// DB-B-07 — S11: القاعدة .card والعنصر كلاسه Card بحرف كبير
job('DB-B-07', () => {
  const d = out('DB-B-07');
  wr(path.join(d, 'index.html'), dbgHtml('Drawing club',
`  <h1>Drawing club</h1>
  <div class="Card">
    <h2>Join us on Saturday</h2>
    <p>No experience needed.</p>
  </div>`));
  wr(path.join(d, 'style.css'),
`body {
  font-family: Arial, sans-serif;
  padding: 24px;
}

.card {
  background: #ff5733;
  padding: 20px;
  border-radius: 12px;
}
`);
});

// DB-B-08 — S13: href بيشاور على اسم ملف مش موجود
job('DB-B-08', () => {
  const d = out('DB-B-08');
  wr(path.join(d, 'index.html'), dbgHtml('My webpage',
`  <h1>My webpage</h1>
  <p>This is the first page.</p>
  <a href="page2.html">Go to the second page</a>`));
  wr(path.join(d, 'page-2.html'), dbgHtml('Page 2',
`  <h1>The second page</h1>
  <p>You made it.</p>
  <a href="index.html">Back</a>`));
  wr(path.join(d, 'style.css'),
`body {
  font-family: Arial, sans-serif;
  padding: 24px;
}

a {
  color: #0aa6a6;
}
`);
});

// ===========================================================================
// first-page — فولدر بلوك البناء فى S01
// هيكل فاضى + ستايل فيه لون ورقم عشان الطالب يغيرهم + صورتين يختار منهم
// ===========================================================================
job('first-page', () => {
  const d = out('first-page');
  fs.mkdirSync(d, { recursive: true });
  for (const img of ['game-boy.jpg', 'fish.jpg']) {
    // الصور اتنقلت لـ images/ بعد ما رتبنا فولدر P4 — بندور فى الاتنين
    const src = ['P4-starter/images/' + img, 'P4-starter/' + img]
      .map(p => path.join(CK, p)).find(p => fs.existsSync(p));
    if (!src) throw new Error('مش لاقى ' + img);
    fs.copyFileSync(src, path.join(d, img));
  }
  wr(path.join(d, 'index.html'), `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>My first page</title>
  <link href="style.css" rel="stylesheet" type="text/css">
</head>
<body>

  <!-- اكتب هنا: عنوان h1 -->

  <!-- اكتب هنا: فقرة p عن حاجة بتحبها -->

  <!-- اكتب هنا: صورة — game-boy.jpg أو fish.jpg -->

</body>
</html>
`);
  wr(path.join(d, 'style.css'), `body {
  font-family: Arial, sans-serif;
  background: #f4f1ff;
  padding: 40px;
}

h1 {
  color: #7c3aed;
  font-size: 48px;
}

p {
  font-size: 20px;
}

img {
  width: 300px;
}
`);
});

// ---------- تباين لوحات الألوان ----------
// S09 بتعلّم التباين وبتسأل الطفل «الكلام باين؟» — فتلات لوحات راسبة فى
// WCAG AA كانت بتخلى الدرس نفسه غلط: الطفل يمشى على القاعدة صح والنتيجة
// تفضل مش مقروءة. الأرقام مقيسة بـ _tools/check-contrast.mjs.
const CONTRAST_FIX = [
  // ملف اللوحة · المتغير · القيمة القديمة · الجديدة · النسبة قبل ← بعد
  ['land-animals.css', '--ontertiary', '#fbfbfb', '#000000', '1.61 ← 12.58'],
  ['companion.css',    '--ontertiary', '#fbfbfb', '#000000', '3.83 ← 5.30'],
  ['water-animals.css','--ontertiary', '#000000', '#ffffff', '4.14 ← 5.07'],
];
job('contrast', () => {
  let n = 0;
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { walk(p); continue; }
      const rule = CONTRAST_FIX.find(r => r[0] === e.name);
      if (!rule) continue;
      const [, v, oldC, newC, note] = rule;
      let s = rd(p);
      const re = new RegExp(`(${v}:\\s*)${oldC}`, 'i');
      if (!re.test(s)) continue;
      s = s.replace(re, `$1${newC}; /* 4U — كان ${oldC}: تباين ${note} */`)
           .replace(new RegExp(`(${v}:[^;]*;[^;]*\\*/);`), '$1');
      wr(p, s); n++;
    }
  })(CK);
  console.log(`    (${n} ملف لوحة اتصحح تباينه)`);
});

// ---------- الخطوط المحلية ----------
// level.md بيقول «بدون إنترنت» و19 ملف مشروع كانوا بيحمّلوا 28 خط من
// fonts.googleapis.com. النت وقع = الصفحة تطلع بخط تانى وتبان مختلفة عن
// اللقطات اللى فى الشرائح، والطفل يفتكر إنه هو اللى غلط.
// الخطوط بتتنزل مرة واحدة بـ _tools/fetch-fonts.mjs وبتتنسخ جوه كل مشروع
// عشان الفولدر يفضل مكتفى ذاتيا لما يتنسخ لجهاز الطفل أو يترفع على Pages.
// S07 لسه بتعلّم Google Fonts من الموقع — التعليم ما اتغيّرش، اللى اتغير إن
// المشروع الجاهز مابقاش معلّق على النت.
const FONTS_SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../_shared/web-fonts');
job('local-fonts', () => {
  if (!fs.existsSync(path.join(FONTS_SRC, 'fonts.css'))) {
    console.log('    (اتخطّى — شغّل node _tools/fetch-fonts.mjs الأول وانت على نت)');
    return;
  }
  let n = 0;
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== 'fonts') walk(p); continue; }
      if (e.name !== 'index.html') continue;

      let s = rd(p);
      if (!/fonts\.googleapis\.com/.test(s) && !s.includes('fonts/fonts.css')) continue;

      // نسخة الخطوط جنب الملف
      const dstFonts = path.join(d, 'fonts');
      fs.mkdirSync(dstFonts, { recursive: true });
      for (const f of fs.readdirSync(FONTS_SRC))
        fs.copyFileSync(path.join(FONTS_SRC, f), path.join(dstFonts, f));

      // كل سطر <link> لجوجل (بما فيهم preconnect) يتشال، وواحد محلى مكانهم
      const LOCAL = '    <link href="fonts/fonts.css" rel="stylesheet" type="text/css" />';
      s = s.replace(/^[ \t]*<link[^>]*fonts\.g(?:oogleapis|static)\.com[^>]*>\n/gmi, '');
      // النسخة متعددة الأسطر (الرابط الطويل بيتلف على أربع سطور)
      s = s.replace(/^[ \t]*<link\n(?:[^>]*\n)*?[^>]*fonts\.googleapis\.com(?:[^>]*\n)*?[^>]*\/>\n/gmi, '');
      if (!s.includes('fonts/fonts.css'))
        s = s.replace(/^([ \t]*<!-- Include CSS style file -->)/m, LOCAL + '\n\n$1');
      if (!s.includes('fonts/fonts.css'))                     // ملفات مالهاش الكومنت ده
        s = s.replace(/^([ \t]*<link[^>]*style\.css[^>]*>)/m, LOCAL + '\n$1');
      // الكومنت الأصلى بيقول «from Google» والحقيقة بقت نسخة محلية
      s = s.replace(/<!-- Import fonts from Google -->\n\s*\n/,
        '<!-- Import fonts — نسخة محلية، الصفحة بتشتغل من غير نت -->\n');
      wr(p, s); n++;
    }
  })(CK);
  console.log(`    (${n} مشروع اتربط بخطوط محلية)`);
});

// ---------- lowercase: آخر job عمدا ----------
// لازم يشتغل بعد كل التوليد، عشان يمسك الملفات اللى الـ jobs اللى فوق كتبتها.
// كان قبل كده فى النص فطلعت P3-after-A بمرجع "LapisSarawak02.png" والملف lowercase.
job('lowercase', () => {
  const n = lowercaseTree(CK);
  // مش كفاية نحول أسماء الملفات — لازم المراجع فى HTML وCSS تتحول معاها،
  // وإلا الصفحة تشتغل على Windows وتتكسر على GitHub Pages (اللى بنحاول نمنعه)
  let r = 0;
  (function fixRefs(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { fixRefs(p); continue; }
      if (!/\.(html|css)$/i.test(e.name)) continue;
      const before = rd(p);
      const after = before.replace(
        /((?:src|href)=["']|url\(["']?)([^"')]+\.(?:jpe?g|png|gif|svg|webp|css))/gi,
        (all, pre, ref) => ref.startsWith('http') ? all : pre + ref.toLowerCase());
      if (after !== before) { wr(p, after); r++; }
    }
  })(CK);
  console.log(`    (${n} ملف اتحول lowercase · ${r} ملف اتصححت مراجعه)`);
});

// ---------- تشغيل ----------
let ok = 0, fail = 0;
for (const [name, fn] of Object.entries(jobs)) {
  if (only && !only.includes(name)) continue;
  try { fn(); ok++; console.log('✓ ' + name); }
  catch (e) { fail++; console.log('✗ ' + name + ': ' + e.message); }
}
console.log(`\nتم: ${ok}${fail ? ' · فشل: ' + fail : ''}`);
