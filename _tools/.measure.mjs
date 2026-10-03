// أداة قياس مؤقتة: بتفتح ديك فى متصفح محلى وتنفذ تعبير قياس عليه.
// node _tools/.measure.mjs <deck.html> "<js expression returning JSON-able>"
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

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

const { chromium } = await import(pathToFileURL(path.join(findCore(), 'index.mjs')).href);
const deck = path.resolve(process.argv[2]);
const expr = process.argv[3];
const W = +(process.argv[4] || 1600), H = +(process.argv[5] || 900);

const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.goto(pathToFileURL(deck).href);
await page.waitForTimeout(400);
const out = await page.evaluate(expr);
console.log(JSON.stringify(out, null, 1));
await browser.close();
