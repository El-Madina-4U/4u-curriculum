Use the `transparent` class to make an element partially transparent so you can see the content behind it.

--- code ---
---
language: html
filename: index.html
line_numbers: false
---

<div class="transparent">
    <p>Add text here</p>
</div>

--- /code ---

**Tip:** Adjust the `opacity` value for the `transparent` class in `style.css`: `0` is completely transparent and `1` is not at all transparent. 

--- code ---
---
language: CSS
filename: style.css
line_numbers: false
---
/* Add a transparent effect */

.transparent {
  opacity: 0.95;
}
--- /code ---
