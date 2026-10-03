المشاريع والصور

---

## 1. ملفات المشاريع — القاعدة الأساسية

**المواد بتتكتب من الملف، مش الملف بيتعمل من المواد.**

كل رقم واسم فى أى شريحة أو ملاحظة لازم يطلع من:
```
node _tools/dump-sb3.mjs <ملف.sb3>
```
أو من قراءة `index.html` لمشاريع الويب.

---

## 2. أنواع ملفات `checkpoints`

| النوع | الوصف | بيتستخدم فى |
| --- | --- | --- |
| `P<n>-starter` | نقطة البداية من `Raspberry Pi` | مرجع |
| `P<n>-final` | المشروع منته | `PRIMM` فى الجلسة `A` |
| `P<n>-after-A` | حالة نهاية الجلسة `A` بالظبط | الغايب والمتعثر فى الجلسة `B` |
| `debug/DB-<track>-nn` | حالة الطفل + خطأ واحد | `PRIMM` فى الجلسة `B` |
| `P6-skeleton` | هيكل مشروع `Invent` | الغايب فى `Invent` |

---

## 3. قواعد صارمة اتعلمناها بالتجربة

1. **الملف النهائى لازم يتطبع** لحالة بداية نظيفة: السبرايتات ظاهرة وفى أماكنها، الخلفية الأولى، الاتجاه الطبيعى. الملف اللى اتحفظ بعد تشغيل بيفتح بمشهد ناقص.
2. **لو المشروع فيه `when timer >`** لازم يكون فيه `reset timer` فى التهيئة — التايمر مابيترجعش بالعلم الأخضر، والتشغيلة التانية بتبوظ.
3. **`after-A` = ناتج الجلسة `A` بالظبط.** احذف أى سبرايت أو خلفية أو سكربت من جلسة جاية.
4. **`debug` = خطأ واحد بس**، وباقى المشروع = حالة الطفل فى اللحظة دى (مش المشروع المنتهى).
5. **كل الملفات المشتقة تتولد بسكربت** فى `_tools/make-checkpoints.mjs` — عشان أى تعديل فى الأصل ينتشر.
6. **بعد التوليد: حمل كل ملف فى `Scratch` فعليا** وشغله. التوليد الصحيح مش ضمان إن الملف بيفتح.
7. **امسح `comments`** من ملفات الأطفال (تعليقات إنجليزى من المشروع الأصلى) — بيتعمل تلقائيا فى `make-checkpoints.mjs`.

---

## 4. `_tools/sb3.mjs` — مكتبة تعديل ملفات `Scratch`

بلا تبعيات خارجية. أهم الدوال:

```js
S.load(file)                     // { files, project }
S.save({files, project}, out)    // بيحفظ ويشيل الأصول غير المستخدمة
S.sprite(project, 'Pico')        // السبرايت بالاسم
S.stage(project)
S.removeSprite(project, name)
S.tops(target)                   // معرفات السكربتات العليا
S.find(target, opcode, nth)      // أول بلوك بالأوبكود
S.subtree(target, id)            // كل البلوكات التابعة
S.removeScript(target, topId)
S.keepScripts(target, pred)      // احتفظ باللى بيحقق الشرط
S.clearScripts(target)
S.unlink(target, id)             // شيل بلوك من سلسلته
S.insertAfter(target, id, after)
S.detach(target, id, x, y)       // افصله كسكربت مستقل (لعمل فجوة)
S.unwrap(target, id)             // فك بلوك تحكم وارفع محتواه
S.addBlock(target, {opcode, inputs, fields}, afterId)
S.setInput(target, id, name, S.NUM(5))   // NUM · TEXT · INT · POS
```

مثال قاعدة توليد:
```js
job('DB-A-04', 'P2-final', p => {          // move خارج اللوب
  const t = S.sprite(p, 'Sprite1');
  const mv = S.find(t, 'motion_movesteps');
  const rep = S.find(t, 'control_repeat');
  S.unlink(t, mv); S.insertAfter(t, mv, rep);
});
```

---

## 5. الصور — الفلسفة

- **لقطات حقيقية** من البرنامج نفسه. ممنوع رسوم توضيحية أو صور من الإنترنت.
- **التحويط بيتعمل وقت الالتقاط** بسكربت — مش بمحرر صور. عشان يتعاد بالظبط لو اتغير حاجة.
- **القص حوالين المنطقة المهمة** — لقطة الواجهة الكاملة بتخلى البلوك `20px` مش مقروء من آخر الفصل.
- **مظهر `Scratch Desktop`:** الأداة بتخفى `Debug` و`Join Scratch` و`Sign in` عشان اللقطة تطابق اللى الطفل هيشوفه.

---

## 6. `_tools/capture.mjs` — إزاى تضيف لقطة

الأداة فيها دوال مساعدة:

```js
// لقطة واجهة عامة
A('A-UI-05', async ({ sc, out }) => {
  const p = await sc.fresh(); await desktopLook(p);
  const r = await rectOf(p, '[class*="sprite-selector_add-button"]');
  await annotate(p, [{ sel: '...', label: 'سبرايت جديد', pad: 6, labelPos: 'left' }]);
  await shoot(p, out, clampClip({ x: r.x - 560, y: r.y - 300, w: 700, h: 400 }));
});

// بلوك من الباليتة (بيحمل مشروع ويختار سبرايت)
BL('A-BL-05', 'Control', ['control_repeat', 'control_forever'], 'كرر · للأبد', P2A, 'Sprite1');

// سكربت من ملف مشروع حقيقى
SCF('A-SC-03', P2A, 'Sprite1', null);

// نفس السكربت بتحويط (للاستقصاء)
SCF('A-SC-04b', () => path.join(A_CK, 'debug/DB-A-04.sb3'), 'Sprite1', async (p, r) => {
  const mv = await p.evaluate(...);
  await annotate(p, [{ rect: mv, label: 'برة اللوب!', pad: 6, labelPos: 'right' }], { dim: 0 });
});

// ستيج مشروع منته
PR('A-PR-02', 'P2-final.sb3', { wait: 3500 });

// معاينة صفحة ويب
BPR('B-PR-01', 'P1-final');

// كود ويب بشكل محرر + معاينة
CD('B-CD-05', { files: [{ name: 'style.css', code: '...', lang: 'css' }], zoom: true }, async p => {
  await annotate(p, [{ rect: await textRect(p, 'h1'), n: 1, label: 'سيليكتور — مين؟' }], { theme: 'B' });
});

// تحويط لقطة خام صورها المؤسس
RAW('B-UI-02', 'B-UI-01', [ {...} ], { dim: 0.25, covers: VSC_COVERS });
```

التشغيل:
```
node _tools/capture.mjs                 # الناقص بس
node _tools/capture.mjs A-BL-05 A-SC-03 # محددة
node _tools/capture.mjs --force --track A
node _tools/capture.mjs --list
```

**نمط التحويط المعتمد:** إطار بلون المسار + هالة بيضا + رقم دائرى مائل + تسمية عربية + تعتيم خارج المنطقة. الألوان: مسار `A` برتقالى `#ff7a00` وتسمية بنفسجى · مسار `B` تركواز `#0aa6a6` وتسمية بمبى.

---

## 7. اللقطات اللى لازم يد بنى آدم

فى لقطات مستحيل تتأتمت (حساب `GitHub`، `VS Code` على جهاز المؤسس). الطريقة:
1. اكتب ورقة تعليمات للمؤسس فى `_tools/capture-manual.md` — اسم الملف بالظبط، إيه اللى لازم يبان، وأين يحفظها.
2. لما يجيب اللقطات الخام: حطها فى `<track>/assets/raw/`.
3. أضف تعريف `RAW(...)` فى `capture.mjs` بإحداثيات التحويط، و`covers` لتغطية أى بيانات شخصية.
4. شغل الالتقاط — الأداة بتحمل الصورة الخام وتحوط عليها وتحفظ النهائية.

---

## 8. بعد أى تغيير فى الصور

```
node _tools/sync-manifest.mjs
node _tools/validate.mjs
```
