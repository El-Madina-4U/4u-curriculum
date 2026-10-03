// render-deck.mjs — يصور كل شرائح عرض HTML كصور PNG للمراجعة البصرية (محلى بالكامل)
// الاستخدام: node _tools/render-deck.mjs <deck.slides.html> <outDir> [--width 1600] [--height 900]
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const args = process.argv.slice(2);
const deck = path.resolve(args[0]); const outDir = path.resolve(args[1] || '_review/.render');
const W = +(args.includes('--width') ? args[args.indexOf('--width') + 1] : 1600);
const H = +(args.includes('--height') ? args[args.indexOf('--height') + 1] : 900);
if (!fs.existsSync(deck)) { console.error('الملف غير موجود: ' + deck); process.exit(1); }
fs.mkdirSync(outDir, { recursive: true });

function findCore() {
  const npx = path.join(process.env.LOCALAPPDATA || '', 'npm-cache/_npx');
  for (const d of fs.existsSync(npx) ? fs.readdirSync(npx) : []) { const c = path.join(npx, d, 'node_modules/playwright-core'); if (fs.existsSync(path.join(c, 'index.mjs'))) return c; }
  throw new Error('playwright-core غير موجود');
}
function findChrome() {
  const base = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  for (const d of fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().reverse()) { const e = path.join(base, d, 'chrome-win64/chrome.exe'); if (fs.existsSync(e)) return e; }
  throw new Error('Chromium غير موجود');
}
const { chromium } = await import(pathToFileURL(path.join(findCore(), 'index.mjs')).href);
const browser = await chromium.launch({ executablePath: findChrome() });
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(deck).href + '#1', { waitUntil: 'load' });
await page.waitForTimeout(600);
// الشرائح المخفية بالمسار (only-a / only-b) مابتتصورش — كانت بتطلع صور فاضية
const n = await page.evaluate(() => {
  const t = document.body.dataset.track;
  return [...document.querySelectorAll('.slide')].filter(s =>
    !(t === 'A' && s.classList.contains('only-b')) &&
    !(t === 'B' && s.classList.contains('only-a'))).length;
});
const base = path.basename(deck).replace('.slides.html', '');
for (let i = 1; i <= n; i++) {
  await page.evaluate(k => { location.hash = String(k); }, i);
  await page.waitForTimeout(450);
  await page.screenshot({ path: path.join(outDir, `${base}-${String(i).padStart(2, '0')}.png`), type: 'png' });
}
await browser.close();
console.log(`${base}: ${n} شريحة → ${outDir}`);
