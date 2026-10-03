Make sure that tags with an open and close tag such as `<div>` and `</div>` are correctly matched and nested.

This HTML is incorrect because there is no closing `</div>` tag. 

--- code ---
---
language: HTML
filename: index.html
line_numbers: false
---

<section>
<div><p>Lorem ipsum</p>
</section>

--- /code ---

This HTML is incorrect because the `</div>` appears before the closing `</p>` tag.

--- code ---
---
language: HTML
filename: index.html
line_numbers: false
---

<div><p>Lorem ipsum</div></p>

--- /code ---

**Tip:** If your HTML is incorrect, then sometimes a web browser will work out what you meant. You should still make sure your HTML is correct as incorrect HTML might cause problems later. Incorrect HTML also makes it difficult for screen readers to understand your page. 
