// capture.mjs — التقاط لقطات المنهج محليا بـ Playwright (بدون أى رفع خارج الجهاز)
//
// الاستخدام (من داخل docs/curriculum/):
//   node _tools/capture.mjs                 # كل اللقطات الناقصة
//   node _tools/capture.mjs A-UI-02 B-CD-05 # لقطات محددة
//   node _tools/capture.mjs --track A       # مسار واحد
//   node _tools/capture.mjs --force         # إعادة التقاط الموجود
//   node _tools/capture.mjs --list          # عرض الحالة فقط
//   node _tools/capture.mjs --headed        # متصفح ظاهر (للتشخيص)
//
// المتطلبات: Node 18+ · playwright-core (من كاش npx أو node_modules) · Chromium من ms-playwright.
// المسارات تضبط من أعلى الملف أو بمتغيرات البيئة PW_CORE و PW_CHROME.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

// ---------- إعدادات ----------
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const A_ASSETS = path.join(ROOT, 'A-scratch/A1/assets');
const B_ASSETS = path.join(ROOT, 'B-web/B1/assets');
const A_CK = path.join(ROOT, 'A-scratch/A1/checkpoints');
const B_CK = path.join(ROOT, 'B-web/B1/checkpoints');
const TMP = path.join(HERE, '.tmp');
const FONTS = path.join(ROOT, '_shared/fonts');

const PW_CORE = process.env.PW_CORE || findPlaywrightCore();
const PW_CHROME = process.env.PW_CHROME || findChromium();
const VIEWPORT = { width: 1600, height: 900 };
const DPR = 1.5;

const THEME = {
  A: { accent: '#ff7a00', badge: '#ffd60a', label: '#7c3aed', ink: '#1b1035' },
  B: { accent: '#0aa6a6', badge: '#b5f000', label: '#ff3d8a', ink: '#0b1d2a' },
};

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const HEADED = args.includes('--headed');
const LIST = args.includes('--list');
const trackArg = args.includes('--track') ? args[args.indexOf('--track') + 1] : null;
const onlyIds = args.filter(a => /^[AB]-[A-Z]{2}-\d\d[a-z]?$/.test(a));

// ---------- أدوات عامة ----------
function findPlaywrightCore() {
  const roots = [
    path.join(ROOT, 'node_modules/playwright-core'),
    path.join(ROOT, 'node_modules/playwright'),
  ];
  const npx = path.join(process.env.LOCALAPPDATA || '', 'npm-cache/_npx');
  if (fs.existsSync(npx)) {
    for (const d of fs.readdirSync(npx)) {
      const c = path.join(npx, d, 'node_modules/playwright-core');
      if (fs.existsSync(path.join(c, 'package.json'))) roots.push(c);
    }
  }
  const found = roots.find(r => fs.existsSync(path.join(r, 'package.json')));
  if (!found) throw new Error('playwright-core غير موجود — اضبط PW_CORE');
  return found;
}
function findChromium() {
  const base = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (!fs.existsSync(base)) throw new Error('ms-playwright غير موجود — اضبط PW_CHROME');
  const dirs = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().reverse();
  for (const d of dirs) {
    const exe = path.join(base, d, 'chrome-win64/chrome.exe');
    if (fs.existsSync(exe)) return exe;
  }
  throw new Error('Chromium غير موجود — اضبط PW_CHROME');
}
const b64 = f => fs.readFileSync(f).toString('base64');
const fontCSS = () => `
@font-face{font-family:'Baloo';src:url(data:font/woff2;base64,${b64(path.join(FONTS, 'baloo-arabic.woff2'))}) format('woff2');font-weight:500 800;unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF}
@font-face{font-family:'Baloo';src:url(data:font/woff2;base64,${b64(path.join(FONTS, 'baloo-latin.woff2'))}) format('woff2');font-weight:500 800}
@font-face{font-family:'Cairo';src:url(data:font/woff2;base64,${b64(path.join(FONTS, 'cairo-arabic.woff2'))}) format('woff2');font-weight:400 700;unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF}
@font-face{font-family:'Cairo';src:url(data:font/woff2;base64,${b64(path.join(FONTS, 'cairo-latin.woff2'))}) format('woff2');font-weight:400 700}`;
let FONT_CSS_CACHE = null;
const fontCss = () => (FONT_CSS_CACHE ??= fontCSS());

// ---------- zip بسيط (تخزين بدون ضغط) لملفات .sb3 ----------
const crcTable = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function zipStore(files, out) {
  const parts = []; const cd = []; let off = 0;
  for (const [name, data] of files) {
    const n = Buffer.from(name), crc = crc32(data);
    const lh = Buffer.alloc(30); lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(0, 6); lh.writeUInt16LE(0, 8); lh.writeUInt16LE(0, 10); lh.writeUInt16LE(0, 12); lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(data.length, 18); lh.writeUInt32LE(data.length, 22); lh.writeUInt16LE(n.length, 26); lh.writeUInt16LE(0, 28);
    const ch = Buffer.alloc(46); ch.writeUInt32LE(0x02014b50, 0); ch.writeUInt16LE(20, 4); ch.writeUInt16LE(20, 6); ch.writeUInt16LE(0, 8); ch.writeUInt16LE(0, 10); ch.writeUInt16LE(0, 12); ch.writeUInt16LE(0, 14); ch.writeUInt32LE(crc, 16); ch.writeUInt32LE(data.length, 20); ch.writeUInt32LE(data.length, 24); ch.writeUInt16LE(n.length, 28); ch.writeUInt16LE(0, 30); ch.writeUInt16LE(0, 32); ch.writeUInt16LE(0, 34); ch.writeUInt16LE(0, 36); ch.writeUInt32LE(0, 38); ch.writeUInt32LE(off, 42);
    parts.push(lh, n, data); cd.push(ch, n); off += lh.length + n.length + data.length;
  }
  const cdBuf = Buffer.concat(cd);
  const end = Buffer.alloc(22); end.writeUInt32LE(0x06054b50, 0); end.writeUInt16LE(0, 4); end.writeUInt16LE(0, 6); end.writeUInt16LE(files.length, 8); end.writeUInt16LE(files.length, 10); end.writeUInt32LE(cdBuf.length, 12); end.writeUInt32LE(off, 16); end.writeUInt16LE(0, 20);
  fs.writeFileSync(out, Buffer.concat([...parts, cdBuf, end]));
}
// قراءة zip (يدعم store و deflate)
function unzip(file) {
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

// ---------- مولد سكربتات Scratch ----------
// يأخذ ملف أساس ويستبدل بلوكات سبرايت باسمه ببلوكات مولدة
function makeScriptSb3(baseSb3, spriteName, scripts, outFile) {
  const files = unzip(baseSb3);
  const proj = JSON.parse(files.get('project.json').toString());
  const target = proj.targets.find(t => t.name === spriteName);
  if (!target) throw new Error(`السبرايت ${spriteName} غير موجود فى ${baseSb3}`);
  const blocks = {}; let n = 0; const nid = () => 'b' + (++n);
  // script = { x, y, seq: [ {op, inputs?, fields?, sub?: seq} ... ] }
  const emit = (seq, parent, x, y) => {
    let prev = null, first = null;
    for (const s of seq) {
      const id = nid();
      const blk = { opcode: s.op, next: null, parent: prev || parent || null, inputs: {}, fields: {}, shadow: false, topLevel: !prev && !parent };
      if (blk.topLevel) { blk.x = x; blk.y = y; }
      for (const [k, v] of Object.entries(s.inputs || {})) {
        if (Array.isArray(v)) blk.inputs[k] = [1, v];               // shadow قيمة: [4,"10"] رقم · [10,"hi"] نص · [6,"10"] عدد صحيح · [5,"1"] موجب
        else if (v && v.menu) {                                       // قائمة: {menu:'motion_pointtowards_menu', field:'TOWARDS', value:'_mouse_'}
          const mid = nid(); blocks[mid] = { opcode: v.menu, next: null, parent: id, inputs: {}, fields: { [v.field]: [v.value, null] }, shadow: true, topLevel: false };
          blk.inputs[k] = [1, mid];
        }
      }
      for (const [k, v] of Object.entries(s.fields || {})) blk.fields[k] = [v, null];
      if (s.sub) { const subFirst = emit(s.sub, id); if (subFirst) blk.inputs.SUBSTACK = [2, subFirst]; }
      blocks[id] = blk;
      if (prev) blocks[prev].next = id; else first = id;
      prev = id;
    }
    return first;
  };
  for (const sc of scripts) emit(sc.seq, null, sc.x, sc.y);
  target.blocks = blocks;
  files.set('project.json', Buffer.from(JSON.stringify(proj)));
  zipStore([...files.entries()], outFile);
  return outFile;
}
const V = { num: v => [4, String(v)], str: v => [10, String(v)], int: v => [6, String(v)], pos: v => [5, String(v)] };
const B = {
  flag: () => ({ op: 'event_whenflagclicked' }),
  clicked: () => ({ op: 'event_whenthisspriteclicked' }),
  say: (m = 'Hello!') => ({ op: 'looks_say', inputs: { MESSAGE: V.str(m) } }),
  sayFor: (m = 'Hello!', s = 2) => ({ op: 'looks_sayforsecs', inputs: { MESSAGE: V.str(m), SECS: V.num(s) } }),
  wait: (s = 1) => ({ op: 'control_wait', inputs: { DURATION: V.pos(s) } }),
  repeat: (n, sub) => ({ op: 'control_repeat', inputs: { TIMES: V.int(n) }, sub }),
  forever: sub => ({ op: 'control_forever', sub }),
  move: (n = 10) => ({ op: 'motion_movesteps', inputs: { STEPS: V.num(n) } }),
  pointMouse: () => ({ op: 'motion_pointtowards', inputs: { TOWARDS: { menu: 'motion_pointtowards_menu', field: 'TOWARDS', value: '_mouse_' } } }),
  hide: () => ({ op: 'looks_hide' }),
  show: () => ({ op: 'looks_show' }),
  nextBackdrop: () => ({ op: 'looks_nextbackdrop' }),
};

// ---------- طبقة التحويط (تحقن داخل الصفحة) ----------
// items: [{ rect:{x,y,w,h} | sel:'css' | fn, n?, label?, pad?, cursor? }] · opts: { dim, theme }
function OVERLAY_FN(payload) {
  const { items, theme, dim, fontCss } = payload;
  document.getElementById('__4u')?.remove();
  const W = innerWidth, H = innerHeight;
  const root = document.createElement('div'); root.id = '__4u';
  root.style.cssText = 'position:fixed;inset:0;z-index:2147483647;pointer-events:none;font-family:Baloo,Cairo,sans-serif';
  const st = document.createElement('style'); st.textContent = fontCss + `
    #__4u .bd{position:absolute;width:46px;height:46px;border-radius:50%;background:${theme.badge};color:${theme.ink};font:800 26px/46px Baloo,sans-serif;text-align:center;border:3px solid #fff;box-shadow:0 6px 0 rgba(0,0,0,.18),0 10px 24px rgba(0,0,0,.25);transform:rotate(-8deg)}
    #__4u .lb{position:absolute;max-width:420px;padding:6px 16px 8px;border-radius:999px;background:${theme.label};color:#fff;font:700 22px/1.3 Baloo,Cairo,sans-serif;direction:rtl;white-space:nowrap;border:3px solid #fff;box-shadow:0 6px 0 rgba(0,0,0,.18),0 10px 24px rgba(0,0,0,.25);transform:rotate(-2deg)}
    #__4u .cur{position:absolute;width:38px;height:38px;filter:drop-shadow(0 3px 4px rgba(0,0,0,.4))}`;
  root.appendChild(st);
  const NS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('width', W); svg.setAttribute('height', H); svg.style.cssText = 'position:absolute;inset:0;overflow:visible';
  const defs = document.createElementNS(NS, 'defs');
  defs.innerHTML = `<mask id="__4um"><rect width="${W}" height="${H}" fill="#fff"/>${items.map(i => `<rect x="${i.r.x}" y="${i.r.y}" width="${i.r.w}" height="${i.r.h}" rx="14" fill="#000"/>`).join('')}</mask>
    <filter id="__4us" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="6" stdDeviation="6" flood-color="#000" flood-opacity=".35"/></filter>`;
  svg.appendChild(defs);
  if (dim > 0) { const d = document.createElementNS(NS, 'rect'); d.setAttribute('width', W); d.setAttribute('height', H); d.setAttribute('fill', 'rgba(11,29,42,' + dim + ')'); d.setAttribute('mask', 'url(#__4um)'); svg.appendChild(d); }
  for (const it of items) {
    const r = it.r;
    const halo = document.createElementNS(NS, 'rect'); halo.setAttribute('x', r.x); halo.setAttribute('y', r.y); halo.setAttribute('width', r.w); halo.setAttribute('height', r.h); halo.setAttribute('rx', 14); halo.setAttribute('fill', 'none'); halo.setAttribute('stroke', '#fff'); halo.setAttribute('stroke-width', 11); halo.setAttribute('filter', 'url(#__4us)'); svg.appendChild(halo);
    const box = document.createElementNS(NS, 'rect'); box.setAttribute('x', r.x); box.setAttribute('y', r.y); box.setAttribute('width', r.w); box.setAttribute('height', r.h); box.setAttribute('rx', 14); box.setAttribute('fill', 'none'); box.setAttribute('stroke', theme.accent); box.setAttribute('stroke-width', 5); svg.appendChild(box);
  }
  root.appendChild(svg);
  document.body.appendChild(root);
  for (const it of items) {
    const r = it.r;
    if (it.n != null) { const b = document.createElement('div'); b.className = 'bd'; b.textContent = it.n; b.style.left = Math.max(4, r.x - 22) + 'px'; b.style.top = Math.max(4, r.y - 22) + 'px'; root.appendChild(b); }
    if (it.label) {
      const l = document.createElement('div'); l.className = 'lb'; l.textContent = it.label; root.appendChild(l);
      const lw = l.offsetWidth, lh = l.offsetHeight;
      let x = r.x + r.w / 2 - lw / 2, y = r.y + r.h + 14;
      if (it.labelPos === 'top' || y + lh > H - 8) y = r.y - lh - 14;
      if (it.labelPos === 'right') { x = r.x + r.w + 16; y = r.y + r.h / 2 - lh / 2; }
      if (it.labelPos === 'left') { x = r.x - lw - 16; y = r.y + r.h / 2 - lh / 2; }
      if (it.labelPos === 'inside') { x = r.x + r.w - lw - 14; y = r.y + 14; }
      x = Math.max(8, Math.min(W - lw - 8, x)); y = Math.max(8, Math.min(H - lh - 8, y));
      l.style.left = x + 'px'; l.style.top = y + 'px';
    }
    if (it.cursor) { const c = document.createElement('div'); c.className = 'cur'; c.style.left = it.cursor.x + 'px'; c.style.top = it.cursor.y + 'px'; c.innerHTML = '<svg viewBox="0 0 24 24" width="38" height="38"><path d="M5 3l14 9-6 1.5L16 20l-3 1.3-3-6.6L5 19z" fill="#fff" stroke="#111" stroke-width="1.5" stroke-linejoin="round"/></svg>'; root.appendChild(c); }
  }
  return items.length;
}

async function annotate(page, items, { theme = 'A', dim = 0.38 } = {}) {
  const resolved = [];
  for (const it of items) {
    let r = it.rect;
    if (!r && it.sel) r = await rectOf(page, it.sel);
    if (!r) { console.warn('   ⚠ تحويط بدون مستطيل:', it.label || it.n || it.sel); continue; }
    const pad = it.pad ?? 8;
    let x = r.x - pad, y = r.y - pad, x2 = r.x + r.w + pad, y2 = r.y + r.h + pad;
    x = Math.max(6, x); y = Math.max(6, y); x2 = Math.min(VIEWPORT.width - 6, x2); y2 = Math.min(VIEWPORT.height - 6, y2);
    resolved.push({ ...it, r: { x, y, w: x2 - x, h: y2 - y } });
  }
  await page.evaluate(OVERLAY_FN, { items: resolved, theme: THEME[theme], dim, fontCss: fontCss() });
  await page.waitForTimeout(250);
}
const clearOverlay = page => page.evaluate(() => document.getElementById('__4u')?.remove());
async function rectOf(page, sel, idx = 0) {
  return page.evaluate(([sel, idx]) => {
    const el = document.querySelectorAll(sel)[idx]; if (!el) return null;
    const r = el.getBoundingClientRect(); return { x: r.x, y: r.y, w: r.width, h: r.height };
  }, [sel, idx]);
}
const union = rs => { const xs = rs.map(r => r.x), ys = rs.map(r => r.y), x2 = rs.map(r => r.x + r.w), y2 = rs.map(r => r.y + r.h); return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...x2) - Math.min(...xs), h: Math.max(...y2) - Math.min(...ys) }; };

async function shoot(page, file, clip) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const opts = { path: file, type: 'png' };
  if (clip) opts.clip = { x: Math.max(0, clip.x), y: Math.max(0, clip.y), width: clip.w, height: clip.h };
  await page.screenshot(opts);
  await clearOverlay(page);
}

// ---------- Scratch ----------
class Scratch {
  constructor(ctx) { this.ctx = ctx; this.page = null; this.loaded = null; }
  async open() {
    if (this.page) return this.page;
    const page = await this.ctx.newPage();
    page.on('dialog', d => d.accept());
    await page.goto('https://scratch.mit.edu/projects/editor/', { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForSelector('.blocklyWorkspace', { timeout: 90000 });
    await page.waitForTimeout(2500);
    this.page = page; return page;
  }
  async fresh() { // محرر فاضى
    const page = await this.open();
    if (this.loaded !== null) { await page.reload({ waitUntil: 'domcontentloaded' }); await page.waitForSelector('.blocklyWorkspace', { timeout: 90000 }); await page.waitForTimeout(2500); this.loaded = null; }
    await this.closeMenus();
    await page.locator('[class*="react-tabs__tab_"]', { hasText: 'Code' }).first().click().catch(() => {});
    await page.waitForTimeout(400);
    return page;
  }
  async load(sb3) {
    const page = await this.open();
    if (this.loaded === sb3) { await this.closeMenus(); return page; }
    await this.closeMenus();
    await page.getByText('File', { exact: true }).first().click();
    await page.waitForTimeout(300);
    const [chooser] = await Promise.all([
      page.waitForEvent('filechooser', { timeout: 15000 }),
      page.locator('[class*="menu_menu-item"]', { hasText: 'Load from your computer' }).first().click(),
    ]);
    await chooser.setFiles(sb3);
    await page.waitForTimeout(800);
    await page.waitForSelector('[class*="loader_background"]', { state: 'detached', timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
    await this.closeMenus();
    this.loaded = sb3;
    return page;
  }
  async closeMenus() { await this.page.keyboard.press('Escape').catch(() => {}); await this.page.mouse.click(700, 500); await this.page.waitForTimeout(150); }
  async category(name) {
    const page = this.page;
    await page.locator('.blocklyToolboxCategory', { hasText: new RegExp('^' + name + '$') }).first().click();
    await page.waitForTimeout(900);
  }
  async flyoutRect(opcode) { // يرجع مستطيل بلوك فى الـ flyout ويسحب لو مش ظاهر
    const page = this.page;
    for (let i = 0; i < 6; i++) {
      const r = await rectOf(page, `.blocklyFlyout g.blocklyDraggable.${opcode}`);
      if (!r) throw new Error('بلوك غير موجود فى الـ flyout: ' + opcode);
      if (r.y >= 100 && r.y + r.h <= VIEWPORT.height - 40) return r;
      await page.mouse.move(180, 500);
      await page.mouse.wheel(0, r.y - 260);
      await page.waitForTimeout(500);
    }
    throw new Error('فشل إظهار البلوك: ' + opcode);
  }
  async scriptRect() { // اتحاد كل السكربتات فى مساحة الكود
    return this.page.evaluate(() => {
      const gs = [...document.querySelectorAll('.blocklyWorkspace > .blocklyBlockCanvas > g.blocklyDraggable')].filter(g => !g.closest('.blocklyFlyout'));
      if (!gs.length) return null;
      const rs = gs.map(g => g.getBoundingClientRect());
      const x = Math.min(...rs.map(r => r.left)), y = Math.min(...rs.map(r => r.top));
      return { x, y, w: Math.max(...rs.map(r => r.right)) - x, h: Math.max(...rs.map(r => r.bottom)) - y, each: rs.map(r => ({ x: r.left, y: r.top, w: r.width, h: r.height })) };
    });
  }
  async greenFlag() { await this.page.locator('[class*="green-flag_green-flag"]').first().click(); }
  async stop() { await this.page.locator('[class*="stop-all_stop-all"]').first().click().catch(() => {}); }
  async fullscreen() { await this.page.locator('[aria-label="Enter full screen mode"]').first().click(); await this.page.waitForTimeout(800); }
  async exitFullscreen() { await this.page.keyboard.press('Escape'); await this.page.waitForTimeout(500); }
  async stageCanvasRect() {
    return this.page.evaluate(() => {
      const cs = [...document.querySelectorAll('canvas')].map(c => c.getBoundingClientRect()).filter(r => r.width > 300);
      const r = cs.sort((a, b) => b.width - a.width)[0]; return r ? { x: r.x, y: r.y, w: r.width, h: r.height } : null;
    });
  }
}

// ---------- صفحة «المحرر» لمسار B ----------
function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
function hlHTML(code) {
  let s = esc(code);
  s = s.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="c">$1</span>');
  s = s.replace(/(&lt;\/?)([a-zA-Z][\w-]*)([^&]*?)(\/?&gt;)/g, (m, o, t, a, c) => {
    a = a.replace(/([\w-]+)(=)("[^"]*")/g, '<span class="a">$1</span>$2<span class="s">$3</span>');
    return `<span class="p">${o}</span><span class="t">${t}</span>${a}<span class="p">${c}</span>`;
  });
  return s;
}
function hlCSS(code) {
  let s = esc(code);
  s = s.replace(/(\/\*[\s\S]*?\*\/)/g, '<span class="c">$1</span>');
  s = s.replace(/^([^{}\n:]+?)(\s*\{)/gm, (m, sel, br) => /^\s*@/.test(sel) ? `<span class="k">${sel}</span>${br}` : `<span class="sel">${sel}</span>${br}`);
  s = s.replace(/^(\s*)([\w-]+)(\s*:\s*)([^;\n]+)(;?)/gm, '$1<span class="pr">$2</span>$3<span class="v">$4</span>$5');
  return s;
}
function editorPage({ files, active = 0, preview, zoom = false, base, bg = 'B', title = 'index.html', previewW = 46 }) {
  const f = files[active];
  const code = f.lang === 'css' ? hlCSS(f.code) : hlHTML(f.code);
  const lines = f.code.split('\n').length;
  const nums = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
  const fontSize = zoom ? 46 : 24;
  const srcdoc = preview ? esc(`<!doctype html><html><head><meta charset="utf-8">${base ? `<base href="${base}">` : ''}<style>${preview.css || ''}</style></head><body>${preview.html || ''}</body></html>`).replace(/"/g, '&quot;') : '';
  const prev = preview ? `<div class="win browser"><div class="bar"><span class="dots"><i></i><i></i><i></i></span><span class="url">${title}</span></div><iframe id="pv" sandbox="allow-same-origin" srcdoc="${srcdoc}"></iframe></div>` : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
${fontCss()}
*{box-sizing:border-box}html,body{margin:0;height:100%}
body{width:1600px;height:900px;overflow:hidden;background:linear-gradient(135deg,#e0fbf7,#e0f0ff 55%,#f6e0ff);display:flex;align-items:center;justify-content:center;gap:28px;padding:40px;font-family:Cairo,sans-serif}
.win{border-radius:18px;box-shadow:0 24px 60px rgba(11,29,42,.28),0 4px 0 rgba(0,0,0,.08);overflow:hidden;display:flex;flex-direction:column}
.editor{flex:${preview ? 100 - previewW : 100};height:${zoom ? 'auto' : '100%'};background:#1e1e2e;color:#cdd6f4;max-width:${zoom ? '1300px' : 'none'}}
.browser{flex:${previewW};height:100%;background:#fff}
.bar{height:46px;display:flex;align-items:center;gap:14px;padding:0 16px;background:#181825;font:600 15px Cairo,sans-serif;color:#a6adc8}
.browser .bar{background:#f1f5f9;color:#334155;border-bottom:1px solid #e2e8f0}
.dots{display:flex;gap:7px}.dots i{width:13px;height:13px;border-radius:50%;background:#ff5f57}.dots i:nth-child(2){background:#febc2e}.dots i:nth-child(3){background:#28c840}
.tabs{display:flex;gap:2px;margin-inline-start:10px}.tab{padding:9px 18px;border-radius:10px 10px 0 0;background:#24243a;color:#7f849c;font:600 15px Consolas,monospace}.tab.on{background:#1e1e2e;color:#f5e0dc;box-shadow:inset 0 -3px 0 #0aa6a6}
.url{flex:1;background:#fff;border:1px solid #cbd5e1;border-radius:999px;padding:5px 14px;font:500 14px Consolas,monospace;color:#0f172a}
.code{display:flex;flex:1;overflow:hidden;padding:20px 0;font:${fontSize}px/1.55 Consolas,'Cascadia Code',monospace}
.ln{padding:0 18px 0 22px;text-align:right;color:#585b70;user-select:none;white-space:pre}
pre{margin:0;flex:1;white-space:pre;tab-size:2;padding-right:20px}
.t{color:#f38ba8}.p{color:#9399b2}.a{color:#89b4fa}.s{color:#a6e3a1}.c{color:#6c7086;font-style:italic}.sel{color:#f9e2af}.pr{color:#89dceb}.v{color:#fab387}.k{color:#cba6f7}
iframe{border:0;flex:1;width:100%;background:#fff}
</style></head><body>
<div class="win editor"><div class="bar"><span class="dots"><i></i><i></i><i></i></span><div class="tabs">${files.map((x, i) => `<span class="tab${i === active ? ' on' : ''}">${x.name}</span>`).join('')}</div></div>
<div class="code"><div class="ln">${nums}</div><pre id="code">${code}</pre></div></div>
${prev}
</body></html>`;
}
// مستطيل نص داخل <pre id=code> بالبحث عن نص حرفى
async function textRect(page, text, nth = 0, sel = '#code') {
  return page.evaluate(([text, nth, sel]) => {
    const root = document.querySelector(sel); const full = root.textContent;
    let idx = -1; for (let i = 0; i <= nth; i++) { idx = full.indexOf(text, idx + 1); if (idx < 0) return null; }
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT); let pos = 0, sN = null, sO = 0, eN = null, eO = 0, node;
    while ((node = walker.nextNode())) { const len = node.nodeValue.length; if (!sN && idx < pos + len) { sN = node; sO = idx - pos; } if (!eN && idx + text.length <= pos + len) { eN = node; eO = idx + text.length - pos; break; } pos += len; }
    if (!sN || !eN) return null; const r = document.createRange(); r.setStart(sN, sO); r.setEnd(eN, eO);
    const rs = [...r.getClientRects()]; if (!rs.length) return null;
    const x = Math.min(...rs.map(q => q.left)), y = Math.min(...rs.map(q => q.top));
    return { x, y, w: Math.max(...rs.map(q => q.right)) - x, h: Math.max(...rs.map(q => q.bottom)) - y };
  }, [text, nth, sel]);
}
async function iframeElRect(page, sel, idx = 0) {
  return page.evaluate(([sel, idx]) => {
    const f = document.getElementById('pv'); const fr = f.getBoundingClientRect();
    const el = f.contentDocument.querySelectorAll(sel)[idx]; if (!el) return null;
    const r = el.getBoundingClientRect(); return { x: fr.x + r.x, y: fr.y + r.y, w: r.width, h: r.height };
  }, [sel, idx]);
}
async function openEditor(ctx, spec) {
  fs.mkdirSync(TMP, { recursive: true });
  const f = path.join(TMP, 'editor.html'); fs.writeFileSync(f, editorPage(spec));
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(f).href);
  await page.waitForTimeout(700);
  return page;
}
const fileUrl = p => pathToFileURL(p).href + '/';
const SAMPLE_IMG = 'happy.png'; // من P1-final

// ---------- سجل اللقطات ----------
const shots = [];
const A = (id, run) => shots.push({ id, track: 'A', out: path.join(A_ASSETS, id + '.png'), run });
const Bs = (id, run) => shots.push({ id, track: 'B', out: path.join(B_ASSETS, id + '.png'), run });

// --- A-UI ---
// تخفى عناصر المحرر الأونلاين اللى مش موجودة فى Scratch Desktop (Debug · Join Scratch · Sign in)
async function desktopLook(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll('[class*="menu-bar_menu-bar-item"], [class*="menu-bar_account"], [class*="menu-bar_mystuff"], [class*="menu-bar_feedback"]')) {
      const t = (el.textContent || '').trim();
      if (/^(Debug|Join Scratch|Sign in|Give Feedback)$/.test(t) || /account|mystuff|feedback/.test(el.className)) el.style.display = 'none';
    }
  });
}
const clampClip = c => ({ x: Math.max(0, c.x), y: Math.max(0, c.y), w: Math.min(VIEWPORT.width - Math.max(0, c.x), c.w), h: Math.min(VIEWPORT.height - Math.max(0, c.y), c.h) });
const P1A = () => path.join(A_CK, 'P1-after-A.sb3'), P2A = () => path.join(A_CK, 'P2-after-A.sb3');

A('A-UI-01', async ({ sc, out }) => { const p = await sc.fresh(); await desktopLook(p); await shoot(p, out); });
A('A-UI-02', async ({ sc, out }) => {
  const p = await sc.fresh(); await desktopLook(p);
  const tb = await rectOf(p, '[class*="blocks_blocks"]'), fl = await rectOf(p, '.blocklyFlyout'), inj = tb;
  const stage = await rectOf(p, '[class*="stage_stage_"]');
  const sprites = (await rectOf(p, '[class*="sprite-selector_sprite-selector_"]')) || (await rectOf(p, '[class*="target-pane_target-pane"]'));
  const palette = { x: tb.x, y: tb.y, w: fl.x + fl.w - tb.x, h: tb.h };
  const codeArea = { x: fl.x + fl.w, y: inj.y, w: inj.x + inj.w - fl.x - fl.w, h: inj.h };
  await annotate(p, [
    { rect: palette, n: 1, label: 'البلوكات', pad: -4, labelPos: 'inside' },
    { rect: codeArea, n: 2, label: 'مساحة الكود', pad: -6, labelPos: 'inside' },
    { rect: stage, n: 3, label: 'الستيج', pad: -2, labelPos: 'inside' },
    { rect: sprites, n: 4, label: 'السبرايتات', pad: -4, labelPos: 'inside' },
  ], { theme: 'A', dim: 0.25 });
  await shoot(p, out);
});
A('A-UI-03', async ({ sc, out }) => { const p = await sc.fresh(); await desktopLook(p); const r = await rectOf(p, '[class*="green-flag_green-flag"]'); await annotate(p, [{ sel: '[class*="green-flag_green-flag"]', label: 'العلم الأخضر = ابدأ', pad: 10, labelPos: 'left' }, { sel: '[class*="stop-all_stop-all"]', label: 'وقف', pad: 10, labelPos: 'right' }]); await shoot(p, out, clampClip({ x: r.x - 420, y: r.y - 60, w: 760, h: 300 })); });
A('A-UI-04', async ({ sc, out }) => { const p = await sc.fresh(); await desktopLook(p); await annotate(p, [{ sel: '.blocklyToolboxCategoryGroup', label: 'الفئات — كل لون نوع', pad: 4, labelPos: 'right' }]); await shoot(p, out); });
A('A-UI-05', async ({ sc, out }) => { const p = await sc.fresh(); await desktopLook(p); const r = await rectOf(p, '[class*="sprite-selector_add-button"]'); await annotate(p, [{ sel: '[class*="sprite-selector_add-button"]', label: 'سبرايت جديد', pad: 6, labelPos: 'left' }]); await shoot(p, out, clampClip({ x: r.x - 560, y: r.y - 300, w: 700, h: 400 })); });
A('A-UI-06', async ({ sc, out }) => {
  const p = await sc.fresh(); await desktopLook(p);
  await p.locator('[class*="sprite-selector_add-button"] [class*="action-menu_main-button"], [class*="sprite-selector_add-button"] button').first().click();
  await p.waitForSelector('[class*="library-item_library-item"]', { timeout: 30000 }); await p.waitForTimeout(2500);
  await shoot(p, out); await p.keyboard.press('Escape');
});
A('A-UI-07', async ({ sc, out }) => { const p = await sc.fresh(); await desktopLook(p); await p.locator('[class*="react-tabs__tab_"]', { hasText: 'Costumes' }).first().click(); await p.waitForTimeout(1500); await annotate(p, [{ sel: '[class*="react-tabs__tab_"]:nth-child(2)', label: 'تاب الكوستيومات', pad: 4, labelPos: 'right' }]); await shoot(p, out, { x: 0, y: 0, w: 900, h: 560 }); });
A('A-UI-08', async ({ sc, out }) => { const p = await sc.fresh(); await desktopLook(p); await p.locator('[class*="react-tabs__tab_"]', { hasText: 'Sounds' }).first().click(); await p.waitForTimeout(1500); await annotate(p, [{ sel: '[class*="react-tabs__tab_"]:nth-child(3)', label: 'تاب الأصوات', pad: 4, labelPos: 'right' }, { sel: '[class*="sound-tab"] [class*="action-menu_main-button"], [class*="sprite-selector_add-button"] [class*="action-menu_main-button"]', label: 'صوت جديد', pad: 6, labelPos: 'right' }]); await shoot(p, out, { x: 0, y: 0, w: 900, h: 900 }); });
A('A-UI-09', async ({ sc, out }) => {
  const p = await sc.fresh(); await desktopLook(p); await p.getByText('File', { exact: true }).first().click(); await p.waitForTimeout(400);
  const item = p.locator('[class*="menu_menu-item"]', { hasText: 'Save to your computer' }).first(); const r = await item.boundingBox();
  await annotate(p, [{ rect: { x: r.x, y: r.y, w: r.width, h: r.height }, label: 'احفظ على الجهاز', pad: 4, labelPos: 'right' }]);
  await shoot(p, out, { x: 0, y: 0, w: 820, h: 420 }); await sc.closeMenus();
});
A('A-UI-10', async ({ sc, out }) => { const p = await sc.fresh(); await desktopLook(p); const r = await rectOf(p, '[class*="stage-selector_add-button"]'); await annotate(p, [{ sel: '[class*="stage-selector_add-button"]', label: 'خلفية جديدة', pad: 6, labelPos: 'left' }]); await shoot(p, out, clampClip({ x: r.x - 560, y: r.y - 300, w: 700, h: 400 })); });
A('A-UI-11', async ({ sc, out }) => { // مكتبة الخلفيات
  const p = await sc.fresh(); await desktopLook(p);
  await p.locator('[class*="stage-selector_add-button"] [class*="action-menu_main-button"], [class*="stage-selector_add-button"] button').first().click();
  await p.waitForSelector('[class*="library-item_library-item"]', { timeout: 30000 }); await p.waitForTimeout(2500);
  const tag = p.locator('[class*="tag-button"], [class*="library_filter-bar"] button', { hasText: 'Space' }).first();
  if (await tag.count()) { const b = await tag.boundingBox(); await annotate(p, [{ rect: { x: b.x, y: b.y, w: b.width, h: b.height }, label: 'فضاء', pad: 6 }]); }
  await shoot(p, out); await p.keyboard.press('Escape');
});
A('A-UI-12', async ({ sc, out }) => { // محرر الرسم — كوستيوم nano-b
  const p = await sc.load(path.join(A_CK, 'P1-final.sb3'));
  await p.locator('[class*="sprite-selector-item_sprite-selector-item"]', { hasText: 'Nano' }).first().click(); await p.waitForTimeout(500);
  await p.locator('[class*="react-tabs__tab_"]', { hasText: 'Costumes' }).first().click(); await p.waitForTimeout(1500);
  await p.locator('[class*="sprite-selector-item_sprite-selector-item"]', { hasText: 'nano-b' }).first().click(); await p.waitForTimeout(800);
  const items = [{ sel: '[class*="sprite-selector-item_is-selected"]', label: 'nano-b', pad: 4, labelPos: 'right' }];
  const sel = await rectOf(p, '[class*="paint-editor_mod-tool"], [aria-label="Select"], [class*="tool-select-base_tool-select-base"]'); if (sel) items.push({ rect: sel, label: 'أداة التحديد', pad: 6, labelPos: 'right' });
  await annotate(p, items, { dim: 0.2 }); await shoot(p, out, { x: 0, y: 0, w: 1110, h: 900 });
  await p.locator('[class*="react-tabs__tab_"]', { hasText: 'Code' }).first().click();
});

// --- A-BL: بلوك من الفئة — بقص حوالين البلوك ومشروع الجلسة محمل ---
async function selectSprite(p, name) { await p.locator('[class*="sprite-selector-item_sprite-selector-item"]', { hasText: name }).first().click(); await p.waitForTimeout(500); }
const BL = (id, cat, ops, label, project = null, spriteName = null) => A(id, async ({ sc, out }) => {
  const p = project ? await sc.load(project()) : await sc.fresh(); await desktopLook(p);
  if (spriteName) await selectSprite(p, spriteName);
  await sc.category(cat);
  const items = []; for (const op of ops) { const r = await sc.flyoutRect(op); items.push({ rect: r, pad: 10, op }); }
  for (const it of items) it.rect = await rectOf(p, `.blocklyFlyout g.blocklyDraggable.${it.op}`); // إعادة قياس بعد آخر سحب
  if (label) items[0].label = label; items[0].labelPos = 'right';
  await annotate(p, items);
  const u = union(items.map(i => i.rect)); const fl = await rectOf(p, '.blocklyFlyout');
  await shoot(p, out, clampClip({ x: 0, y: u.y - 150, w: fl.x + fl.w + 380, h: u.h + 320 }));
});
BL('A-BL-01', 'Events', ['event_whenflagclicked'], 'لما العلم يتضغط', P2A, 'Sprite1');
BL('A-BL-02', 'Events', ['event_whenthisspriteclicked'], 'لما السبرايت يتضغط', P1A, 'Pico');
BL('A-BL-03', 'Looks', ['looks_sayforsecs'], 'قول ... لمدة ...', P1A, 'Pico');
BL('A-BL-04', 'Looks', ['looks_thinkforsecs', 'looks_think'], 'فكر', P1A, 'Pico');
BL('A-BL-05', 'Control', ['control_repeat', 'control_forever'], 'كرر · للأبد', P2A, 'Sprite1');
BL('A-BL-06', 'Control', ['control_wait'], 'استنى', P1A, 'Pico');
BL('A-BL-07', 'Motion', ['motion_movesteps'], 'اتحرك خطوات', P2A, 'Sprite1');
BL('A-BL-08', 'Motion', ['motion_glideto', 'motion_glidesecstoxy'], 'انزلق', P2A, 'City Bus');
BL('A-BL-10', 'Looks', ['looks_nextcostume'], 'الكوستيوم التالى', P2A, 'Sprite1');
BL('A-BL-11', 'Looks', ['looks_show', 'looks_hide'], 'اظهر · اختفى', P2A, 'Sprite1');
BL('A-BL-12', 'Looks', ['looks_switchbackdropto', 'looks_nextbackdrop'], 'غير الخلفية', () => path.join(A_CK, 'P3-after-A.sb3'), 'Bug');
BL('A-BL-13', 'Sound', ['sound_play'], 'شغل صوت', P1A, 'Pico');
BL('A-BL-14', 'Events', ['event_whenflagclicked'], 'لما العلم يتضغط — على الأتوبيس', P2A, 'City Bus');
const pointTowards = (id, project, spriteName, menuText) => A(id, async ({ sc, out }) => {
  const p = project ? await sc.load(project()) : await sc.fresh(); await desktopLook(p);
  if (spriteName) await selectSprite(p, spriteName);
  await sc.category('Motion');
  const r = await sc.flyoutRect('motion_pointtowards');
  const t = await p.evaluate(() => { const g = document.querySelector('.blocklyFlyout g.blocklyDraggable.motion_pointtowards'); const tx = [...g.querySelectorAll('text')].find(x => /mouse/.test(x.textContent)); const b = tx.getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
  await p.mouse.click(t.x, t.y); await p.waitForTimeout(700);
  const dd = await rectOf(p, '.blocklyDropDownDiv');
  const items = [{ rect: r, pad: 10, label: 'اتجه ناحية ...', labelPos: 'top' }];
  if (dd && dd.w > 0) items.push({ rect: dd, pad: 6, label: menuText, labelPos: 'right' });
  await annotate(p, items);
  const u = union(items.map(i => i.rect)); const fl = await rectOf(p, '.blocklyFlyout');
  await shoot(p, out, clampClip({ x: 0, y: u.y - 150, w: fl.x + fl.w + 380, h: u.h + 320 })); await p.keyboard.press('Escape');
});
pointTowards('A-BL-09', null, null, 'الماوس');
pointTowards('A-BL-15', () => path.join(A_CK, 'P2-final.sb3'), 'Hippo1', 'اختار الأتوبيس');

// --- A-SC: سكربتات — من ملفات المشروع الحقيقية ---
// project: ملف .sb3 · sprite: السبرايت اللى نختاره · after: تحويط اختيارى · clean: بدون تعتيم
const SCF = (id, project, sprite, after) => A(id, async ({ sc, out }) => {
  const p = await sc.load(project()); await desktopLook(p);
  if (sprite) await selectSprite(p, sprite);
  // زحزح مساحة الكود لليمين شوية عشان السكربت يبعد عن حافة الـ flyout
  await p.mouse.move(1000, 800); await p.mouse.down(); await p.mouse.move(1120, 760, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(600);
  // نظف الشاشة: اضغط "cleanup" عبر كليك يمين؟ نكتفى بالوضع الافتراضى
  const r = await sc.scriptRect(); if (!r) throw new Error('مفيش سكربت ظاهر');
  const fl = await rectOf(p, '.blocklyFlyout'); const ws = await rectOf(p, '[class*="blocks_blocks"]'); const x0 = Math.max(r.x - 60, fl ? fl.x + fl.w + 6 : 0);
  const x2 = Math.min(r.x + r.w + 60 + (after ? 360 : 0), ws ? ws.x + ws.w - 6 : VIEWPORT.width);
  const clip = { x: x0, y: r.y - 60, w: x2 - x0, h: r.h + 120 };
  if (after) await after(p, r, clip);
  await shoot(p, out, clampClip(clip));
});
const gen = (id, scripts) => () => { fs.mkdirSync(TMP, { recursive: true }); return makeScriptSb3(path.join(A_CK, 'P1-final.sb3'), 'Pico', scripts, path.join(TMP, id + '.sb3')); };
SCF('A-SC-01', gen('A-SC-01', [{ x: 80, y: 80, seq: [B.flag(), B.sayFor('Hello!', 2)] }]), null);
SCF('A-SC-02', () => path.join(A_CK, 'debug/DB-A-01.sb3'), 'Pico', null);                       // نضيفة لشريحة التوقع
SCF('A-SC-02b', () => path.join(A_CK, 'debug/DB-A-01.sb3'), 'Pico', async (p, r) => {               // بالتحويط لشريحة الاستقصاء
  const [a, b] = r.each.sort((u, v) => u.y - v.y);
  await annotate(p, [{ rect: { x: a.x, y: a.y + a.h - 4, w: Math.max(a.w, b.w), h: b.y - (a.y + a.h) + 8 }, label: 'فجوة! مش متوصلين', pad: 2, labelPos: 'right' }], { dim: 0 });
});
SCF('A-SC-03', P2A, 'Sprite1', null);                                                              // ناتج بناء S04
SCF('A-SC-04', () => path.join(A_CK, 'debug/DB-A-04.sb3'), 'Sprite1', null);                     // نضيفة لشريحة التوقع
SCF('A-SC-04b', () => path.join(A_CK, 'debug/DB-A-04.sb3'), 'Sprite1', async (p, r) => {
  const mv = await p.evaluate(() => { const g = [...document.querySelectorAll('.blocklyWorkspace > .blocklyBlockCanvas g.blocklyDraggable')].filter(g => !g.closest('.blocklyFlyout') && /move/.test(g.textContent) && /steps/.test(g.textContent)).sort((u, v) => { const a = u.getBoundingClientRect(), b = v.getBoundingClientRect(); return a.width * a.height - b.width * b.height; })[0]; const b = g.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
  await annotate(p, [{ rect: mv, label: 'برة اللوب!', pad: 6, labelPos: 'right' }], { dim: 0 });
});
SCF('A-SC-06', gen('A-SC-06', [{ x: 80, y: 80, seq: [B.flag(), B.hide(), B.wait(3), B.show(), B.say('Boo!')] }]), null);
SCF('A-SC-07', gen('A-SC-07', [{ x: 80, y: 80, seq: [B.clicked(), B.nextBackdrop()] }]), null);
SCF('A-SC-08', P1A, 'Pico', null);                                                                 // ناتج بناء S02: clicked ← sound ← say
SCF('A-SC-09', () => path.join(A_CK, 'P2-final.sb3'), 'City Bus', null);                          // سكربتا الأتوبيس (S05 خطوة 10)

// --- لقطات إضافية للجلسات S07–S09 ---
const P3F = () => path.join(A_CK, 'P3-final.sb3'), P3A = () => path.join(A_CK, 'P3-after-A.sb3'), P4F = () => path.join(A_CK, 'P4-final.sb3');
A('A-UI-13', async ({ sc, out }) => { // مكتبة السبرايتات والببغاء
  const p = await sc.fresh(); await desktopLook(p);
  await p.locator('[class*="sprite-selector_add-button"] [class*="action-menu_main-button"], [class*="sprite-selector_add-button"] button').first().click();
  await p.waitForSelector('[class*="library-item_library-item"]', { timeout: 30000 }); await p.waitForTimeout(1500);
  const item = p.locator('[class*="library-item_library-item"]', { hasText: /^Parrot$/ }).first();
  await item.scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
  const b = await item.boundingBox();
  await annotate(p, [{ rect: { x: b.x, y: b.y, w: b.width, h: b.height }, label: 'Parrot', pad: 8, labelPos: 'right' }], { dim: 0.2 }); await shoot(p, out); await p.keyboard.press('Escape');
});
SCF('A-SC-10', P3F, 'Parrot', null);                                                                // سكربت الببغاء كامل
BL('A-BL-16', 'Sensing', ['sensing_timer', 'sensing_resettimer'], 'التايمر · صفر التايمر', P3F, 'Bug');
A('A-UI-14', async ({ sc, out }) => { // تاب Backdrops وخانة الاسم
  const p = await sc.load(P3A()); await desktopLook(p);
  await p.locator('[class*="stage-selector_stage-selector"]').first().click(); await p.waitForTimeout(500);
  await p.locator('[class*="react-tabs__tab_"]', { hasText: /Backdrops|Costumes/ }).first().click(); await p.waitForTimeout(1500);
  await annotate(p, [{ sel: '[class*="react-tabs__tab_"]:nth-child(2)', label: 'تاب الخلفيات', pad: 4, labelPos: 'right' }, { sel: '[class*="paint-editor_costume-input"], [class*="buffered-input"]', label: 'اسم الخلفية هنا', pad: 6, labelPos: 'right' }], { dim: 0.25 });
  await shoot(p, out, { x: 0, y: 0, w: 1110, h: 700 });
  await p.locator('[class*="react-tabs__tab_"]', { hasText: 'Code' }).first().click();
});
A('A-UI-15', async ({ sc, out }) => { // قائمة زرار السبرايت — الفرشاة (ارسم)
  const p = await sc.fresh(); await desktopLook(p);
  const btn = await rectOf(p, '[class*="sprite-selector_add-button"]');
  await p.mouse.move(btn.x + btn.w / 2, btn.y + btn.h / 2); await p.waitForTimeout(900);
  const paint = p.locator('[class*="sprite-selector_add-button"] [aria-label="Paint"], [class*="sprite-selector_add-button"] button', { hasText: /Paint/ }).first();
  const items = [];
  const menuItems = await p.$('[class*="sprite-selector_add-button"] [class*="action-menu_more-button"]');
  if (menuItems.length) { const b = await menuItems[menuItems.length - 1].boundingBox(); items.push({ rect: { x: b.x, y: b.y, w: b.width, h: b.height }, label: 'ارسم', pad: 6, labelPos: 'left' }); }
  else if (await paint.count()) { const b = await paint.boundingBox(); items.push({ rect: { x: b.x, y: b.y, w: b.width, h: b.height }, label: 'ارسم', pad: 6, labelPos: 'left' }); }
  await annotate(p, items, { dim: 0.2 }); await shoot(p, out, clampClip({ x: btn.x - 560, y: btn.y - 420, w: 700, h: 520 }));
});
A('A-UI-16', async ({ sc, out }) => { // محرر الرسم — أداة الدايرة
  const p = await sc.fresh(); await desktopLook(p);
  await p.locator('[class*="react-tabs__tab_"]', { hasText: 'Costumes' }).first().click(); await p.waitForTimeout(1500);
  await annotate(p, [{ sel: '[aria-label="Circle"], [class*="tool-select-base"]:nth-of-type(6)', label: 'أداة الدايرة', pad: 6, labelPos: 'right' }, { sel: '[class*="paint-editor_canvas-container"], canvas[class*="paper-canvas"]', label: 'ارسم هنا', pad: 4, labelPos: 'inside' }], { dim: 0.2 });
  await shoot(p, out, { x: 0, y: 0, w: 1110, h: 900 });
  await p.locator('[class*="react-tabs__tab_"]', { hasText: 'Code' }).first().click();
});
BL('A-BL-17', 'Looks', ['looks_changeeffectby', 'looks_seteffectto'], 'غير التأثير بـ ... · ثبته على ...', P4F, 'Eyeball');
A('A-UI-17', async ({ sc, out }) => { // سحب السكربت على سبرايت تانى (لحظة السحب)
  const p = await sc.load(P4F()); await desktopLook(p); await selectSprite(p, 'Eyeball');
  const r = await sc.scriptRect(); const hat = r.each.sort((u, v) => u.y - v.y)[0];
  const target = await p.locator('[class*="sprite-selector-item_sprite-selector-item"]', { hasText: 'Eyeball2' }).first().boundingBox();
  await p.mouse.move(hat.x + 30, hat.y + 15); await p.mouse.down();
  await p.mouse.move(target.x + target.width / 2, target.y + target.height / 2, { steps: 20 }); await p.waitForTimeout(500);
  await annotate(p, [{ rect: { x: target.x, y: target.y, w: target.width, h: target.height }, label: 'اسحبه وحطه على السبرايت', pad: 8, labelPos: 'left' }], { dim: 0.15 });
  await shoot(p, out);
  await p.mouse.move(800, 500, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(300);
  sc.loaded = null; // الملف اتغير — أعد التحميل المرة الجاية
});
A('A-UI-18', async ({ sc, out }) => { const p = await sc.fresh(); await desktopLook(p); const r = await rectOf(p, '[aria-label="Enter full screen mode"]'); await annotate(p, [{ rect: r, label: 'ملء الشاشة', pad: 8, labelPos: 'left' }]); await shoot(p, out, clampClip({ x: r.x - 560, y: r.y - 40, w: 620, h: 260 })); });
// A-SC-05 من الملف الحقيقى بالبلوكات الأربعة + تحويط rotation style
SCF('A-SC-05', P4F, 'Eyeball', async (p) => {
  const rs = await p.evaluate(() => { const g = [...document.querySelectorAll('.blocklyWorkspace > .blocklyBlockCanvas g.blocklyDraggable')].filter(g => !g.closest('.blocklyFlyout') && /rotation/.test(g.textContent)).sort((u, v) => { const a = u.getBoundingClientRect(), b = v.getBoundingClientRect(); return a.width * a.height - b.width * b.height; })[0]; const b = g.getBoundingClientRect(); return { x: b.x, y: b.y, w: b.width, h: b.height }; });
  await annotate(p, [{ rect: rs, label: 'قبل اللوب', pad: 6, labelPos: 'right' }], { dim: 0 });
});

SCF('A-SC-11', () => path.join(A_CK, 'debug/DB-A-05.sb3'), 'Eyeball2', null);  // كود العين بلا forever

SCF('A-SC-12', () => path.join(A_CK, 'P5-after-A.sb3'), 'Dinosaur1', null);  // تهيئة + فضول

// --- A-PR: الستيج ---
const PR = (id, file, { wait = 2500, mouse = null } = {}) => A(id, async ({ sc, out }) => {
  const p = await sc.load(path.join(A_CK, file));
  await sc.fullscreen();
  await sc.greenFlag(); await p.waitForTimeout(wait);
  const r = await sc.stageCanvasRect();
  if (mouse) { await p.mouse.move(r.x + r.w * mouse[0], r.y + r.h * mouse[1]); await p.waitForTimeout(600); }
  await shoot(p, out, r);
  await sc.stop(); await sc.exitFullscreen();
});
PR('A-PR-01', 'P1-final.sb3', { wait: 1500 });
PR('A-PR-02', 'P2-final.sb3', { wait: 3500 });
PR('A-PR-03', 'P3-final.sb3', { wait: 3000 });
PR('A-PR-04', 'P4-final.sb3', { wait: 1200, mouse: [0.8, 0.25] });
PR('A-PR-05', 'P5-final.sb3', { wait: 4000 });
PR('A-PR-06', 'P6-example.sb3', { wait: 1500 });

// --- B-PR: معاينات الويب ---
const BPR = (id, dir) => Bs(id, async ({ ctx, out }) => {
  const page = await ctx.newPage();
  await page.goto(pathToFileURL(path.join(B_CK, dir, 'index.html')).href, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await shoot(page, out); await page.close();
});
BPR('B-PR-01', 'P1-final'); BPR('B-PR-02', 'P2-final'); BPR('B-PR-03', 'P3-final');
BPR('B-PR-04', 'P4-examples/beetle'); BPR('B-PR-05', 'P5-examples/mood-lamp'); BPR('B-PR-06', 'P6-examples/egypt');

// --- B-CD: كود + معاينة ---
const P1 = fileUrl(path.join(B_CK, 'P1-final'));
const CD = (id, spec, after) => Bs(id, async ({ ctx, out }) => {
  const page = await openEditor(ctx, spec);
  if (after) await after(page);
  await shoot(page, out); await page.close();
});
const H1 = `<!DOCTYPE html>
<html>
  <head>
    <title>My page</title>
  </head>
  <body>
    <h1>Hello, world!</h1>
    <p>My name is Sara and I love cats.</p>
    <img src="happy.png" alt="a happy face">
  </body>
</html>`;
const body = h => h.replace(/[\s\S]*<body>/, '').replace(/<\/body>[\s\S]*/, '');
CD('B-CD-01', { files: [{ name: 'index.html', code: H1 }], preview: { html: body(H1), css: 'body{font-family:Arial;padding:24px;font-size:22px}img{width:160px}' }, base: P1 });
CD('B-CD-02', { files: [{ name: 'index.html', code: `<p>My name is Sara.</p>` }], zoom: true }, async p => {
  await annotate(p, [{ rect: await textRect(p, '<p>'), n: 1, label: 'تاج فتح', pad: 8 }, { rect: await textRect(p, '</p>'), n: 2, label: 'تاج قفل — بشرطة', pad: 8 }], { theme: 'B', dim: 0.15 });
});
CD('B-CD-03', { files: [{ name: 'index.html', code: `<img src="happy.png" alt="a happy face">` }], zoom: true }, async p => {
  await annotate(p, [{ rect: await textRect(p, 'src="happy.png"'), n: 1, label: 'مصدر الصورة — اسم الملف', pad: 8 }, { rect: await textRect(p, 'alt="a happy face"'), n: 2, label: 'وصف بديل', pad: 8 }], { theme: 'B', dim: 0.15 });
});
const CSS1 = `h1 {
  color: purple;
}

p {
  font-size: 22px;
}`;
CD('B-CD-04', { files: [{ name: 'index.html', code: H1 }, { name: 'style.css', code: CSS1, lang: 'css' }], active: 1, preview: { html: body(H1), css: 'body{font-family:Arial;padding:24px}img{width:160px}' + CSS1 }, base: P1 }, async p => {
  await annotate(p, [{ rect: await textRect(p, 'h1 {\n  color: purple;\n}'), label: 'قاعدة CSS', pad: 10, labelPos: 'right' }, { rect: await iframeElRect(p, 'h1'), pad: 8 }], { theme: 'B', dim: 0.2 });
});
CD('B-CD-05', { files: [{ name: 'style.css', code: `h1 {\n  color: purple;\n}`, lang: 'css' }], zoom: true }, async p => {
  await annotate(p, [{ rect: await textRect(p, 'h1'), n: 1, label: 'سيليكتور — مين؟', pad: 8, labelPos: 'top' }, { rect: await textRect(p, 'color'), n: 2, label: 'خاصية — إيه؟', pad: 8 }, { rect: await textRect(p, 'purple'), n: 3, label: 'قيمة — إزاى؟', pad: 8 }], { theme: 'B', dim: 0.15 });
});
const UL = `<h2>My top 3 games</h2>
<ul>
  <li>Minecraft</li>
  <li>Roblox</li>
  <li>Chess</li>
</ul>`;
CD('B-CD-06', { files: [{ name: 'index.html', code: UL }], preview: { html: UL, css: 'body{font-family:Arial;padding:24px;font-size:24px}' } }, async p => {
  await annotate(p, [{ rect: await textRect(p, '<ul>'), label: 'قائمة', pad: 6, labelPos: 'right' }, { rect: await textRect(p, '<li>Minecraft</li>'), label: 'عنصر', pad: 6, labelPos: 'right' }, { rect: await iframeElRect(p, 'ul'), pad: 8 }], { theme: 'B', dim: 0.15 });
});
const BQ = `<p>My favourite quote:</p>
<blockquote>
  Everybody in this country should learn
  how to program a computer, because it
  teaches you how to think.
</blockquote>
<p>- Steve Jobs</p>`;
CD('B-CD-07', { files: [{ name: 'index.html', code: BQ }], preview: { html: BQ, css: 'body{font-family:Arial;padding:24px;font-size:22px}blockquote{border-left:6px solid #0aa6a6;background:#e0fbf7;padding:12px 18px;font-style:italic}' } }, async p => {
  await annotate(p, [{ rect: await textRect(p, '<blockquote>'), pad: 6 }, { rect: await iframeElRect(p, 'blockquote'), label: 'اقتباس', pad: 6 }], { theme: 'B', dim: 0.15 });
});
const ANIM_CSS = `@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}

img {
  width: 200px;
  animation: spin 3s linear infinite;
}`;
CD('B-CD-08', { files: [{ name: 'index.html', code: `<img src="happy.png" alt="happy">` }, { name: 'animation.css', code: ANIM_CSS, lang: 'css' }], active: 1, preview: { html: `<img src="happy.png" alt="happy">`, css: 'body{padding:60px;display:flex;justify-content:center}' + ANIM_CSS.replace('infinite', 'infinite paused').replace('animation: spin 3s linear infinite paused', 'animation: spin 3s linear infinite; animation-delay:-0.9s; animation-play-state:paused') }, base: P1 }, async p => {
  await annotate(p, [{ rect: await textRect(p, '@keyframes spin'), n: 1, label: 'عرف الحركة', pad: 8, labelPos: 'right' }, { rect: await textRect(p, 'animation: spin 3s linear infinite;'), n: 2, label: 'شغلها على العنصر', pad: 8, labelPos: 'right' }], { theme: 'B', dim: 0.15 });
});
Bs('B-CD-09', async ({ ctx, out }) => {
  const html = `<h1>Welcome</h1>\n<p class="big">This text is big.</p>\n<p>This text is normal.</p>`;
  const css = `.big {\n  font-size: 40px;\n  color: crimson;\n}`;
  const page = await openEditor(ctx, { files: [{ name: 'index.html', code: html }], preview: { html, css: 'body{font-family:Arial;padding:24px;font-size:20px}' + css } });
  // أضف نافذة CSS ثانية بجانب الأولى عبر تعديل الصفحة
  await page.evaluate(([cssHl]) => {
    const w = document.createElement('div'); w.className = 'win editor'; w.style.flex = '46';
    w.innerHTML = `<div class="bar"><span class="dots"><i></i><i></i><i></i></span><div class="tabs"><span class="tab on">style.css</span></div></div><div class="code"><div class="ln">1\n2\n3\n4</div><pre id="code2">${cssHl}</pre></div>`;
    document.querySelector('.browser').before(w);
    document.querySelector('.browser').style.flex = '30';
  }, [hlCSS(css)]);
  await page.waitForTimeout(300);
  await annotate(page, [{ rect: await textRect(page, 'class="big"'), n: 1, label: 'فى HTML: الاسم', pad: 8 }, { rect: await textRect(page, '.big', 0, '#code2'), n: 2, label: 'فى CSS: نقطة + الاسم', pad: 8 }, { rect: await iframeElRect(page, '.big'), pad: 6 }], { theme: 'B', dim: 0.15 });
  await shoot(page, out); await page.close();
});
const HOV = `.card {\n  background: #e0fbf7;\n  padding: 20px;\n  border-radius: 16px;\n}\n\n.card:hover {\n  background: #ff3d8a;\n  color: white;\n  transform: scale(1.1);\n}`;
CD('B-CD-10', { files: [{ name: 'style.css', code: HOV, lang: 'css' }], preview: { html: `<div class="card">Hover me!</div><div class="card">And me!</div>`, css: 'body{font-family:Arial;padding:40px;font-size:26px;display:flex;flex-direction:column;gap:30px;width:260px}' + HOV } }, async p => {
  const r = await iframeElRect(p, '.card', 0);
  await p.mouse.move(r.x + r.w * 0.6, r.y + r.h * 0.6); await p.waitForTimeout(400);
  const r2 = await iframeElRect(p, '.card', 0);
  await annotate(p, [{ rect: await textRect(p, '.card:hover'), label: 'لما الماوس فوقه', pad: 8, labelPos: 'right' }, { rect: r2, pad: 10, cursor: { x: r.x + r.w * 0.6, y: r.y + r.h * 0.6 } }], { theme: 'B', dim: 0.15 });
});
const GRAD = `body {\n  background: linear-gradient(135deg, #ff7a00, #ff3d8a, #7c3aed);\n  color: white;\n  font-family: Arial;\n}`;
CD('B-CD-11', { files: [{ name: 'style.css', code: GRAD, lang: 'css' }], preview: { html: `<h1>Gradient!</h1><p>Three colours, one background.</p>`, css: 'body{padding:40px;font-size:22px;min-height:100vh;margin:0}' + GRAD } }, async p => {
  await annotate(p, [{ rect: await textRect(p, 'linear-gradient(135deg, #ff7a00, #ff3d8a, #7c3aed)'), label: 'تدرج: زاوية + ألوان', pad: 8 }], { theme: 'B', dim: 0.15 });
});
Bs('B-CD-12', async ({ ctx, out }) => {
  const page = await ctx.newPage();
  await page.goto('https://fonts.google.com/specimen/Cairo', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(4000);
  try {
    const get = page.getByRole('button', { name: /get font/i }).first();
    if (await get.count()) {
      const r = await get.boundingBox();
      await annotate(page, [{ rect: { x: r.x, y: r.y, w: r.width, h: r.height }, n: 1, label: 'خد الخط', pad: 6, labelPos: 'left' }], { theme: 'B', dim: 0.2 });
    }
  } catch {}
  await shoot(page, out); await page.close();
});
const BOX = `.a {\n  background: #b5f000;\n  padding: 30px;\n}\n\n.b {\n  background: #b5f000;\n  margin: 30px;\n}`;
CD('B-CD-13', { files: [{ name: 'style.css', code: BOX, lang: 'css' }], preview: { html: `<div class="wrap"><div class="a">padding: 30px</div></div><div class="wrap"><div class="b">margin: 30px</div></div>`, css: 'body{font-family:Arial;padding:30px;font-size:22px;display:flex;gap:30px}.wrap{background:#0aa6a6;color:#0b1d2a;flex:1}.a,.b{border:3px dashed #0b1d2a}' + BOX } }, async p => {
  await annotate(p, [{ rect: await iframeElRect(p, '.a'), n: 1, label: 'padding = مسافة جوه', pad: 4 }, { rect: await iframeElRect(p, '.b'), n: 2, label: 'margin = مسافة برة', pad: 34 }, { rect: await textRect(p, 'padding: 30px;'), n: 1, pad: 6 }, { rect: await textRect(p, 'margin: 30px;'), n: 2, pad: 6 }], { theme: 'B', dim: 0.15 });
});
const LINK = `<p>Learn more on\n  <a href="https://scratch.mit.edu">the Scratch website</a>.\n</p>`;
CD('B-CD-14', { files: [{ name: 'index.html', code: LINK }], preview: { html: LINK, css: 'body{font-family:Arial;padding:24px;font-size:24px}a{color:#0aa6a6}' } }, async p => {
  await annotate(p, [{ rect: await textRect(p, 'href="https://scratch.mit.edu"'), n: 1, label: 'الرابط يودى فين', pad: 8, labelPos: 'right' }, { rect: await textRect(p, 'the Scratch website'), n: 2, label: 'النص اللى بيتضغط', pad: 8 }, { rect: await iframeElRect(p, 'a'), n: 2, pad: 6 }], { theme: 'B', dim: 0.15 });
});

// ---------- تحويط لقطات خام (اللقطات اليدوية) ----------
// يحمل صورة من assets/raw/ فى صفحة بنفس مقاسها، يغطى المناطق الخاصة بلون مأخوذ من الصورة، يحوط، ويحفظ.
const B_RAW = path.join(B_ASSETS, 'raw');
// scale: نسبة تصغير مساحة الـ CSS مقابل بكسلات الصورة. اللقطة المتصورة بـ DPR 1.5
// لازمها scale:1.5 عشان تطلع 1:1 بلا تكبير، والتحويط يبقى بنفس حجم باقى اللقطات.
async function annotateImage(ctx, rawFile, out, items, { theme = 'B', dim = 0.3, covers = [], scale = 1 } = {}) {
  const png = fs.readFileSync(rawFile); const W = png.readUInt32BE(16), H = png.readUInt32BE(20);
  const CW = Math.round(W / scale), CH = Math.round(H / scale);
  const page = await ctx.newPage(); await page.setViewportSize({ width: CW, height: CH });
  fs.mkdirSync(TMP, { recursive: true });
  const hf = path.join(TMP, 'raw.html');
  fs.writeFileSync(hf, '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;width:' + CW + 'px;height:' + CH + 'px;overflow:hidden}canvas{display:block;width:' + CW + 'px;height:' + CH + 'px}</style></head><body><canvas id="c" width="' + W + '" height="' + H + '"></canvas><img id="i" src="data:image/png;base64,' + png.toString('base64') + '" style="display:none"></body></html>');
  await page.goto(pathToFileURL(hf).href, { waitUntil: 'load' });
  await page.evaluate(covers => new Promise(res => {
    const img = document.getElementById('i'), c = document.getElementById('c'), g = c.getContext('2d');
    const draw = () => { g.drawImage(img, 0, 0); for (const cv of covers) { const px = g.getImageData(Math.max(0, cv.x - 3), cv.y + Math.floor(cv.h / 2), 1, 1).data; g.fillStyle = 'rgb(' + px[0] + ',' + px[1] + ',' + px[2] + ')'; g.fillRect(cv.x, cv.y, cv.w, cv.h); } res(); };
    if (img.complete) draw(); else img.onload = draw;
  }), covers);
  await annotate(page, items, { theme, dim });
  await shoot(page, out); await page.close();
}
const RAW = (id, rawName, items, opts) => Bs(id, async ({ ctx, out }) => {
  const raw = path.join(B_RAW, rawName + '.png');
  if (!fs.existsSync(raw)) throw new Error('اللقطة الخام غير موجودة: assets/raw/' + rawName + '.png — راجع capture-manual.md');
  await annotateImage(ctx, raw, out, items, opts);
});
const VSC_COVERS = [{ x: 200, y: 988, w: 260, h: 30 }, { x: 12, y: 880, w: 40, h: 40 }];
const CHROME_COVERS = [{ x: 1612, y: 8, w: 40, h: 40 }];
RAW('B-UI-01', 'B-UI-01', [], { dim: 0, covers: VSC_COVERS });
RAW('B-UI-02', 'B-UI-01', [
  { rect: { x: 62, y: 52, w: 208, h: 925 }, n: 1, label: 'الملفات', pad: 0, labelPos: 'inside' },
  { rect: { x: 282, y: 52, w: 782, h: 930 }, n: 2, label: 'الكود', pad: 0, labelPos: 'inside' },
  { rect: { x: 1078, y: 62, w: 830, h: 950 }, n: 3, label: 'المعاينة فى المتصفح', pad: 0, labelPos: 'inside' },
], { dim: 0.25, covers: VSC_COVERS });
RAW('B-UI-03', 'B-UI-01', [
  { rect: { x: 100, y: 232, w: 165, h: 26 }, n: 1, label: 'الصفحة — index.html', pad: 6, labelPos: 'right' },
  { rect: { x: 100, y: 287, w: 165, h: 26 }, n: 2, label: 'الشكل — style.css', pad: 6, labelPos: 'right' },
], { dim: 0.3, covers: VSC_COVERS });
RAW('B-UI-04', 'B-UI-04', [
  { rect: { x: 258, y: 252, w: 400, h: 30 }, label: 'كليك يمين ← افتح فى المتصفح', pad: 6, labelPos: 'right' },
], { dim: 0.3, covers: VSC_COVERS });
RAW('B-UI-05', 'B-UI-05', [
  { rect: { x: 178, y: 66, w: 90, h: 30 }, n: 1, label: 'تاب العناصر', pad: 6 },
  { rect: { x: 140, y: 268, w: 290, h: 26 }, n: 2, label: 'نفس الكود اللى كتبناه', pad: 6, labelPos: 'right' },
], { dim: 0.3, covers: CHROME_COVERS });
RAW('B-UI-06', 'B-UI-06', [
  { rect: { x: 118, y: 216, w: 880, h: 132 }, label: 'الفقرات جوه h1 — التاج مش مقفول', pad: 6 },
  { rect: { x: 1160, y: 215, w: 680, h: 270 }, label: 'كله كبير وبنفسجى', pad: 6 },
], { dim: 0.3, covers: CHROME_COVERS });

// ---------- لقطات GitHub — الخام اتلقط بـ capture-github.mjs ----------
// اللقطات 2400×1350 (DPR 1.5) فـ scale:1.5 عشان الإحداثيات تبقى فى مساحة 1600×900
const GH = { dim: 0.35, scale: 1.5 };
RAW('B-GH-01', 'B-GH-01', [
  { rect: { x: 249, y: 162, w: 64, h: 25 }, label: 'زرار المشروع الجديد', pad: 6, labelPos: 'right' },
], GH);
RAW('B-GH-02', 'B-GH-02', [
  { rect: { x: 629, y: 245, w: 516, h: 33 }, n: 1, label: 'اسم المشروع', pad: 6, labelPos: 'right' },
  { rect: { x: 1018, y: 511, w: 111, h: 30 }, n: 2, label: 'اختار Public', pad: 6, labelPos: 'left' },
  { rect: { x: 1053, y: 596, w: 77, h: 27 }, n: 3, label: 'شغل Add README', pad: 6, labelPos: 'left' },
  { rect: { x: 1007, y: 800, w: 139, h: 30 }, n: 4, label: 'اعمل الريبو', pad: 6, labelPos: 'right' },
], GH);
RAW('B-GH-03', 'B-GH-03', [
  { rect: { x: 879, y: 195, w: 94, h: 30 }, n: 1, label: 'اضغط Add file', pad: 6, labelPos: 'left' },
  { rect: { x: 888, y: 275, w: 112, h: 23 }, n: 2, label: 'اختار Upload files', pad: 6, labelPos: 'right' },
], GH);
RAW('B-GH-04', 'B-GH-04', [
  { rect: { x: 185, y: 166, w: 1215, h: 274 }, n: 1, label: 'اسحب ملفاتك هنا', pad: 0, labelPos: 'inside' },
  { rect: { x: 264, y: 824, w: 1120, h: 30 }, n: 2, label: 'اكتب إنت عملت إيه', pad: 6, labelPos: 'inside' },
], GH);
RAW('B-GH-05', 'B-GH-05', [
  { rect: { x: 481, y: 410, w: 97, h: 30 }, n: 1, label: 'اختار الفرع main', pad: 6, labelPos: 'left' },
  { rect: { x: 712, y: 410, w: 64, h: 30 }, n: 2, label: 'واضغط Save', pad: 6, labelPos: 'right' },
], GH);
RAW('B-GH-06', 'B-GH-06', [
  { rect: { x: 494, y: 234, w: 410, h: 21 }, label: 'رابط موقعك — افتحه', pad: 8, labelPos: 'right' },
], GH);
RAW('B-GH-07', 'B-GH-07', [
  { rect: { x: 1473, y: 238, w: 23, h: 22 }, label: 'القلم — عدل الملف', pad: 8, labelPos: 'left' },
], GH);
RAW('B-GH-08', 'B-GH-08', [
  { rect: { x: 1425, y: 118, w: 146, h: 30 }, label: 'لما تخلص اضغط هنا', pad: 6, labelPos: 'left' },
], GH);
RAW('B-GH-09', 'B-GH-09', [
  { rect: { x: 575, y: 290, w: 450, h: 33 }, n: 1, label: 'اكتب إنت غيرت إيه', pad: 6, labelPos: 'left' },
  { rect: { x: 894, y: 653, w: 129, h: 30 }, n: 2, label: 'واضغط Commit', pad: 6, labelPos: 'left' },
], GH);

// ---------- التشغيل ----------
async function main() {
  let todo = shots.filter(s => (!trackArg || s.track === trackArg) && (!onlyIds.length || onlyIds.includes(s.id)));
  if (LIST) { for (const s of todo) console.log((fs.existsSync(s.out) ? '✓ ' : '· ') + s.id); return; }
  if (!FORCE) todo = todo.filter(s => !fs.existsSync(s.out));
  if (!todo.length) { console.log('كل اللقطات موجودة.'); return; }
  console.log(`لقطات: ${todo.length} · playwright: ${PW_CORE}`);
  const { chromium } = await import(pathToFileURL(path.join(PW_CORE, 'index.mjs')).href);
  const browser = await chromium.launch({ executablePath: PW_CHROME, headless: !HEADED });
  const ctx = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: DPR, locale: 'en-US' });
  const sc = new Scratch(ctx);
  let ok = 0, fail = [];
  for (const s of todo) {
    const t0 = Date.now();
    try { await s.run({ ctx, sc, out: s.out }); ok++; console.log(`✓ ${s.id} (${((Date.now() - t0) / 1000).toFixed(1)}s)`); }
    catch (e) { fail.push(s.id); console.log(`✗ ${s.id}: ${e.message.split('\n')[0]}`); try { await clearOverlay(sc.page); } catch {} }
  }
  await browser.close();
  console.log(`\nتم: ${ok} · فشل: ${fail.length}${fail.length ? ' → ' + fail.join(' ') : ''}`);
  updateManifest();
}
function updateManifest() {
  const mf = path.join(ROOT, '_shared/media-manifest.md');
  if (!fs.existsSync(mf)) return;
  let s = fs.readFileSync(mf, 'utf8'); let n = 0;
  s = s.replace(/^\| `([AB]-[A-Z]{2}-\d\d[a-z]?)` \| `([^`]+)` \| `(pending|done)` \|/gm, (m, id, file, st) => {
    const dir = id.startsWith('A') ? A_ASSETS : B_ASSETS; const have = fs.existsSync(path.join(dir, file)); const ns = have ? 'done' : 'pending';
    if (ns !== st) n++; return `| \`${id}\` | \`${file}\` | \`${ns}\` |`;
  });
  fs.writeFileSync(mf, s); console.log(`media-manifest.md: ${n} تغيير`);
}
main().catch(e => { console.error(e); process.exit(1); });
