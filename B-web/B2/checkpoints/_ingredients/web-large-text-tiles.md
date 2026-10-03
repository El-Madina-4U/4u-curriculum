You can use heading tags (`<h1>`, `<h2>`, and `<h3>`) to create large text headings in coloured tiles. 

![Three coloured boxes text in different sizes.](images/headings.png)

--- code ---
---
language: html
filename: index.html
line_numbers: false
---
<main class="page">
    <section class="wrap">
        <div class="primary tile">
          <h1>LOREM</h1>
        </div>

        <div class="secondary tile">
          <h2>LOREM<br>IPSUM</h2>
        </div>

        <div class="tertiary tile">
            <h3>Lorem<br>ipsum<br>dolor</h3>
        </div>
    </section>
</main>

--- /code ---

Use the `tile` class to make sure your tiles are all the same height. 

**Tip:** You can adjust the `height` of the `tile` class in `style.css`. 
