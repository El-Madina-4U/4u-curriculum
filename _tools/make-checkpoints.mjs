// make-checkpoints.mjs — يولد ملفات checkpoints المشتقة من الملفات النهائية لمستوى A1:
//   debug/DB-A-01..09.sb3  (نسخ فيها خطأ مقصود — bank-debug.md)
//   P1..P5-after-A.sb3     (حالة المشروع بعد الجلسة A)
//   P6-skeleton.sb3        (ثلاث خلفيات فاضية + زرار التقليب)
// الاستخدام (من docs/curriculum/): node _tools/make-checkpoints.mjs [--only DB-A-03,P2-after-A]
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as S from './sb3.mjs';

const CK = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../A-scratch/A1/checkpoints');
const only = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null;
const jobs = {};
const job = (name, base, fn) => { jobs[name] = { base, fn }; };
const out = name => path.join(CK, name.startsWith('DB-') ? 'debug/' + name + '.sb3' : name + '.sb3');

// ---------- تطبيع الملفات النهائية (حالة بداية نظيفة، مش بعد التشغيل) ----------
job('P2-final', 'P2-final', p => {
  const set = (n, x, y) => { const t = S.sprite(p, n); t.visible = true; t.x = x; t.y = y; };
  set('Sprite1', 200, -150); set('City Bus', 0, -100); set('Hippo1', -200, 150);
  // رص سكربتات الأتوبيس تحت بعض عشان اللقطة
  const bus = S.sprite(p, 'City Bus'); const ts = S.tops(bus).sort((a, b) => (bus.blocks[a].y || 0) - (bus.blocks[b].y || 0)); ts.forEach((id, i) => { bus.blocks[id].x = 0; bus.blocks[id].y = i * 230; });
});

job('P3-final', 'P3-final', p => { // يفتح على شاشة البداية والحشرة باتجاه طبيعى
  S.stage(p).currentCostume = 0; S.sprite(p, 'Bug').direction = 90;
});
job('P4-final', 'P4-final', p => { // أسماء العيون زى المواد · كوستيوم واحد للعين · تأثير 25
  for (const [from, to] of [['Ball', 'Eyeball'], ['Ball2', 'Eyeball2']]) { const t = S.sprite(p, from); t.name = to; }
  for (const n of ['Eyeball', 'Eyeball2']) {
    const t = S.sprite(p, n); t.costumes = t.costumes.filter(c => c.name === 'ball-a'); t.costumes[0].name = 'eyeball'; t.currentCostume = 0;
    for (const id of Object.keys(t.blocks)) if (t.blocks[id].opcode === 'looks_changeeffectby') S.setInput(t, id, 'CHANGE', S.NUM(25));
  }
});

// P5-final: سكربت تهيئة موحد لكل سبرايت (go to · set size · point in direction · switch costume · show/hide)
// + reset timer عشان الضغطة التانية على العلم ترجع المشهد من الأول
const INIT_OPS = ['motion_gotoxy', 'looks_setsizeto', 'motion_pointindirection', 'motion_setrotationstyle', 'looks_switchcostumeto', 'looks_show', 'looks_hide', 'sensing_resettimer'];
const ORDER = ['sensing_resettimer', 'motion_gotoxy', 'looks_setsizeto', 'motion_pointindirection', 'motion_setrotationstyle', 'looks_switchcostumeto', 'looks_show', 'looks_hide'];
function normalizeInit(t, { resetTimer = false } = {}) {
  // السكربت اللى بيبدأ بالعلم وفيه switch costume من أوائل بلوكاته
  const hat = S.tops(t).find(id => {
    if (t.blocks[id].opcode !== 'event_whenflagclicked') return false;
    let cur = t.blocks[id].next, n = 0;
    while (cur && n < 6) { if (t.blocks[cur].opcode === 'looks_switchcostumeto') return true; if (!INIT_OPS.includes(t.blocks[cur].opcode)) return false; cur = t.blocks[cur].next; n++; }
    return false;
  });
  if (!hat) throw new Error('مفيش سكربت تهيئة فى ' + t.name);
  const found = {};
  let cur = t.blocks[hat].next;
  while (cur && INIT_OPS.includes(t.blocks[cur].opcode)) { const nx = t.blocks[cur].next; found[t.blocks[cur].opcode] = cur; S.unlink(t, cur); cur = nx; }
  const rest = cur;                                   // باقى السكربت (الأنيميشن)
  t.blocks[hat].next = null;
  if (!found.motion_gotoxy) found.motion_gotoxy = S.addBlock(t, { opcode: 'motion_gotoxy', inputs: { X: S.NUM(Math.round(t.x)), Y: S.NUM(Math.round(t.y)) } });
  if (!found.looks_setsizeto) found.looks_setsizeto = S.addBlock(t, { opcode: 'looks_setsizeto', inputs: { SIZE: S.NUM(Math.round(t.size || 100)) } });
  if (resetTimer && !found.sensing_resettimer) found.sensing_resettimer = S.addBlock(t, { opcode: 'sensing_resettimer' });
  let prev = hat;
  for (const op of ORDER) { const id = found[op]; if (!id) continue; S.insertAfter(t, id, prev); prev = id; }
  if (rest) { t.blocks[prev].next = rest; t.blocks[rest].parent = prev; }
}
job('P5-final', 'P5-final', p => {
  normalizeInit(S.sprite(p, 'Egg'), { resetTimer: true });
  normalizeInit(S.sprite(p, 'Dinosaur1'));
  normalizeInit(S.sprite(p, 'Dinosaur4'));
});
job('P6-example', 'P6-example', p => { // Centaur كان بيبدل لكوستيوم مش بتاعه (frank-a)
  const c = S.sprite(p, 'Centaur');
  for (const b of Object.values(c.blocks)) {
    if (b.opcode !== 'looks_switchcostumeto') continue;
    const m = c.blocks[b.inputs.COSTUME[1]];
    if (m && m.fields.COSTUME[0] === 'frank-a') m.fields.COSTUME[0] = 'centaur-a';
  }
});

// ---------- تصحيح ----------
job('DB-A-01', 'P1-final', p => { // say مش متركب تحت الإيفنت
  const t = S.sprite(p, 'Pico'); const hat = t.blocks[S.find(t, 'event_whenthisspriteclicked')];
  S.detach(t, S.find(t, 'looks_sayforsecs'), (hat.x || 0) + 40, (hat.y || 0) + 180);
  S.removeSprite(p, 'Giga'); // Nano يفضل — بيتعرض فى نص PRIMM بتاع S03
});
job('DB-A-02', 'P1-final', p => { // say بدون مدة قبل say ... for
  const t = S.sprite(p, 'Pico'); const id = S.find(t, 'looks_sayforsecs');
  t.blocks[id].opcode = 'looks_say'; delete t.blocks[id].inputs.SECS;
  S.addBlock(t, { opcode: 'looks_sayforsecs', inputs: { MESSAGE: S.TEXT('How are you?'), SECS: S.NUM(2) } }, id);
});
job('DB-A-03', 'P2-final', p => { // move 0 steps
  const t = S.sprite(p, 'Sprite1'); S.setInput(t, S.find(t, 'motion_movesteps'), 'STEPS', S.NUM(0));
});
job('DB-A-04', 'P2-final', p => { // move خارج اللوب
  const t = S.sprite(p, 'Sprite1'); const mv = S.find(t, 'motion_movesteps'); const rep = S.find(t, 'control_repeat');
  S.unlink(t, mv); S.insertAfter(t, mv, rep);
});
job('DB-A-05', 'P4-final', p => { // حالة بعد S08 (Gobo + عينين بلا كليك) والعين التانية بلا forever
  afterS08(p); const t = S.sprite(p, 'Eyeball2'); S.unwrap(t, S.find(t, 'control_forever'));
});
job('DB-A-06', 'P5-final', p => { // show قبل wait
  const t = S.sprite(p, 'Dinosaur4'); const show = S.find(t, 'looks_show'); const hat = t.blocks[show].parent && findTop(t, show);
  S.unlink(t, show); S.insertAfter(t, show, hat);
});
job('DB-A-07', 'P6-example', p => { // العلم بدل الضغط على الزرار
  const t = S.sprite(p, 'Sprite1'); t.blocks[S.find(t, 'event_whenthisspriteclicked')].opcode = 'event_whenflagclicked';
  t.name = 'Next';                       // عشان الطفل يلاقى الزرار وسط 5 سبرايتات
  S.stage(p).currentCostume = 1;         // يفتح على صفحة حقيقية مش الخلفية البيضا
});
job('DB-A-08', 'P1-final', p => { // بلوك الصوت على سبرايت تانى
  const pico = S.sprite(p, 'Pico'), nano = S.sprite(p, 'Nano');
  const snd = S.find(pico, 'sound_play'); const sndName = pico.blocks[pico.blocks[snd].inputs.SOUND_MENU[1]].fields.SOUND_MENU[0];
  S.unlink(pico, snd); for (const id of S.subtree(pico, snd)) delete pico.blocks[id];
  const asset = pico.sounds.find(s => s.name === sndName); if (asset && !nano.sounds.some(s => s.name === sndName)) nano.sounds.push({ ...asset });
  S.addBlock(nano, { opcode: 'sound_play', inputs: { SOUND_MENU: { menu: 'sound_sounds_menu', field: 'SOUND_MENU', value: sndName } } }, S.find(nano, 'event_whenthisspriteclicked'));
});
job('DB-A-09', 'P3-final', p => { // repeat 10 بدل forever
  const t = S.sprite(p, 'Parrot'); const f = S.find(t, 'control_forever'); t.blocks[f].opcode = 'control_repeat'; S.setInput(t, f, 'TIMES', S.INT(10));
});

// ---------- بعد الجلسة A ----------
job('P1-after-A', 'P1-final', p => { S.removeSprite(p, 'Nano'); S.removeSprite(p, 'Giga'); });
job('P2-after-A', 'P2-final', p => {
  const cat = S.sprite(p, 'Sprite1'); for (const op of ['looks_nextcostume', 'looks_show', 'looks_hide', 'control_wait']) { const id = S.find(cat, op); S.unlink(cat, id); delete cat.blocks[id]; } cat.visible = true;
  const bus = S.sprite(p, 'City Bus'); S.keepScripts(bus, b => b.opcode === 'event_whenflagclicked' && bus.blocks[b.next]?.opcode === 'motion_gotoxy');
  for (const op of ['looks_show', 'looks_seteffectto']) { const id = S.find(bus, op); S.unlink(bus, id); delete bus.blocks[id]; } bus.visible = true;
  S.removeSprite(p, 'Hippo1');
});
job('P3-after-A', 'P3-final', p => { // حالة نهاية S06: شاشة البداية + المستوى الأول فقط
  const bug = S.sprite(p, 'Bug');
  S.keepScripts(bug, b => (b.opcode === 'event_whenbackdropswitchesto' && ['start', 'Spotlight'].includes(b.fields.BACKDROP[0])) || b.opcode === 'event_whenthisspriteclicked');
  for (const op of ['sensing_resettimer', 'looks_say', 'sound_playuntildone']) { try { const id = S.find(bug, op); S.unlink(bug, id); for (const x of S.subtree(bug, id)) delete bug.blocks[x]; } catch {} }
  S.removeSprite(p, 'Parrot');
  const st = S.stage(p); st.costumes = st.costumes.filter(c => ['start', 'Spotlight'].includes(c.name)); st.currentCostume = 0;
});
function afterS08(p) { for (const n of ['Gobo', 'Eyeball', 'Eyeball2']) S.keepScripts(S.sprite(p, n), b => b.opcode === 'event_whenflagclicked'); S.removeSprite(p, 'Party Hats'); S.clearScripts(S.stage(p)); }
job('P4-after-A', 'P4-final', p => afterS08(p));
job('P5-after-A', 'P5-final', p => { // حالة نهاية S10: تهيئة للاتنين + جزء الفضول
  const d1 = S.sprite(p, 'Dinosaur1'); const cut = S.find(d1, 'control_wait'); const prev = d1.blocks[cut].parent; for (const id of S.subtree(d1, cut)) delete d1.blocks[id]; d1.blocks[prev].next = null;
  const egg = S.sprite(p, 'Egg'); S.keepScripts(egg, b => b.opcode === 'event_whenflagclicked' && egg.blocks[b.next] && ['sensing_resettimer', 'motion_gotoxy'].includes(egg.blocks[b.next].opcode));
  S.removeSprite(p, 'Dinosaur4');
});
job('P6-skeleton', 'P6-example', (p, files) => {
  for (const n of ['Frank', 'Casey', 'Centaur', 'Butterfly 2']) S.removeSprite(p, n);
  const st = S.stage(p); S.clearScripts(st);
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360" viewBox="0 0 480 360"><rect width="480" height="360" fill="#ffffff"/></svg>');
  const h = S.md5(svg); files.set(h + '.svg', svg);
  st.costumes = ['cover', 'page1', 'page2'].map(name => ({ name, assetId: h, md5ext: h + '.svg', dataFormat: 'svg', rotationCenterX: 240, rotationCenterY: 180, bitmapResolution: 1 }));
  st.currentCostume = 0;
  const btn = S.sprite(p, 'Sprite1'); btn.name = 'Next'; btn.visible = true; btn.x = 190; btn.y = -130;
  const arrow = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="90" height="90" viewBox="0 0 90 90"><circle cx="45" cy="45" r="42" fill="#ff7a00" stroke="#1b1035" stroke-width="4"/><polygon points="36,26 64,45 36,64" fill="#ffffff"/></svg>');
  const ah = S.md5(arrow); files.set(ah + '.svg', arrow);
  btn.costumes = [{ name: 'next', assetId: ah, md5ext: ah + '.svg', dataFormat: 'svg', rotationCenterX: 45, rotationCenterY: 45, bitmapResolution: 1 }]; btn.currentCostume = 0; btn.size = 100;
  // كود الستيج — الخطوة 6 فى بناء 2: الكتاب يفتح على الغلاف
  const hat = S.addBlock(st, { opcode: 'event_whenflagclicked' });
  st.blocks[hat].topLevel = true; st.blocks[hat].x = 60; st.blocks[hat].y = 60;
  S.addBlock(st, { opcode: 'looks_switchbackdropto', inputs: { BACKDROP: { menu: 'looks_backdrops', field: 'BACKDROP', value: 'cover' } } }, hat);
});

// ---------- تشغيل ----------
function findTop(t, id) { let cur = id; while (t.blocks[cur].parent) cur = t.blocks[cur].parent; return cur; }
let ok = 0;
for (const [name, { base, fn }] of Object.entries(jobs)) {
  if (only && !only.includes(name)) continue;
  try {
    const { files, project } = S.load(path.join(CK, base + '.sb3'));
    fn(project, files);
    for (const t of project.targets) t.comments = {}; // بلا تعليقات إنجليزى فى ملفات الأطفال
    S.save({ files, project }, out(name)); ok++; console.log('✓ ' + name);
  } catch (e) { console.log('✗ ' + name + ': ' + e.message); }
}
console.log(`تم: ${ok}`);
