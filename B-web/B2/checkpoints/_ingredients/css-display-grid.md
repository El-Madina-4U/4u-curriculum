To make a more precise layout on your webpage, you can use a grid!

### Create a class

Create a class inside of your `style.css` file — it is best to use a **class** or **id** for this. If you style a tag, every version of that tag on your page will be a grid. 

Set the `display` property to `grid`. 

Set a `height`. You can use `vh` for this, or set a `px` value. 

Define your **rows** (the `grid-template-rows` property) and **columns** (the `grid-template-columns`). 

You can set the size of your rows in any of these ways:
+ Percentages – you can set the rows and columns as a `%` of the width or height
+ Fractions – you can set them as a `fr` of the width or height
+ Pixels – you can set the height as a direct `px` value 

Here are some examples:

--- code ---
---
language: css
filename: style.css 
---
// A class
.fact-holder {
  display: grid;
  height: 50vh;
  grid-template-rows: 50% 50%;
  grid-template-columns: 50% 50%;
}

--- /code ---

--- code ---
---
language: css
filename: style.css
---
// An ID
#homepage-grid {
  display: grid;
  height: 80vh;
  grid-template-rows: 2fr 1fr 1fr;
  grid-template-columns: 1fr 1fr;
}

--- /code ---

### Add the grid to your HTML

Once you have create your selector, add your class or id to an **HTML** element.

--- code ---
---
language: html
---

<section class="fact-holder">

</section>

--- /code ---

--- code ---
---
language: html
---

<div id="homepage-grid">

</div>

--- /code ---
