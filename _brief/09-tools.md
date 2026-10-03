دليل الأدوات

> كل الأدوات `Node.js` بلا أى تبعيات مثبتة. تتشغل **من داخل `docs/curriculum/`**.
> المتطلب الوحيد: `Node 18+`. أدوات المتصفح بتلاقى `playwright-core` و`Chromium` من الكاش الموجود على الجهاز.

---

## `validate.mjs` — الفحص الآلى

```
node _tools/validate.mjs
```

بيفحص `8` محاور:
1. المعرف والمستوى مطابقين للمسار.
2. مجموع `blocks` = `duration_min` ولا بلوك `> 30`.
3. الملفات التلاتة موجودة.
4. الشرائح: صفر مراجع خارجية (`http`/`cdn`) + كل صورة موجودة.
5. `prereq` موجودة.
6. كل معرف بنك موجود فى بنكه.
7. كل قسم `### جزئية` فيه مثالان على الأقل.
8. كل جلسة فى `manifest.yml` ليها ملفات.

الخرج: أخطاء (بتفشل) وتحذيرات (صور ناقصة — مقبولة مؤقتا).

**لازم يعدى قبل أى تسليم.**

---

## `sync-slides.mjs` — نشر القالب

```
node _tools/sync-slides.mjs
```

بياخد `CSS` و`JS` من `_templates/session.slides.html` وينسخهم فى كل ملفات العروض بين علامتى `4U:STYLE` و`4U:SCRIPT`. الرمز `__FONTS__` بيتحول للمسار النسبى للخطوط.

**شغله بعد أى تعديل فى القالب.**

---

## `render-deck.mjs` — تصوير عرض للفحص البصرى

```
node _tools/render-deck.mjs <deck.slides.html> <outDir> [--width 1600] [--height 900]
```

بيفتح العرض فى `Chromium` محلى ويصور كل شريحة `PNG` باسم `<اسم>-NN.png`.

---

## `dump-sb3.mjs` — قراءة مشروع `Scratch` كنص

```
node _tools/dump-sb3.mjs <ملف.sb3> [ملفات أخرى]
```

بيطبع كل سبرايت وسكربتاته بالبلوكات والمدخلات والحقول. **الأداة اللى بتمنع النمط `1` من كتالوج الأخطاء.**

---

## `sb3.mjs` — مكتبة قراءة وكتابة `.sb3`

مش أداة سطر أوامر — مكتبة بتستوردها السكربتات التانية. الدوال فى `08-projects-and-assets.md` §4.

---

## `make-checkpoints.mjs` — توليد الملفات المشتقة

```
node _tools/make-checkpoints.mjs
node _tools/make-checkpoints.mjs --only DB-A-03,P2-after-A
```

بيولد من الملفات النهائية: التطبيع · ملفات `after-A` · ملفات `debug` · الهياكل.
كل ملف قاعدة `job(name, base, fn)` — الاسم، الملف الأساس، ودالة التعديل.

---

## `capture.mjs` — التقاط الصور

```
node _tools/capture.mjs                    # الناقص بس
node _tools/capture.mjs A-BL-05 B-CD-01    # محددة
node _tools/capture.mjs --force --track A  # إعادة مسار كامل
node _tools/capture.mjs --list             # الحالة
node _tools/capture.mjs --headed           # متصفح ظاهر للتشخيص
```

بيفتح `scratch.mit.edu/projects/editor` محليا، بيحمل ملفات `.sb3`، بيحوط، وبيصور. لمسار `B` بيبنى صفحات محرر وهمية ومعاينات من ملفات المشروع.

**ملحوظة:** بيفتح `scratch.mit.edu` للعرض فقط بدون حساب ومن غير رفع أى حاجة.

---

## `sync-manifest.mjs` — تحديث سجل الصور

```
node _tools/sync-manifest.mjs
```

بيقرا الشرائح، ويحدد كل صورة بتستخدم فى أنهى جلسات فعلا، ويحدث عمود الجلسات والحالة، ويضيف صفوف للصور الجديدة.

---

## `fetch-scratch.mjs` — تحميل مشروع من `Scratch`

```
node _tools/fetch-scratch.mjs <projectId> <out.sb3>
node _tools/fetch-scratch.mjs --a1
```

**قيد:** المشروع لازم يكون `shared` — المشروع غير المشارك محتاج توكن.

---

## `fetch-rpi-web.mjs` — تحميل مشروع ويب من `Raspberry Pi`

```
node _tools/fetch-rpi-web.mjs <identifier> <outDir>
node _tools/fetch-rpi-web.mjs --b1
```

---

## أوامر مساعدة مفيدة

**مسح التشكيل من ملف:**
```
LC_ALL=C.UTF-8 perl -CSD -i -pe 's/[\x{064B}-\x{0652}\x{0670}]//g' <ملفات>
```

**البحث عن تشكيل:**
```
LC_ALL=C.UTF-8 perl -CSD -ne 'print "$.: $_" if /[\x{064B}-\x{0652}\x{0670}]/' <ملف>
```

**استخراج شرائح عرض للقراءة:**
```
awk '/<div class="deck">/,/<div class="nav prev"/' <deck.slides.html>
```

---

## نمط سكربتات الإصلاح

الإصلاحات بتتعمل بسكربت `.cjs` مؤقت فى `_review/.fix/`، مش بتعديل يدوى — عشان تتراجع وتتعاد:

```js
const fs = require('fs');
const edit = (f, pairs) => {
  let s = fs.readFileSync(f, 'utf8');
  for (const [a, b] of pairs) {
    if (!s.includes(a)) { if (s.includes(b)) continue; throw new Error(f + ' missing: ' + a.slice(0, 60)); }
    s = s.split(a).join(b);
  }
  fs.writeFileSync(f, s);
};
edit('A-scratch/A1/sessions/S04.md', [ ['النص القديم', 'النص الجديد'], ... ]);
```

**السطر `if (s.includes(b)) continue;` بيخلى السكربت `idempotent`** — تقدر تشغله مرتين بأمان.

**تحذير:** النصوص العربية الطويلة اللى فيها backticks بتكسر الـ `template literals` فى `JavaScript`. الحل: حط النص فى ملف `.md` منفصل والسكربت يقراه بـ `fs.readFileSync`.
