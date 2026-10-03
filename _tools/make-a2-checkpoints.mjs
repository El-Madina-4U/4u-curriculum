#!/usr/bin/env node
// ---------------------------------------------------------------------------
// make-a2-checkpoints.mjs — يولد ملفات A2 المشتقة من الملفات الرسمية المحمّلة
//
//   P1-starter / P1-final   نسخ نظيفة من الأصل (بلا تعديل — الأسماء الرسمية)
//   P1..P3-after-A          حالة المشروع بعد الجلسة A — نقطة رجوع الغايب
//   debug/DB-A-10..15       نسخ فيها خطأ واحد مقصود — bank-debug.md
//
//   node _tools/make-a2-checkpoints.mjs [--only P1-after-A,DB-A-13]
//
// المبدأ زى A1 و B1: كل ملف مشتق ليه قاعدة مكتوبة. ممنوع التعديل اليدوى.
// ---------------------------------------------------------------------------

import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import * as S from './sb3.mjs';

const CK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../A-scratch/A2/checkpoints');
const only = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null;

// الأصول المحمّلة من Raspberry Pi محفوظة فى _src/ وممنوع لمسها — كل مخرج
// بيتولد منها. من غير الفصل ده التشغيلة التانية تدوس على أصلها وتفشل.
const SRC = path.join(CK, '_src');
const jobs = {};
const job = (name, base, fn) => { jobs[name] = { base, fn }; };
// أصول لازم تتنسخ من ملف تانى — الـ job بيملاها والمشغّل بينقل بايتاتها
const assetsToCopy = [];
const out = name => path.join(CK, name.startsWith('DB-') ? 'debug/' + name + '.sb3' : name + '.sb3');

// ---------- أدوات ----------
// إعادة تسمية رسالة: الاسم عايش فى broadcasts على الستيج، وفى fields بتاعة
// كل بلوك بيبعت أو بيستقبل. المعرف نفسه مابيتغيرش.
function renameBroadcast(project, from, to) {
  const st = S.stage(project);
  let id = null;
  for (const [k, v] of Object.entries(st.broadcasts || {})) if (v === from) id = k;
  // ملف البداية لسه مافيهوش رسائل — الطفل هو اللى بيعملها فى الجلسة
  if (!id) return false;
  st.broadcasts[id] = to;
  for (const t of project.targets) {
    for (const b of Object.values(t.blocks || {})) {
      for (const f of Object.values(b.fields || {})) if (Array.isArray(f) && f[0] === from && f[1] === id) f[0] = to;
      for (const i of Object.values(b.inputs || {})) {
        // broadcast_menu بييجى كـ shadow جوه input
        if (Array.isArray(i)) for (const part of i) if (Array.isArray(part) && part[0] === 11 && part[1] === from) part[1] = to;
      }
    }
    // متغير الرسالة ممكن يبقى فى قايمة السبرايت كمان
    if (t.broadcasts) for (const [k, v] of Object.entries(t.broadcasts)) if (v === from) t.broadcasts[k] = to;
  }
}

function renameSprite(project, from, to) {
  const t = S.sprite(project, from);
  t.name = to;
  // أى بلوك بيشاور على السبرايت بالاسم (touching / go to / glide to)
  for (const tt of project.targets)
    for (const b of Object.values(tt.blocks || {}))
      for (const f of Object.values(b.fields || {}))
        if (Array.isArray(f) && f[0] === from) f[0] = to;
}

function renameSound(target, from, to) {
  const s = (target.sounds || []).find(x => x.name === from);
  if (s) s.name = to;
  for (const b of Object.values(target.blocks || {}))
    for (const f of Object.values(b.fields || {}))
      if (Array.isArray(f) && f[0] === from) f[0] = to;
}

// ===========================================================================
// P1 — الأسماء الرسمية زى ما هى (قرار المؤسس، 6 سبتمبر 2026)
// ===========================================================================
// كان فيه اقتراح بتعريب الثيم (عصا ← ريموت · تعويذات ← أوامر). اتنفذ ثم
// اترجع: الرسومات جنية وضفدع ومافيش أصول بديلة أوفلاين، فتغيير الأسماء
// لوحدها كان هيخلى الطفل يشوف جنية والزرار اسمه btn-shape-b — لبس بلا فايدة.
// القرار: الكود يطابق الرسمة بالظبط. مفيش تعريب فى الملف.
const arabiseP1 = () => {};                        // متروكة عمدا فاضية
job('P1-starter', 'P1-starter', arabiseP1);
job('P1-final', 'P1-final', arabiseP1);

// ===========================================================================
// حالات «بعد الجلسة A» — نقطة رجوع الغايب والمتعثر
// ===========================================================================

// P1-after-A — بعد S02: العصا بتتبع الماوس وزرارا التكبير والتصغير شغالين.
// تبديل الشكل والشخصية التانية بيتعلموا فى S03.
job('P1-after-A', 'P1-final', p => {
  // الشخصية التانية بتتضاف فى S03 — مش موجودة بعد S02
  S.removeSprite(p, 'Batter');
  // الزرارات الأربعة **موجودة فى ملف البداية** فماتتشالش — بس زرارى تبديل
  // الشكل لسه مالهمش كود، لأن الطفل بيوصّلهم فى S03. ده اللى بيحصل فعلا
  // على جهازه: أربع أزرار، اتنين شغالين.
  for (const n of ['toad', 'untoad']) S.clearScripts(S.sprite(p, n));
  // والمستقبلات المقابلة عند الجنية والعصا برضه لسه ماتعملتش
  for (const n of ['Fairy', 'Magic Wand']) {
    const t = S.sprite(p, n);
    S.keepScripts(t, b => !(b.opcode === 'event_whenbroadcastreceived'
      && ['toad', 'untoad'].includes(b.fields?.BROADCAST_OPTION?.[0])));
  }
  // صوتا toad وuntoad على العصا **بيحرقوا S03** — الطفل بينسخ صوت ويعكسه
  // فى S03 كخطوة تعليمية. لو لقاهم جاهزين، الخطوة تبقى بلا معنى.
  const wand = S.sprite(p, 'Magic Wand');
  wand.sounds = (wand.sounds || []).filter(s => !['toad', 'untoad'].includes(s.name));
  // وكوستيوم toad على الجنية موجود فى الـ starter — رجّعه من هناك، لأن
  // خطوة تبديل الشكل فى S03 بتعتمد عليه وملف اللحاق لازم يطابق جهاز الطفل
  const src = S.load(path.join(SRC, 'P1-starter.sb3'));
  const sf = S.sprite(src.project, 'Fairy');
  const missing = sf.costumes.filter(c => !S.sprite(p, 'Fairy').costumes.some(x => x.name === c.name));
  for (const c of missing) {
    S.sprite(p, 'Fairy').costumes.push(JSON.parse(JSON.stringify(c)));
    assetsToCopy.push([src.files, c.md5ext]);
  }
});

// P2-after-A — بعد S04: اليعسوب بيتبع الماوس، الحشرة بتتاكل وبتظهر تانى،
// واليعسوب بيكبر لحد 100. الحركة المحسّنة (not) واللون (and) فى S05.
function p2afterA(p) {
  const dr = p.targets.find(t => /dragon/i.test(t.name));
  // إصلاح «الرجفة» بيتعلم فى S05: هو if <not <touching mouse-pointer>>
  // ملفوف حوالين الحركة. بنشيل الـ if نفسه ونسيب اللى جواه — unwrap على
  // الـ if مش على الـ not (الـ not جوه input مش بلوك متركب)
  if (dr) for (const [id, b] of Object.entries(dr.blocks)) {
    if (b.opcode !== 'control_if') continue;
    const cond = b.inputs?.CONDITION?.[1];
    if (cond && dr.blocks[cond]?.opcode === 'operator_not') {
      // subtree عشان تشيل shadow menus كمان (sensing_touchingobjectmenu)
      const dead = S.subtree(dr, cond);
      S.unwrap(dr, id);
      for (const x of dead) delete dr.blocks[x];
      break;
    }
  }
  // الحشرة التانية (لو موجودة) بتتعلم فى S05
  const extra = p.targets.filter(t => /insect|fly|mosquito/i.test(t.name));
  if (extra.length > 1) S.removeSprite(p, extra[extra.length - 1].name);
}
job('P2-after-A', 'P2-final', p2afterA);

// P3-after-A — بعد S06: الستيج والمتغيرات والطبلة الأولى بس (Cymbal).
// الطبلة التانية والتالتة وزرايرهم (if/else) بيتعلموا فى S07.
const KEEP_P3_A = ['Cymbal'];
function p3afterA(p) {
  for (const t of [...p.targets])
    if (!t.isStage && !KEEP_P3_A.includes(t.name)) S.removeSprite(p, t.name);
}
job('P3-after-A', 'P3-final', p3afterA);

// P5-ingredient — مكوّن كود النطّ الرسمى. فيه مرجع ميت: sound_play بيشاور
// على صوت اسمه Jump مش موجود عند Trisha (أصواتها: Footsteps · Squish Pop ·
// Tada · Drum Boing). فالملف على البروجيكتور بيطلع صامت، والخطوة اللى
// بتطلب نفس البلوك من الأطفال مستحيلة. بنوجهه لصوت موجود فعلا — ونفس
// الصوت اللى مثال custard بيستخدمه، فالمسار كله متسق.
job('P5-ingredient-top-down-jumping', 'P5-ingredient-top-down-jumping', p => {
  const t = S.sprite(p, 'Trisha');
  const have = (t.sounds || []).map(s => s.name);
  const want = 'Drum Boing';
  if (!have.includes(want)) throw new Error('الصوت مش موجود عند Trisha: ' + want);
  let fixed = 0;
  for (const b of Object.values(t.blocks || {})) {
    const f = b.fields?.SOUND_MENU;
    if (Array.isArray(f) && !have.includes(f[0])) { f[0] = want; fixed++; }
  }
  if (!fixed) throw new Error('مالقيتش مرجع صوت ميت — يمكن اتصلح قبل كده');
});

// ===========================================================================
// تحديات التصحيح — خطأ واحد بس فى كل ملف
// ===========================================================================

// DB-A-10 — S03: الجنية مستنية groww والزرار بيبعت grow
job('DB-A-10', 'P1-final', p => {
  arabiseP1(p);
  const t = S.sprite(p, 'Fairy');
  for (const b of Object.values(t.blocks))
    if (b.opcode === 'event_whenbroadcastreceived' && b.fields?.BROADCAST_OPTION?.[0] === 'grow')
      b.fields.BROADCAST_OPTION[0] = 'groww';
});

// DB-A-11 — S03 بديل: بلوك الاستقبال على العصا موجود بس مافيش تحته حاجة
job('DB-A-11', 'P1-final', p => {
  arabiseP1(p);
  const t = S.sprite(p, 'Magic Wand');
  for (const [id, b] of Object.entries(t.blocks))
    if (b.opcode === 'event_whenbroadcastreceived'
      && b.fields?.BROADCAST_OPTION?.[0] === 'grow' && b.next) {
      S.detach(t, b.next, 600, 400);                 // الصوت اتفصل وساب مكانه
      b.next = null;
    }
});

// DB-A-12 — S05: الشرط برة forever فبيتفحص مرة واحدة
// مبنى على حالة بعد S04: حشرة واحدة بلا and ولا touching color — لأن
// P2-final فيه Insect2 بالمهارات اللى S05 نفسها بتعلمها، فالملف كان
// بيحرق الجلسة. والباج لازم يبقى على Insect مش Dragonfly.
job('DB-A-12', 'P2-final', p => {
  p2afterA(p);
  const t = p.targets.find(x => x.name === 'Insect');
  if (!t) throw new Error('سبرايت Insect مش موجود');
  // الباج: الـ if **يطلع بره** الـ forever — مش الـ forever يتشال.
  // الفرق مهم: البنك بيقول «الشرط بيتفحص مرة واحدة»، والشريحة بتشاور على
  // الـ forever وهو موجود. لو شلنا اللوب نفسه، بلوك PRIMM كله مالوش معنى.
  // بنحطه **قبل** اللوب — بعد اللوب مابيتنفذش أصلا لأن forever مابيخلصش.
  let foreverId = null, ifId = null;
  for (const [id, b] of Object.entries(t.blocks)) {
    if (b.opcode !== 'control_forever') continue;
    let cur = b.inputs?.SUBSTACK?.[1];
    while (cur) {
      if (t.blocks[cur].opcode === 'control_if') { foreverId = id; ifId = cur; break; }
      cur = t.blocks[cur].next;
    }
    if (ifId) break;
  }
  if (!ifId) throw new Error('مالقيتش if جوه forever على Insect');
  const before = t.blocks[foreverId].parent;          // البلوك اللى قبل اللوب
  if (!before) throw new Error('اللوب مالوش بلوك قبله');
  S.unlink(t, ifId);
  S.insertAfter(t, ifId, before);
});

// DB-A-13 — S07: set beats to 1 بدل change beats by 1 على الطبلة الأولى
// **مبنى على اللعبة الكاملة** — بلوك PRIMM فى S07 بيفتح Get snare ويورى
// change beats by -10، فلو الملف طبلة واحدة بس نص البلوك يبقى مستحيل.
// الباج على Cymbal بس: الطفل بيدق ويدق والرقم فاضل 1، فمش هيقدر يشترى
// أبدا — عرض واحد نضيف رغم إن فيه 5 بلوكات change فى الملف.
job('DB-A-13', 'P3-final', p => {
  for (const t of p.targets)
    for (const [id, b] of Object.entries(t.blocks || {}))
      if (b.opcode === 'data_changevariableby' && /beat/i.test(b.fields?.VARIABLE?.[0] || '')) {
        b.opcode = 'data_setvariableto';
        S.setInput(t, id, 'VALUE', S.TEXT(1));
        return;
      }
  throw new Error('مالقيتش change beats');
});

// DB-A-14 — S07 بديل: مافيش set beats to 0 عند العلم — على اللعبة الكاملة
job('DB-A-14', 'P3-final', p => {
  for (const t of p.targets)
    for (const [id, b] of Object.entries(t.blocks || {}))
      if (b.opcode === 'data_setvariableto' && /beat/i.test(b.fields?.VARIABLE?.[0] || '')
        && String(b.inputs?.VALUE?.[1]?.[1]) === '0') { S.unlink(t, id); delete t.blocks[id]; return; }
  throw new Error('مالقيتش set beats to 0');
});

// DB-A-15 — S11: ترتيب الشروط مقلوب — الميه بتتفحص قبل المنصة
// البنية الأصلية فى custard (اتقريت من الملف):
//   if <size = landed>
//     if <touchingColor #1aa6bc>            ← النهاية
//     if/else <touchingColor #78bd5f>       ← المنصة  (الأخص، الأول)
//        SUBSTACK : اتثبت على المنصة
//        SUBSTACK2: if <touchingColor #ffe123>  ← الكاسترد → خسرت
// الباج = **تبديل الشرطين ومعاهم جسميهما**، مش تبديل الفرعين.
// تبديل الفرعين لوحده بيدى سلوك مالوش معنى والشرط البرانى بيفضل المنصة —
// يعنى بلوك PRIMM كله (20 دقيقة) بيتكلم عن حاجة مش على الشاشة.
const CUSTARD = '#ffe123', PLATFORM = '#78bd5f';
const colorOf = (t, id) => {
  const b = t.blocks[id];
  if (!b || b.opcode !== 'sensing_touchingcolor') return null;
  const c = b.inputs?.COLOR?.[1];
  return Array.isArray(c) ? String(c[1]).toLowerCase() : null;
};
job('DB-A-15', 'P5-example-custard', p => {
  for (const t of p.targets) {
    for (const [id, b] of Object.entries(t.blocks || {})) {
      if (b.opcode !== 'control_if_else') continue;
      if (colorOf(t, b.inputs?.CONDITION?.[1]) !== PLATFORM) continue;
      // جوه else: الـ if بتاع الكاسترد
      let cur = b.inputs?.SUBSTACK2?.[1], inner = null;
      while (cur) {
        if (t.blocks[cur].opcode === 'control_if'
          && colorOf(t, t.blocks[cur].inputs?.CONDITION?.[1]) === CUSTARD) { inner = cur; break; }
        cur = t.blocks[cur].next;
      }
      if (!inner) continue;
      const ib = t.blocks[inner];
      // بدل الشرط والجسم مع بعض — النتيجة: الكاسترد بقى البرانى والمنصة جواه
      const swap = (a, x, k) => { const tmp = a.inputs[k][1]; a.inputs[k][1] = x.inputs[k][1]; x.inputs[k][1] = tmp; };
      swap(b, ib, 'CONDITION');
      swap(b, ib, 'SUBSTACK');
      for (const [holder, key] of [[b, 'CONDITION'], [b, 'SUBSTACK'], [ib, 'CONDITION'], [ib, 'SUBSTACK']]) {
        const cid = holder.inputs[key][1];
        if (t.blocks[cid]) t.blocks[cid].parent = holder === b ? id : inner;
      }
      return;
    }
  }
  throw new Error('مالقيتش if/else بلون المنصة جواه فحص الكاسترد');
});

// ---------- تشغيل ----------
fs.mkdirSync(path.join(CK, 'debug'), { recursive: true });
let ok = 0, fail = 0;
for (const [name, { base, fn }] of Object.entries(jobs)) {
  if (only && !only.includes(name)) continue;
  try {
    const src = path.join(SRC, base + '.sb3');
    if (!fs.existsSync(src)) throw new Error('الأصل مش موجود فى _src/: ' + base + '.sb3');
    const p = S.load(src);
    assetsToCopy.length = 0;
    fn(p.project, p.files);
    // أصول جاية من ملف تانى (كوستيوم أو صوت اترجع من الـ starter) — لازم
    // بايتاتها تتنقل مع تعريفها، وإلا Scratch بيفتح الملف بصورة مكسورة
    for (const [files, md5ext] of assetsToCopy) {
      if (!md5ext || p.files.has(md5ext)) continue;
      const buf = files.get(md5ext);
      if (!buf) throw new Error('أصل مش موجود فى المصدر: ' + md5ext);
      p.files.set(md5ext, buf);
    }
    S.save(p, out(name));
    ok++; console.log('✓ ' + name);
  } catch (e) { fail++; console.log('✗ ' + name + ': ' + e.message); }
}
console.log(`\nتم: ${ok}${fail ? ' · فشل: ' + fail : ''}`);
