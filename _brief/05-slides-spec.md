مواصفة الشرائح

> المرجع الأصلى `_shared/slide-system.md`. الملف ده بيضيف التفاصيل العملية اللى اتعلمناها بالتجربة.

---

## 1. القاعدة الحاكمة: القالب مصدر واحد

الـ `CSS` والـ `JS` بيعيشوا فى `_templates/session.slides.html` بين علامتين:

```html
<!-- 4U:STYLE --> ... <!-- /4U:STYLE -->
<!-- 4U:SCRIPT --> ... <!-- /4U:SCRIPT -->
```

عايز تغير حاجة فى الشكل أو السلوك؟ **عدل القالب** وبعدين:

```
node _tools/sync-slides.mjs
```

بيحدث `33` ملف عرض دفعة واحدة. **ممنوع تعديل `style` أو `script` جوه ملف جلسة** — هيتمسح أول `sync`.

الرمز `__FONTS__` فى القالب بيتحول للمسار النسبى لفولدر الخطوط أثناء المزامنة.

---

## 2. هيكل ملف العرض

```html
<body data-track="A" data-session="A1-S04">
<div class="deck">
  <section class="slide title"> ... </section>
  <section class="slide block" data-min="10"> ... </section>
  ...
  <section class="slide sources"> ... </section>
</div>
<div class="nav prev"></div><div class="nav next"></div>
<div class="hud"><div class="bar"></div></div>
<div class="counter"></div><div class="timer"></div>
<!-- 4U:SCRIPT --> ... <!-- /4U:SCRIPT -->
</body>
```

`data-track` بيحدد لوحة الألوان. `data-min` على شريحة البلوك بيشغل مؤقت المدرس.

---

## 3. أنواع الشرائح — القوالب الجاهزة

### `title` — أول شريحة
```html
<section class="slide title">
  <div class="kicker">أكاديمية 4U · المستوى A1 · الجلسة 4 من 16</div>
  <h1>القطة بتجرى على الأتوبيس 🚌</h1>
  <p class="sub">المشروع: <code>Catch the bus</code> · الجلسة A من 2</p>
</section>
```

### `block` — بداية كل بلوك (شامل الفواصل)
```html
<section class="slide block" data-min="30">
  <div class="num">البلوك 4 من 7</div>
  <h1>نبنى</h1>
  <div class="min">30 دقيقة</div>
  <p class="muted">🚗 سائق · 🧭 ملاح · بدلوا عند 15</p>
</section>
```

### `term` — أول ظهور لمصطلح
```html
<section class="slide term">
  <div class="kicker">كلمة جديدة</div>
  <div class="en">repeat</div>
  <div class="ar">كرر</div>
  <p class="def">لوب بعدد مرات. اللى جواه بيتكرر.</p>
  <div class="row"><img src="../assets/A-BL-05.png" alt="بلوكات repeat و forever"></div>
</section>
```
الصورة اختيارية. القالب بيصغر الخط والصورة تلقائيا لما تكون موجودة.

### `predict` — بلوك `PRIMM`
```html
<section class="slide predict">
  <div class="kicker">توقع — ماتشغلش لسه</div>
  <div class="q">لو ضغطنا العلم الأخضر — هيحصل إيه؟</div>
  <p class="muted">اكتب توقعك فى الدفتر — سطر واحد. محدش يقول بصوت عالى.</p>
  <div class="row">
    <img src="../assets/A-SC-04.png" alt="كود القطة">
    <div class="box">فى الدفتر — سطر واحد.</div>
  </div>
</section>
```
**الصورة هنا نضيفة — بلا تحويط.**

### `step` — خطوة بناء
```html
<section class="slide step">
  <h2><span class="n">7</span> خبيها 🙈</h2>
  <div class="row">
    <img src="../assets/A-UI-12.png" alt="محرر الرسم">
    <p class="inst">تعليمة واحدة بس.<br><span class="muted">تلميح صغير.</span></p>
  </div>
</section>
```
**رقم الخطوة رقم — مش إيموجى.**

### `code` — كود كبير
```html
<section class="slide code">
  <h2>كود القطة</h2>
  <pre>when flag clicked
go to x: (200) y: (-150)
<span class="hl">repeat (20)</span>
  <span class="hl">move (5) steps</span>
end</pre>
</section>
```
`.hl` بتظلل السطر المهم.

### `ask` · `break` · `card` · `challenge` · `sources`
```html
<section class="slide ask"><div class="kicker">نجرب</div><h1>سؤال واحد كبير</h1></section>

<section class="slide break" data-min="5">
  <div class="num">البلوك 3 من 7</div>
  <h1>فاصل 🤖</h1><p>روبوت متعطل — بعيد عن الشاشة</p>
</section>

<section class="slide card">
  <div class="cardbox">
    <div class="id">SK-A-04</div>
    <h2>أكرر</h2>
    <p><b>متى:</b> ...</p>
    <p><b>الخطوات:</b> ...</p>
  </div>
</section>

<section class="slide challenge">
  <div class="kicker">تحدى اختيارى 🏠</div>
  <h1>...</h1><p class="big">💾 احفظوا</p>
</section>

<section class="slide sources">
  <h2>المصادر</h2>
  <ul>
    <li>المشاريع: Raspberry Pi Foundation — projects.raspberrypi.org/en/projects/&lt;slug&gt;</li>
    <li>الطريقة: PRIMM (Sue Sentance) · Use-Modify-Create (Lee et al.)</li>
    <li>التقييم: Brennan &amp; Resnick — Harvard</li>
    <li>أكاديمية 4U — 2026</li>
  </ul>
</section>
```

---

## 4. قواعد الاتجاه `BiDi` — أكتر مصدر أخطاء

| الحالة | غلط | صح |
| --- | --- | --- |
| مصطلح إنجليزى وسط عربى | `الفرق بين change و set؟` | `الفرق بين <code>change</code> و<code>set</code>؟` |
| جملة بتبدأ بإنجليزى | `<h2>forever مالوش بعد</h2>` | `<h2>الـ <code>forever</code> مالوش «بعد»</h2>` |
| أقواس معقوفة inline | `forever { go to back layer }` | `<pre>forever\n  go to back layer\nend</pre>` |
| أسماء متتالية | `Pico ← Nano ← Giga` | `<code>Pico</code> ثم <code>Nano</code> ثم <code>Giga</code>` |
| قائمة أرقام | `جرب 50 · 120 · 200` | `<code>50</code> ثم <code>120</code> ثم <code>200</code>` |
| علامة استفهام بعد إنجليزى | `set color effect to?` | حط المصطلح فى `<code>` والاستفهام بعده |

**السبب:** `<code>` عنده `unicode-bidi:isolate` فى القالب — بيعزل النص الإنجليزى ويمنعه من قلب ترتيب الجملة.

---

## 5. الأخطاء البصرية المتكررة وعلاجها

| العرض | العلاج |
| --- | --- |
| الشريحة بتخرج عن الشاشة | قلل المحتوى أو اقسمها. القالب فيه `max-height` للصور جوه `.term` |
| نص محشور فى ثلث الشريحة | لو مفيش صورة استخدم شريحة بلا `.row` — القالب بيوسع النص |
| الصورة بتغطى النص | `.row` بيقسم أفقيا. لو ضاق، حط الصورة فى شريحة مستقلة |
| البلوك المحوط صغير | اقص اللقطة حوالين البلوك — `capture.mjs` بيعمل ده |
| الترقيم بيقفز | كل شريحة `block` (شامل الفواصل) لازم `.num` |
| سهم `←` معلق آخر السطر | حط `<br>` قبل الجزء الأخير |

---

## 6. الفحص البصرى — إلزامى

```
node _tools/render-deck.mjs A-scratch/A1/slides/S04.slides.html _review/.render/A1-S04
```

بيصور كل شريحة `PNG`. **افتح كل صورة وشوفها.** فحص الكود مش بديل عن الفحص البصرى — نص المشاكل ما بتبانش إلا فى الصورة.
