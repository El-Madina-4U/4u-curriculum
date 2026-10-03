#!/usr/bin/env node
// يفحص كل مشاريع مسار B فى متصفح حقيقى محلى:
//   1. سكرول أفقى على شاشة معمل (1366) وعلى موبايل (360)
//   2. أى ملف مشار له فى الصفحة (صورة · CSS) مش موجود على القرص بنفس الحروف
// node _tools/check-pages.mjs

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const CK = path.resolve('B-web/B1/checkpoints');

function findCore() {
  const npx = path.join(process.env.LOCALAPPDATA || '', 'npm-cache/_npx');
  for (const d of fs.existsSync(npx) ? fs.readdirSync(npx) : []) {
    const c = path.join(npx, d, 'node_modules/playwright-core');
    if (fs.existsSync(path.join(c, 'index.mjs'))) return c;
  }
  throw new Error('playwright-core غير موجود');
}
function findChrome() {
  const base = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  for (const d of fs.readdirSync(base)) {
    if (!d.startsWith('chromium')) continue;
    for (const p of ['chrome-win/chrome.exe', 'chrome-win64/chrome.exe']) {
      const f = path.join(base, d, p);
      if (fs.existsSync(f)) return f;
    }
  }
  throw new Error('chromium غير موجود');
}

// كل index.html جوه checkpoints
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name === 'index.html') pages.push(p);
  }
})(CK);

const { chromium } = await import(pathToFileURL(path.join(findCore(), 'index.mjs')).href);
const browser = await chromium.launch({ executablePath: findChrome() });
let bad = 0;

for (const file of pages.sort()) {
  const rel = path.relative(CK, file).replace(/\\/g, '/');
  const problems = [];

  for (const [label, W, H] of [['معمل', 1366, 768], ['موبايل', 360, 720]]) {
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    const failed = [];
    page.on('requestfailed', r => failed.push(r.url()));
    page.on('response', r => { if (r.status() >= 400) failed.push(r.url()); });
    // domcontentloaded مش load: صفحة بتحمل من CDN خارجى بتعلق 30 ثانية
    try { await page.goto(pathToFileURL(file).href, { waitUntil: 'domcontentloaded', timeout: 8000 }); }
    catch { problems.push('الصفحة مابتحملش فى 8 ثوانى — غالبا مرجع خارجى'); await page.close(); continue; }
    await page.waitForTimeout(250);

    // الحكم على السكرول الحقيقى مش على scrollWidth: عنصر أنيميشن بيتحرك بره
    // الشاشة بيزوّد scrollWidth حتى لو overflow-x: clip منع السكرول فعلا.
    const scroll = await page.evaluate(() => {
      const el = document.scrollingElement || document.documentElement;
      el.scrollLeft = 9999;
      const moved = el.scrollLeft;
      el.scrollLeft = 0;
      return { moved, w: Math.max(el.scrollWidth, document.body.scrollWidth) };
    });
    if (scroll.moved > 1)
      problems.push(`${label} ${W}px → سكرول أفقى حقيقى ${scroll.moved}px (المستند ${scroll.w}px)`);

    // صورة اتحملت بحجم صفر = الملف مش موجود
    const broken = await page.evaluate(() => [...document.images]
      .filter(i => !i.complete || i.naturalWidth === 0)
      .map(i => i.getAttribute('src')));
    for (const b of broken) problems.push(`صورة مكسورة: ${b}`);
    for (const f of [...new Set(failed)].filter(u => u.startsWith('file:')))
      problems.push(`ملف مش موجود: ${decodeURIComponent(f.split('/').pop())}`);

    await page.close();
  }

  // مراجع الملفات المحلية — الحروف زى ما هى على القرص؟
  const src = fs.readFileSync(file, 'utf8');
  const dir = path.dirname(file);
  for (const m of src.matchAll(/(?:src|href)="(?!https?:|#|mailto:)([^"]+)"/g)) {
    const target = path.join(dir, decodeURIComponent(m[1]));
    if (fs.existsSync(target)) {
      const real = fs.readdirSync(path.dirname(target)).find(x => x.toLowerCase() === path.basename(target).toLowerCase());
      if (real && real !== path.basename(target))
        problems.push(`الحروف مختلفة: المكتوب "${path.basename(target)}" والملف "${real}" — يشتغل على Windows ويتكسر على GitHub Pages`);
    }
  }

  // أخطاء مقصودة: تحديات Debug It فيها عطل واحد بالتصميم
  const EXPECTED = { 'debug/DB-B-02/index.html': /happy-face\.png/ };
  const uniq = [...new Set(problems)].filter(p => !(EXPECTED[rel] && EXPECTED[rel].test(p)));
  if (uniq.length) { bad++; console.log(`✗ ${rel}`); uniq.forEach(p => console.log('   · ' + p)); }
  else console.log(`✓ ${rel}`);
}

await browser.close();
console.log(`\n${pages.length} صفحة · ${bad} فيها مشاكل`);
process.exit(bad ? 1 : 0);
