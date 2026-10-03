# المستوى `B1` — مقدمة الويب

> **المسار:** `B` · **السن:** `13–16` · **الأداة:** `VS Code` + المتصفح — ملفات محلية
> **المصدر:** `https://projects.raspberrypi.org/en/pathways/web-intro`
> **الحالة:** `built` — `16` جلسة كاملة

---

## المخرج النهائى

بنهاية المستوى كل طالب عنده **صفحة ويب عن موضوع من اختياره، منشورة على رابط حقيقى** (`GitHub Pages`) يفتحه أهله من الموبايل، ويقدر يشرح إزاى الـ `HTML` بيحدد المحتوى والـ `CSS` بيحدد الشكل.

**زوج للبناء، فرد للمخرج والتقييم.** الأطفال بيشتغلوا أزواج طول المستوى (`pedagogy.md` §7)، لكن **كل طفل عنده صفحته وريبوه ورابطه باسمه**. التوزيع الزمنى:

| متى | مين ينشر |
| --- | --- |
| `S12` بلوك المهارة | السائق فى كل زوج — `6` روابط |
| `S13` أول `10` دقايق من بناء `1` | الملاح — الـ `6` الباقيين |
| `S16` العرض | `12` عرض فردى، `12` رابط |

التقييم فردى دايما: دفتر التصميم والمقابلة المصورة (`assessment.md`).

## المتطلب السابق

لا شىء — نقطة دخول. يفترض: كتابة على الكيبورد بالإنجليزى ولو ببطء.

---

## قرار البيئة التقنية

**افتراض:** الطالب يشتغل **محليا** — فولدر المشروع على الجهاز، يعدل فى `VS Code`، ويشوف النتيجة فى المتصفح بـ `F5`. **بدون حسابات، بدون إنترنت.**

| البديل | ليه لأ |
| --- | --- |
| محرر `Raspberry Pi` الأونلاين بدون حساب | ما بيحفظش — كل جلسة من الصفر |
| محرر `Raspberry Pi` بحساب | حساب تانى غير `GitHub` — عبء على ولى الأمر |
| الشغل المحلى | **الطريقة الحقيقية.** الملفات جاهزة للرفع على `GitHub` فى `S12`. النت وقع؟ مافيش أثر |

المحرر الأونلاين يستخدمه **المدرس على البروجيكتور** لبلوك `PRIMM` — أسرع فى العرض.

**الحفظ:** `Ctrl+S` فى `VS Code` ← `F5` فى المتصفح. الفولدر بيتجمع على الفلاشة آخر كل جلسة زى `A1`.

**الخطوط:** كل مشروع جواه فولدر `fonts/` فيه الخطوط منزلة (`28` خط · `1.6MB`). ملفات `Raspberry Pi` الأصلية كانت بتحملها من `fonts.googleapis.com`، والنت لو وقع الصفحة كانت تطلع بخط تانى وتبان مختلفة عن اللقطات اللى فى الشرائح — والطفل يفتكر إنه هو اللى غلط. `S07` لسه بتعلم `Google Fonts` من الموقع نفسه؛ اللى اتغير إن المشروع الجاهز مابقاش معلق على النت. التنزيل مرة واحدة بـ:

```
node _tools/fetch-fonts.mjs
```

---

## المشاريع

| # | المرحلة | المشروع | الجلسات | يعلم | المخرج |
| --- | --- | --- | --- | --- | --- |
| `P1` | `Explore` | `Anime expressions` | `S02–S03` | بنية الصفحة (`header` · `main` · `footer` · `section`) · العناوين والفقرات · الصور و`alt` · **قاعدة `CSS`** · الكلاسات الجاهزة · لوحات الألوان كملف | صفحة تعليم رسم أنمى بثلاث تعبيرات |
| `P2` | `Explore` | `Top 5 emojis` | `S04–S05` | القوائم `ol`/`ul` · **أنيميشن `@keyframes`** · صورة الخلفية · **أول كلاس من تأليف الطالب** (`.transparent`) · اللينك والاقتباس · `span` | صفحة أفضل `5` إيموجى بأنيميشن وخلفية |
| `P3` | `Explore` | `Flip treat webcards` | `S06–S07` | `<title>` · `div` كصندوق · **`:hover`** و`transform` · التدرج · خط من `Google Fonts` | كارت بيتقلب لما الماوس يقف عليه |
| `P4` | `Design` | `Mood board` | `S08–S09` | اختيار لوحة ألوان من `20` · تخطيط بأقسام · الكلاسات الجاهزة للألوان · `tile` · حواف وظلال · **التباين** | لوحة مزاج لموضوع من اختياره |
| `P5` | `Design` | `Sell me something` | `S10–S11` | صفحة هبوط · «نداء للفعل» · كل المهارات بحرية · كلاس جديد من تأليفه | صفحة تبيع فكرة أو منتج |
| `P6` | `Invent` | `Build a webpage` | `S12–S15` | **تكامل + النشر** — `GitHub` · `commit` · `GitHub Pages` | صفحة عن موضوعه على رابط حى |

---

## خريطة الجلسات

| الجلسة | النوع | المشروع | المفاهيم الجديدة | بلوك المهارة | البنوك |
| --- | --- | --- | --- | --- | --- |
| `S01` | افتتاح | — | `HTML` مقابل `CSS` · التاج · `VS Code` · `F5` · `F12` | — | `UP-11` `UP-14` `UP-M-07` `UP-M-08` `AN-blocks-to-text` `AN-html-css` `AN-tag` |
| `S02` | قياسى `A` | `P1` | `header`/`main`/`footer` · `section` · `h1`/`h2` · `p` · الكومنت · `img`/`src`/`alt` · الأتريبيوت | — | `UP-12` `UP-M-01` `UP-M-07` `PS-B-01` `AN-attribute` `AN-html-css` `AN-tag` |
| `S03` | قياسى `B` | `P1` | `strong` · **قاعدة `CSS`** · السيليكتور والخاصية والقيمة · الكلاس كأتريبيوت · متغير اللون · `hex` · اللوحة · `rtl` | — | `UP-13` `UP-M-02` `UP-M-08` `PS-B-02` `DB-B-01` `AN-class` `AN-selector` |
| `S04` | قياسى `A` | `P2` | `ol`/`li` · الإيموجى · `@keyframes` · `wrap`/`wide`/`narrow` | الأمان + الملكية الفكرية | `UP-16` `UP-M-03` `UP-M-07` `AN-animation` |
| `S05` | قياسى `B` | `P2` | `background-image` · `opacity` · **كلاس من تأليفك** · `a href` · `blockquote`/`cite` · `span` | — | `UP-13` `UP-M-04` `UP-M-08` `PS-B-04` `DB-B-03` `AN-class` |
| `S06` | قياسى `A` | `P3` | `<title>` · `div` · بنية الكارت | — | `UP-19` `UP-M-05` `UP-M-07` `PS-B-05` `AN-margin-padding` `AN-tag` |
| `S07` | قياسى `B` | `P3` | `:hover` · `transform: rotateY` · `linear-gradient` · `Google Fonts` | — | `UP-M-06` `UP-M-08` `PS-B-06` `DB-B-05` `AN-hover` |
| `S08` | قياسى `A` | `P4` | التصميم · لوحة الألوان · التخطيط بأقسام | أدوات `AI` للمبرمج | `UP-M-01` `UP-M-07` |
| `S09` | قياسى `B` | `P4` | `tile` · حواف وظلال · التباين | — | `UP-M-02` `UP-M-08` `PS-B-03` `DB-B-06` `AN-class` |
| `S10` | قياسى `A` | `P5` | صفحة الهبوط · نداء للفعل · الإقناع | — | `UP-M-03` `UP-M-07` `PS-B-07` `AN-html-css` |
| `S11` | قياسى `B` | `P5` | كلاس جديد · التوازن فى الأنيميشن | — | `UP-M-04` `UP-M-08` `PS-B-06` `DB-B-07` `AN-animation` |
| `S12` | `Invent` تخطيط | `P6` | البريف · الجمهور · **`GitHub` ريبو + `Pages`** | `github-repo-pages` | `UP-M-05` `UP-M-07` `AN-commit` `AN-repository` |
| `S13` | `Invent` بناء | `P6` | التكامل — قسم قسم · صيغة طلب المساعدة · تمهيد حساسية حروف اسم الملف | — | `UP-M-06` `UP-M-08` `DB-B-08` |
| `S14` | `Invent` تغذية | `P6` | اختبار الأقران · **`commit`** | `github-commit` + مقابلات `1–4` | `UP-M-01` `UP-M-07` `PS-B-08` `AN-commit` |
| `S15` | `Invent` إنهاء | `P6` | قائمة الفحص · `commit` نهائى | `github-final-commit` + مقابلات `5–8` | `UP-M-02` `UP-M-08` |
| `S16` | عرض | `P6` | — | مقابلات `9–12` | `UP-M-06` |

---

## تبعية المفاهيم

```
S01  HTML vs CSS · tag · editor · F5 · F12
 │
S02  page structure (header/main/footer/section) · h1 h2 p · comment
 │
S03  img src alt · strong · CSS RULE (selector {property: value}) · class attribute · color variables · hex
 │
S04  ol/li · @keyframes animation (apply ready class) · layout classes (wrap/wide/narrow)
 │
S05  background-image · opacity · WRITE YOUR OWN CLASS · a href · blockquote · span
 │
S06  <title> · div as box · card structure (front/back)
 │
S07  :hover · transform · gradient · @font-face via Google Fonts
 │
S08  design choices · palette selection · layout (uses S02 + S03)
 │
S09  tile · border/shadow/radius · contrast (uses S05 own class)
 │
S10  landing page · call to action (uses everything)
 │
S11  own classes · animation restraint (uses S04 + S07)
 │
S12–S15  WEBPAGE = all + GitHub repo → Pages → commit → commit
```

---

## ملفات `checkpoints/` — فولدرات لا ملفات

> كل مشروع فولدر: `index.html` + `style.css` + ملفات الألوان + `images/`. **تحمل مرة واحدة** من المحرر الأونلاين (زرار التحميل فى شريط المشروع) وتفك فى `checkpoints/`.

| الفولدر | يحمل من | يستخدم فى |
| --- | --- | --- |
| `P1-starter/` | `editor.raspberrypi.org/en/projects/anime-expressions-starter` | `S02` نقطة البداية لكل طالب |
| `P1-after-A/` | يبنى يدويا: `starter` + `header` + `section` أولى + `img` | `S03` للغائب |
| `P1-final/` | `anime-expressions-step-8` | `S02` بلوك `PRIMM` |
| `P2-starter/` | `top-5-emoji-list-starter` | `S04` |
| `P2-after-A/` | `starter` + القائمة + الكأس بأنيميشن | `S05` |
| `P2-final/` | `top-5-emoji-list-complete` | `S04` `PRIMM` |
| `P3-starter/` | `flip-treat-webcards-starter` | `S06` |
| `P3-after-A/` | `starter` + كارت بوش وضهر بدون قلب | `S07` |
| `P3-final/` | المشروع المكتمل | `S06` `PRIMM` |
| `P4-starter/` | `mood-board-starter` | `S08` |
| `P4-examples/` | `happiness-mood-board` · `beetle-mood-board` | `S08` `PRIMM` |
| `P5-starter/` | `sell-me-something-starter` | `S10` |
| `P5-examples/` | `skateboarding` · `mood-lamp` | `S10` `PRIMM` |
| `P6-starter/` | `build-a-web-page-starter` | `S12` |
| `P6-examples/` | `favourite-things` · `egypt` | `S12` `PRIMM` |
| `P6-skeleton/` | هيكل الصفحة بعد بناء `2` — ملف اللحاق للغايب | `S12` |
| `P1-after-A/` … `P5-after-A/` | حالة المشروع بعد الجلسة `A` — نقطة رجوع الغايب والمتعثر | الجلسة `B` |
| `debug/DB-B-01/` … `DB-B-08/` | يبنى يدويا من الـ `final` بالخطأ المذكور فى `bank-debug.md` | حسب الجلسة |

**مثال `egypt` مبنى داخليا** — `_tools/make-web-checkpoints.mjs` جوه `job` اسمه `P6-egypt`، من `P6-starter` بمفردات `B1` بالظبط: `14` قسم · `8` صور كلها بـ `alt` وصفى · قائمة مرقمة بتلات عناصر · اقتباس بمصدره · لوحة ألوان مربوطة. يشتغل والنت واقع — الخط نسخة محلية، ومافيش `CDN` ولا `JavaScript`. يستخدم فى `S12` للعد والتفكيك.

**كل ملفات المشاريع مولدة** — ممنوع التعديل اليدوى. أى تغيير يتكتب فى المولد ويتعاد تشغيله:

```
node _tools/make-web-checkpoints.mjs
```

---

## بطاقات المهارات — ترتيب التوزيع

| الجلسة | البطاقات الجديدة |
| --- | --- |
| `S01` | `SK-B-01` أفتح مشروعى |
| `S02` | `SK-B-02` عنوان وفقرة |
| `S03` | `SK-B-03` صورة · `SK-B-05` لون وحجم · `SK-B-06` كلاس · `SK-B-13` ألاقى الغلط |
| `S04` | `SK-B-04` قائمة · `SK-B-11` أنيميشن |
| `S05` | `SK-B-12` لينك |
| `S06` | `SK-B-07` مسافة |
| `S07` | `SK-B-08` هوفر · `SK-B-09` خط · `SK-B-10` تدرج |
| `S12` | `SK-B-14` أرفع على `GitHub` |
| `S14` | `SK-B-15` أعدل على `GitHub` |

---

## التكييف الثقافى

| الأصل | التعديل | السبب |
| --- | --- | --- |
| `Anime expressions` — محتوى إنجليزى | الطالب يكتب الشرح بالعربى لو حابب — `<html lang="ar" dir="rtl">` تشرح كخيار فى `S03` | ملكية. والعربى فى `HTML` درس فى حد ذاته |
| `Top 5 emojis` — اقتباس `Jenna Wortham` | يبقى، ويقترح بديل: أى جملة من الطالب أو من أغنية بيحبها — بدون أسماء حقيقية لأصحابه | — |
| `Sell me something` — أمثلة | تضاف: كشرى · كرة قدم · رمضان · الساحل · لعبة بيحبها | قرب |
| `Build a webpage` — مثال `Egypt` | **يستخدم كمثال أول** — موجود فى أمثلة `Raspberry Pi` نفسها | قرب مباشر |
| الأسماء والصور | لا اسم كامل ولا صورة شخصية — `safeguarding.md` §1.2 | النشر عام |
