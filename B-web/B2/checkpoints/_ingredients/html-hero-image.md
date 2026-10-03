Add a new `<div>` element with a class attribute of `hero-image`.

--- code ---
---
language: html
filename: index.html
---

<header>
    <div class="hero-image"></div>
</header>

--- /code ---

In `style.css`, add a new selector for the `hero-image` class.

Instead of adding an `<img>` element to the HTML, you can use the CSS `background-image` property to add your image. 

Set the height of your `<div>` so that the image has space to fill. 

The image should fill the `<div>` element (by setting the `background-size` property to `cover`) and be centered.

--- code ---
---
language: css
filename: style.css
---

/* Hero image - homepage */
.hero-image {
  min-height: 50vh;
  background-image: url('antarctic-northern-lights.jpg'); 
  background-size: cover;
  background-position: center;
}

--- /code ---
