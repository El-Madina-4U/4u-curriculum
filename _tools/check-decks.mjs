#!/usr/bin/env node
// يفحص كل عروض الشرائح فى متصفح حقيقى، شريحة شريحة:
//   1. أى نص أصغر من الأرضية (slide-system.md) — آخر ترابيزة لازم تقرا
//   2. أى عنصر خارج إطار الشريحة (تراكب أو قطع)
// node _tools/check-decks.mjs [--min 24] [--w 1600] [--h 900]

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = (k, d) => process.argv.includes(k) ? +process.argv[process.argv.indexOf(k) + 1] : d;
const MIN = arg('--min', 24), W = arg('--w', 1600), H = arg('--h', 900);
// حجم الخط بقى نسبى للشاشة (min(3.11vh,1.75vw)) عشان العرض يبقى مطابق على
// أى بروجيكتور. يعنى الأرضية بالبكسل مالهاش معنى غير على الدقة المرجعية
// 1600×900 — على 1280×720 كل حاجة بتصغر بنفس النسبة والبروجيكتور بيكبرها.
// فحص التجاوز بيتعمل على كل الدقات، وفحص الخط على المرجعية بس.
const CHECK_FONT = (W === 1600 && H === 900);

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

const decks = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    if (e.name.startsWith('_') || e.name.startsWith('.')) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.slides.html')) decks.push(p);
  }
})(process.cwd());

const { chromium } = await import(pathToFileURL(path.join(findCore(), 'index.mjs')).href);
const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: W, height: H } });

let bad = 0;
for (const deck of decks.sort()) {
  const rel = path.relative(process.cwd(), deck).replace(/\\/g, '/');
  await page.goto(pathToFileURL(deck).href);
  await page.waitForTimeout(250);

  const found = await page.evaluate(min => {
    const small = {}, over = [], blank = [];
    // الشرائح المخفية بالمسار متشالة من العد — بس أى شريحة **ظاهرة** وفاضية
    // بتبقى عطل: المدرس بيدوس «التالى» فيلاقى شاشة بيضا قدام الأطفال.
    const t = document.body.dataset.track;
    const secs = [...document.querySelectorAll('section.slide')].filter(s =>
      !(t === 'A' && s.classList.contains('only-b')) &&
      !(t === 'B' && s.classList.contains('only-a')));
    secs.forEach((sec, i) => {
      const prev = sec.style.display;
      sec.style.display = 'flex';
      const r = sec.getBoundingClientRect();
      // نص ظاهر فعلا: بنستثنى اللى display:none عليه من مسار تانى
      const seen = [...sec.querySelectorAll('*')]
        .filter(e => !e.children.length && getComputedStyle(e).display !== 'none')
        .map(e => e.textContent.trim()).join('');
      if (!seen && !sec.querySelector('img,svg')) blank.push(i + 1);
      for (const e of sec.querySelectorAll('*')) {
        const txt = e.textContent.trim();
        if (txt && !e.children.length) {
          const fs = parseFloat(getComputedStyle(e).fontSize);
          if (fs < min) {
            const k = `${e.tagName}.${(typeof e.className === 'string' ? e.className.trim().split(/\s+/)[0] : '')} @${fs.toFixed(1)}px`;
            small[k] = (small[k] || 0) + 1;
          }
        }
        const b = e.getBoundingClientRect();
        if (b.width && (b.right > r.right + 2 || b.left < r.left - 2 || b.bottom > r.bottom + 2))
          over.push(`شريحة ${i + 1}: ${e.tagName}.${(typeof e.className === 'string' ? e.className.trim().split(/\s+/)[0] : '')}`);
      }
      sec.style.display = prev;
    });
    return { small, over: [...new Set(over)], blank, n: secs.length };
  }, CHECK_FONT ? MIN : 0);

  const issues = [
    ...(found.blank.length ? [`شرائح فاضية: ${found.blank.join(' · ')}`] : []),
    ...Object.entries(found.small).map(([k, v]) => `${v}× ${k}`),
    ...found.over.slice(0, 4),
  ];
  if (issues.length) { bad++; console.log(`✗ ${rel}  (${found.n} شريحة)`); issues.forEach(x => console.log('   · ' + x)); }
  else console.log(`✓ ${rel}  (${found.n} شريحة)`);
}

await browser.close();
console.log(`\n${decks.length} عرض · ${bad} فيه مشاكل · ${W}×${H}`
  + (CHECK_FONT ? ` · الأرضية ${MIN}px` : ` · تجاوز الإطار فقط`));
process.exit(bad ? 1 : 0);
