# المستوى `A1` — مقدمة `Scratch`

> **المسار:** `A` · **السن:** `10–12` · **الأداة:** `Scratch 3` — بدون حسابات، ملفات محلية
> **المصدر:** `https://projects.raspberrypi.org/en/pathways/scratch-intro`
> **الحالة:** `built` — `16` جلسة كاملة

---

## المخرج النهائى

بنهاية المستوى كل **زوج** عنده **كتاب رقمى تفاعلى متعدد الصفحات** عمله لشخص محدد، و**كل طفل** يقدر يشرح نصيبه منه ويشرح الكتاب كله: إزاى بيقلب الصفحات وإزاى كل صفحة بتعمل حاجة مختلفة.

> **ملحوظة:** المشروع ثنائى بقصد — البرمجة الثنائية جزء من التعلم. التقييم فردى: المقابلة المصورة بتسأل كل طفل عن نصيبه وعن المشروع كله.

## المتطلب السابق

لا شىء — نقطة دخول. يفترض فقط استخدام الماوس والكيبورد.

---

## المشاريع

| # | المرحلة | المشروع | الجلسات | يعلم | المخرج |
| --- | --- | --- | --- | --- | --- |
| `P1` | `Explore` | `Space talk` | `S02–S03` | السبرايت والخلفية · `when this sprite clicked` · `say` و`think` · الصوت · الكوستيوم · محرر الرسم · تأثير اللون | مشهد فضاء بتلات شخصيات، كل واحدة بتعبر بطريقة لما تتضغط |
| `P2` | `Catch the bus` | `Catch the bus` | `S04–S05` | `when green flag clicked` · الإحداثيات `x` و`y` · الحجم والطبقات · **`repeat`** · `move` · `next costume` كأنيميشن · `show` و`hide` · `glide` · `point towards` | أنيميشن: قطة وفرس نهر بيجروا على أتوبيس بيمشى |
| `P3` | `Explore` | `Find the bug` | `S06–S07` | الخلفيات كمستويات · **`when backdrop switches to`** · `next backdrop` · كود الستيج · **`forever`** · `if on edge, bounce` · التايمر | لعبة: لاقى الحشرة المخبية فى كل مستوى، بمشتت طاير ومؤقت |
| `P4` | `Design` | `Silly eyes` | `S08–S09` | رسم سبرايت من الصفر · `point towards mouse-pointer` جوه `forever` · `duplicate` · نقل الكود بين السبرايتات · تأثيرات عند الضغط | شخصية من تصميم الطفل عينيها بتتبع الماوس |
| `P5` | `Design` | `Surprise! animation` | `S10–S11` | التقسيم لأجزاء (`decomposition`) · سكربت التهيئة · التوقيت بـ `wait` · `hide` و`show` بين سبرايتين | أنيميشن قصير بثلاثة أجزاء: فضول ← مفاجأة ← رد فعل |
| `P6` | `Invent` | `I made you a book` | `S12–S15` | **تكامل كل ما سبق** — الخلفيات كصفحات، السبرايتات بتظهر وتختفى حسب الصفحة، الضغط يقلب | كتاب رقمى لجمهور محدد |

**ملاحظة على `P3`:** الاسم «لاقى الحشرة» — بس ده مش مشروع تصحيح أخطاء. ده لعبة مستويات. وهو **أهم مشروع للمخرج النهائى** لأن آلية «الخلفية = مستوى» هى نفسها «الخلفية = صفحة» فى الكتاب.

---

## خريطة الجلسات

| الجلسة | النوع | المشروع | المفاهيم الجديدة | بلوك المهارة | البنوك |
| --- | --- | --- | --- | --- | --- |
| `S01` | افتتاح | — | سبرايت · ستيج · بلوك · سكربت · العلم الأخضر · الحفظ · التسلسل | — | `UP-07` `UP-M-01` `UP-M-04` |
| `S02` | قياسى `A` | `P1` | خلفية · إيفنت (`when this sprite clicked`) · `say` · صوت | — | `UP-04` `UP-M-01` `UP-M-06` `PS-A-01` `AN-event` `AN-sequence` |
| `S03` | قياسى `B` | `P1` | كوستيوم · `wait` · محرر الرسم · `think` · تأثير اللون | — | `UP-06` `UP-M-02` `UP-M-04` `PS-A-02` `DB-A-01` `AN-bug` `AN-costume` `AN-wait` |
| `S04` | قياسى `A` | `P2` | `when green flag clicked` · `x` و`y` · الحجم · الطبقة · نمط اللف · **`repeat`** · `move` | الأمان الرقمى | `UP-03` `UP-15` `UP-M-02` `UP-M-03` `AN-loop` |
| `S05` | قياسى `B` | `P2` | `next costume` فى لوب · `show` و`hide` · `point towards` · `glide` · الأرقام العشرية فى `wait` | — | `UP-09` `UP-M-01` `UP-M-05` `PS-A-04` `DB-A-04` `AN-costume` |
| `S06` | قياسى `A` | `P3` | تاب الخلفيات · كود الستيج · `switch backdrop to` · `next backdrop` · **`when backdrop switches to`** · `set size %` | — | `UP-10` `UP-M-03` `UP-M-04` `PS-A-05` |
| `S07` | قياسى `B` | `P3` | **`forever`** · `if on edge, bounce` · `change effect by` · التايمر · `reset timer` | — | `UP-M-01` `UP-M-06` `PS-A-09` `DB-A-09` `AN-forever` |
| `S08` | قياسى `A` | `P4` | التصميم · رسم سبرايت · التمركز · `duplicate` · `point towards mouse-pointer` · `rotation style all around` | أدوات `AI` — عرض | `UP-18` `UP-M-01` `UP-M-04` `PS-A-06` |
| `S09` | قياسى `B` | `P4` | `change color effect by` · نقل الكود بين السبرايتات · ملء الشاشة · تصحيح من قائمة | — | `UP-17` `UP-M-03` `UP-M-05` `PS-A-11` `DB-A-05` |
| `S10` | قياسى `A` | `P5` | التقسيم · سكربت التهيئة · الثيم والشخصية والشىء | — | `UP-08` `UP-M-02` `UP-M-06` `PS-A-07` `AN-sequence` |
| `S11` | قياسى `B` | `P5` | المفاجأة بـ `hide` و`show` بين سبرايتين · التوازى · ضبط التوقيت | — | `UP-20` `UP-M-01` `UP-M-04` `PS-A-10` `DB-A-06` |
| `S12` | `Invent` تخطيط | `P6` | البريف · الجمهور · التخطيط على الورق · الخلفيات كصفحات · كود الستيج | طلب المساعدة الصح | `UP-10` `UP-M-03` `UP-M-05` |
| `S13` | `Invent` بناء | `P6` | — | — | `UP-M-02` `UP-M-06` `DB-A-07` |
| `S14` | `Invent` تغذية | `P6` | اختبار الأقران · التكرار | مقابلات `1–4` | `UP-M-01` `UP-M-04` `PS-A-08` |
| `S15` | `Invent` إنهاء | `P6` | قائمة الفحص · التأمل | مقابلات `5–8` | `UP-M-03` `UP-M-06` |
| `S16` | عرض | `P6` | — | مقابلات `9–12` | `UP-M-06` |

---

## تبعية المفاهيم

```
S01  sequence · sprite · stage · block · script · green flag · save
 │
S02  backdrop · event(sprite clicked) · say · sound
 │
S03  costume · wait · paint editor · think · color effect
 │
S04  event(green flag) · x,y · size · layer · rotation · REPEAT · move ──┐
 │                                                                       │
S05  next costume in loop · show/hide · point towards · glide            │
 │                                                                       │
S06  backdrop as level · when backdrop switches · next backdrop · Stage code
 │
S07  FOREVER · bounce · change effect by · timer
 │
S08  paint a sprite · centre · duplicate · point towards mouse (uses S05 + S07)
 │
S09  effects on click · copy code between sprites · full screen
 │
S10  decomposition · setup script (uses S04) · theme
 │
S11  surprise via hide/show across sprites (uses S05) · timing (uses S03)
 │
S12–S15  BOOK = backdrops as pages (S06) + sprites per page (S06) + click to turn (S02) + everything
```

كل مفهوم يظهر أول مرة فى الجلسة المكتوبة ويفترض معروفا بعدها.

---

## ملفات `checkpoints/`

> **لازم تبنى قبل `S01`.** المدرس مايقدرش يعملها وقت الجلسة. تبنى مرة واحدة من المشاريع الأصلية وتحفظ `.sb3`.

| الملف | الحالة | يستخدم فى |
| --- | --- | --- |
| `P1-final.sb3` | `Space talk` منته بتلات شخصيات | `S02` بلوك `PRIMM` |
| `P1-after-A.sb3` | خلفية + `Pico` بيقول ويصوت | `S03` للغائب والمتعثر |
| `P2-final.sb3` | `Catch the bus` منته | `S04` بلوك `PRIMM` |
| `P2-after-A.sb3` | الأتوبيس فى مكانه + القطة بتمشى بلوب | `S05` |
| `P3-final.sb3` | `Find the bug` منته بمستويين وببغاء وتايمر | `S06` بلوك `PRIMM` |
| `P3-after-A.sb3` | شاشة البداية + المستوى الأول | `S07` |
| `P4-final.sb3` | `Silly eyes` — مثال `Gobo` | `S08` بلوك `PRIMM` |
| `P4-after-A.sb3` | شخصية + عينان بتتبعان الماوس | `S09` |
| `P5-final.sb3` | `Surprise! animation` — مثال الديناصور | `S10` بلوك `PRIMM` |
| `P5-after-A.sb3` | مشهد + سكربت تهيئة + جزء الفضول | `S11` |
| `P6-example.sb3` | مثال كتاب `Tickle monster` | `S12` بلوك `PRIMM` |
| `P6-skeleton.sb3` | ثلاث خلفيات فاضية مسماة `cover` `page1` `page2` + سبرايت زرار «التالى» بكود التقليب + كود ستيج `when flag clicked` ← `switch backdrop to cover` | `S13` للغائب |
| `debug/DB-A-01.sb3` … `DB-A-09.sb3` | تحديات التصحيح | حسب الجلسة |

**مصدر البناء:** الملفات النهائية (`P*-final` و`P6-example`) جابتها أداة `_tools/fetch-scratch.mjs` من مشاريع `Raspberry Pi`. والمشتقات كلها (`after-A` · `debug/DB-A-*` · `P6-skeleton`) بتتولد منها بـ:

```
node _tools/make-checkpoints.mjs
```

**الحالة (3 سبتمبر 2026): كل الملفات موجودة ومتحقق إنها بتفتح فى `Scratch`.** لو اتعدل ملف نهائى، أعد التوليد.

---

## بطاقات المهارات — ترتيب التوزيع

| الجلسة | البطاقات الجديدة |
| --- | --- |
| `S01` | `SK-A-13` أحفظ شغلى |
| `S02` | `SK-A-01` أضيف سبرايت · `SK-A-02` أخليه يتكلم · `SK-A-07` أضيف صوت · `SK-A-12` يستجيب للضغط |
| `S03` | `SK-A-06` أغير شكله · `SK-A-08` أستنى |
| `S04` | `SK-A-03` أبدأ السكربت · `SK-A-04` أكرر · `SK-A-05` أحرك |
| `S05` | `SK-A-10` أخفى وأظهر |
| `S06` | `SK-A-11` أغير الخلفية |
| `S07` | `SK-A-14` ألاقى الغلط |
| `S08` | `SK-A-09` يتبع الماوس |

بعد `S08` الطفل عنده كل البطاقات. `S09` لـ `S15` بتستخدمها.

---

## التكييف الثقافى

| الأصل | التعديل | السبب |
| --- | --- | --- |
| `Space talk` — لغة الإشارة «شكرا» | تبقى — وتذكر إشارة «شكرا» بلغة الإشارة المصرية لو المدرس يعرفها | قيمة تربوية |
| `Catch the bus` — «`Scratch Tours`» على الأتوبيس | الطفل يكتب وجهة مصرية: «الإسكندرية» · «الأهرامات» · «الساحل» | ملكية |
| `Find the bug` — «`Find the bug`» على السبورة | يكتبها بالعربى أو الإنجليزى — اختياره | — |
| `Surprise! animation` — الثيمات | تضاف: 🕌 رمضان · ⚽ الأهلى والزمالك · 🏖 الساحل | قرب |
| `I made you a book` — الجمهور | «لأخوك الصغير» · «لجدتك» · «لصاحبك فى المدرسة» | قرب |
| أسماء الشخصيات `Pico` `Nano` `Giga` `Tera` | تبقى كما هى — أسماء السبرايتات فى المكتبة | الطفل هيلاقيها بالاسم ده |
