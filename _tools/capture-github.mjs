#!/usr/bin/env node
// ---------------------------------------------------------------------------
// capture-github.mjs — التقاط لقطات GitHub التسعة (B-GH-01..09) آليا.
//
// كل حاجة محلية. المتصفح بروفايل منفصل تماما فى _tools/.gh-profile/
// ولا علاقة له بـ Chrome بتاع المستخدم ولا أى بروفايل تانى على الجهاز.
//
// الاستخدام:
//   node _tools/capture-github.mjs --login     # يفتح المتصفح عشان تسجل دخولك بنفسك
//   node _tools/capture-github.mjs             # يلتقط التسعة
//   node _tools/capture-github.mjs --step 5    # يعيد خطوة واحدة
//   node _tools/capture-github.mjs --keep      # يسيب المتصفح مفتوح فى الآخر
//
// أثناء --login السكربت لا يأخذ أى لقطة ولا يقرأ محتوى الصفحة —
// بيستنى بس لحد ما يتأكد إن فيه جلسة مسجلة، وبيدور على وجود زرار الحساب.
//
// اللقطات الخام بتتحفظ فى B-web/B1/assets/raw/ ثم تتحوط لاحقا عبر RAW() فى capture.mjs
// ---------------------------------------------------------------------------

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const RAW = path.join(ROOT, 'B-web/B1/assets/raw');
const SRC = path.join(ROOT, 'B-web/B1/checkpoints/P1-final');
const PROFILE = path.join(HERE, '.gh-profile');

const ORG = process.env.GH_ORG || 'El-Madina-4U';
const REPO = process.env.GH_REPO || 'my-first-page';

const argv = process.argv.slice(2);
const LOGIN = argv.includes('--login');
const KEEP = argv.includes('--keep');
const STEP = argv.includes('--step') ? Number(argv[argv.indexOf('--step') + 1]) : null;

// ---------- إيجاد playwright و Chromium من كاش الجهاز ----------
function findPlaywrightCore() {
  if (process.env.PW_CORE) return process.env.PW_CORE;
  const roots = [path.join(ROOT, 'node_modules/playwright-core'), path.join(ROOT, 'node_modules/playwright')];
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
  if (process.env.PW_CHROME) return process.env.PW_CHROME;
  const base = path.join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (!fs.existsSync(base)) throw new Error('ms-playwright غير موجود — اضبط PW_CHROME');
  const dirs = fs.readdirSync(base).filter(d => /^chromium-\d+$/.test(d)).sort().reverse();
  for (const d of dirs) {
    const exe = path.join(base, d, 'chrome-win64/chrome.exe');
    if (fs.existsSync(exe)) return exe;
  }
  throw new Error('Chromium غير موجود — اضبط PW_CHROME');
}

const log = (...a) => console.log(...a);
const sleep = ms => new Promise(r => setTimeout(r, ms));

async function open() {
  const { chromium } = await import(pathToFileURL(path.join(findPlaywrightCore(), 'index.mjs')).href);
  fs.mkdirSync(PROFILE, { recursive: true });
  const ctx = await chromium.launchPersistentContext(PROFILE, {
    executablePath: findChromium(),
    headless: false,
    viewport: { width: 1600, height: 900 },
    deviceScaleFactor: 1.5,
    args: ['--disable-blink-features=AutomationControlled'],
  });
  const page = ctx.pages()[0] || await ctx.newPage();
  return { ctx, page };
}

// هل فيه جلسة مسجلة؟ فحص واحد بسيط بلا قراءة محتوى
async function isLoggedIn(page) {
  try {
    await page.goto('https://github.com/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    return await page.locator('[data-login], button[aria-label*="user account menu" i], img.avatar-user').first()
      .isVisible({ timeout: 5000 }).catch(() => false);
  } catch { return false; }
}

// ---------- وضع تسجيل الدخول ----------
async function doLogin() {
  const { ctx, page } = await open();
  await page.goto('https://github.com/login', { waitUntil: 'domcontentloaded' });
  log('\n  المتصفح اتفتح. سجل دخولك بنفسك دلوقتى (والـ 2FA لو مطلوب).');
  log('  السكربت مش بياخد أى لقطة ولا بيقرا الصفحة دلوقتى — بيستنى بس.\n');

  for (let i = 0; i < 200; i++) {          // ~10 دقائق
    await sleep(3000);
    const u = page.url();
    if (/github\.com\/(login|sessions|session)/.test(u)) continue;
    const ok = await page.locator('[data-login], img.avatar-user').first()
      .isVisible({ timeout: 2000 }).catch(() => false);
    if (ok) {
      log('  ✓ الدخول تم والجلسة اتحفظت فى _tools/.gh-profile/');
      log('  شغل دلوقتى:  node _tools/capture-github.mjs\n');
      await ctx.close();
      return;
    }
  }
  log('  ✗ خلص الوقت من غير ما أتأكد من الدخول. شغل --login تانى.');
  await ctx.close();
}

// ---------- اللقطات ----------
const shot = (page, name, clip) =>
  page.screenshot({ path: path.join(RAW, name + '.png'), ...(clip ? { clip } : {}) })
    .then(() => log('  ✓ ' + name));

const STEPS = {
  1: async page => {                                   // الصفحة الرئيسية وزرار New
    await page.goto('https://github.com/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    await shot(page, 'B-GH-01');
  },

  2: async page => {                                   // نموذج إنشاء الريبو (بلا إرسال)
    await page.goto(`https://github.com/new?owner=${ORG}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const name = page.locator('#repository-name-input, input[name="Repository[name]"], #repository_name').first();
    await name.click({ timeout: 15000 });
    await name.fill(REPO);
    await page.waitForTimeout(1500);
    // خلى الرؤية Public — الدرس بيقول للطفل يختارها، والـ Pages مابتشتغلش من غيرها
    const vis = page.locator('#visibility-anchor-button').first();
    if (await vis.isVisible().catch(() => false)) {
      await vis.click(); await page.waitForTimeout(1200);
      await page.getByRole('menuitemradio', { name: /public/i })
        .or(page.getByRole('option', { name: /public/i })).first()
        .click({ timeout: 8000 }).catch(() => log('    (ما لقيتش Public)'));
      await page.waitForTimeout(1200);
    }
    // شغّل Add README — من غيره الريبو بيبقى فاضى وصفحة الرفع مابتشتغلش
    // المفتاح مالوش اسم متاح — بندور على صف «Add README» وناخد الزرار اللى جواه
    await page.evaluate(() => {
      const h = [...document.querySelectorAll('*')].find(
        e => e.children.length === 0 && /^Add README$/i.test((e.textContent || '').trim()));
      if (!h) return;
      let row = h;
      for (let i = 0; i < 6 && row; i++, row = row.parentElement) {
        const b = row.querySelector('button');
        if (b) { b.click(); return; }
      }
    });
    await page.waitForTimeout(1500);
    await shot(page, 'B-GH-02');
    if (process.env.GH_NO_CREATE) return log('    (ما أنشأتش — GH_NO_CREATE)');
    // وبعد اللقطة: أنشئ الريبو فعلا عشان الخطوات اللى بعديها
    const create = page.getByRole('button', { name: /^create repository$/i }).first();
    if (await create.isEnabled().catch(() => false)) {
      await create.click();
      await page.waitForURL(/\/my-first-page/, { timeout: 30000 }).catch(() => {});
      log('    (الريبو اتعمل)');
    }
  },

  3: async page => {                                   // صفحة الريبو + قائمة Add file
    await page.goto(`https://github.com/${ORG}/${REPO}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const btn = page.getByRole('button', { name: /add file/i }).first();
    if (await btn.isVisible().catch(() => false)) { await btn.click(); await page.waitForTimeout(1200); }
    await shot(page, 'B-GH-03');
  },

  4: async page => {                                   // صفحة الرفع بالملفات مرفوعة
    await page.goto(`https://github.com/${ORG}/${REPO}/upload/main`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const files = fs.readdirSync(SRC).map(f => path.join(SRC, f));
    const input = page.locator('input[type="file"]').first();
    await input.setInputFiles(files).catch(e => log('    (رفع الملفات فشل: ' + e.message + ')'));
    await page.waitForTimeout(12000);                 // استنى الرفع يخلص عشان اللقطة تبقى نضيفة
    await shot(page, 'B-GH-04');
    // وبعد اللقطة: اعمل commit للرفع
    const commit = page.getByRole('button', { name: /commit changes/i }).first();
    if (await commit.isVisible().catch(() => false)) {
      await commit.click();
      await page.waitForTimeout(6000);
      log('    (الملفات اترفعت)');
    }
  },

  5: async page => {                                   // Settings ← Pages
    await page.goto(`https://github.com/${ORG}/${REPO}/settings/pages`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    // اختار الفرع main لو لسه ما اتفعلش
    const branch = page.getByRole('button', { name: /^(None|main)$/ }).first();
    if (await branch.isVisible().catch(() => false)) {
      await branch.click(); await page.waitForTimeout(1500);
      const opt = page.getByRole('menuitemradio', { name: /^main$/ }).or(page.getByRole('option', { name: /^main$/ })).first();
      await opt.click({ timeout: 8000 }).catch(() => log('    (ما لقيتش main فى القائمة)'));
      await page.waitForTimeout(1800);
    }
    await shot(page, 'B-GH-05');
    const save = page.getByRole('button', { name: /^save$/i }).first();
    if (await save.isEnabled().catch(() => false)) { await save.click(); await page.waitForTimeout(4000); log('    (Pages اتفعلت)'); }
  },

  6: async page => {                                   // Your site is live at
    log('    (استنى الموقع ينشر — حوالى دقيقة ونص)');
    await sleep(90000);
    await page.goto(`https://github.com/${ORG}/${REPO}/settings/pages`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await shot(page, 'B-GH-06');
  },

  7: async page => {                                   // index.html وأيقونة القلم
    await page.goto(`https://github.com/${ORG}/${REPO}/blob/main/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await shot(page, 'B-GH-07');
  },

  8: async page => {                                   // المحرر مفتوح
    await page.goto(`https://github.com/${ORG}/${REPO}/edit/main/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    await shot(page, 'B-GH-08');
  },

  9: async page => {                                   // نافذة Commit changes
    await page.goto(`https://github.com/${ORG}/${REPO}/edit/main/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(5000);
    // لازم يحصل تعديل فعلى الأول عشان زرار Commit changes يشتغل
    const editor = page.locator('.cm-content, [role="textbox"]').first();
    await editor.click({ timeout: 15000 }).catch(() => {});
    await page.keyboard.press('Control+End');
    await page.keyboard.type('\n<!-- غيرت حاجة -->');
    await page.waitForTimeout(2000);
    const btn = page.getByRole('button', { name: /commit changes/i }).first();
    await btn.click({ timeout: 20000 }).catch(e => log('    (' + e.message.split('\n')[0] + ')'));
    await page.waitForTimeout(2500);
    await shot(page, 'B-GH-09');
  },
};

async function main() {
  if (LOGIN) return doLogin();

  fs.mkdirSync(RAW, { recursive: true });
  const { ctx, page } = await open();

  if (!await isLoggedIn(page)) {
    log('\n  ✗ مفيش جلسة مسجلة. شغل الأول:');
    log('      node _tools/capture-github.mjs --login\n');
    await ctx.close();
    process.exit(1);
  }
  log('  ✓ الجلسة شغالة.\n');

  const list = STEP ? [STEP] : Object.keys(STEPS).map(Number);
  for (const n of list) {
    log(`  [${n}/9] ...`);
    try { await STEPS[n](page); }
    catch (e) { log(`  ✗ الخطوة ${n} فشلت: ${e.message}`); }
  }

  log('\n  اللقطات الخام فى: B-web/B1/assets/raw/');
  if (KEEP) { log('  المتصفح سايبه مفتوح (--keep).'); return; }
  await ctx.close();
}

main().catch(e => { console.error(e); process.exit(1); });
