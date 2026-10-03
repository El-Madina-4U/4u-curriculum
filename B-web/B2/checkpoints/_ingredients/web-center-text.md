Some items are automatically centred because of the style for their element. 

You can use the `xcenter` and `ycenter` classes to centre other elements horizontally and vertically. 

![Three blocks. The first block has text centred horizontally, the second block has text centred vertically, and the third block has text centred horizontally and vertically.](images/center-text.png)


--- code ---
---
language: html
filename: index.html
line_numbers: false
---

<section class="wrap">
  <div class="tertiary xcenter  tile">
    <p>Lorem ipsum</p>
  </div>
  <div class="secondary ycenter tile">
    <p>Lorem ipsum</p>
  </div>
  <div class="tertiary xcenter ycenter tile">
     <p>Lorem ipsum</p>
  </div>
</section>

--- /code ---
