Use the `solid-border` or `dashed-border` class to add a solid or dashed border around a `<section>` or `<div>`. The borders use the `detail2` colour. 

![A `<section>` with a dashed border, followed by three `<div>` elements. One has a dashed border, one has no border, and one has a solid border.](images/web-borders.png)

--- code ---
---
language: html
filename: index.html
line_numbers: false
---

<section>
    <h2 class="xcenter dashed-border">Lorem Ipsum</h2>
</section>
      
<section class="wrap">
    <div class="secondary dashed-border xcenter ycenter tile">
        <h3>Lorem ipsum</h3>
    </div>
    <div class="tertiary xcenter ycenter tile">
        <h3>Lorem ipsum</h3>
    </div>
    <div class="primary solid-border xcenter ycenter tile">
        <h3>Lorem ipsum</h3>
    </div> 
</section>

--- /code ---

**Tip:** You can adjust the `border` values for the `solid-border` and `dashed-border` classes in `style.css`. 
