## Reflection

Well done. You have created a website using HTML, CSS, and JavaScript.

Answer the three questions below to reflect on what you've learnt.

You will be guided towards the correct answer. You can do this activity as many times as you want to.

--- question ---

---
legend: Question 1 of 3
---

When creating navigation links in HTML, which tag is used to define a hyperlink?

--- code ---
---
language: html
filename: index.html
line_numbers: false
---   
    <header>
      <nav class="navigation-header">
        <div class="nav-items">
          <a class="active" href="index.html">Home</a>
          <a href="wildlife.html">Wildlife</a>
          <a href="climate.html">Climate</a>
        </div>
        <div class="burger">
          <span id="openHam">&#9776;</span>
          <span id="closeHam">&#x2716;</span>
        </div>
      </nav>
        <div class="hero-image home"></div>
    </header>

--- /code ---


--- choices ---

- ( ) `<link>`

  --- feedback ---
  
  Not quite. The `<link>` tag is used to define external resources, such as stylesheets, but not for creating hyperlinks.
 
  --- /feedback ---

- ( ) `<span>`

  --- feedback ---

Not quite. The `<span>` tag is used for grouping in-line elements and applying styles, not for creating hyperlinks.

  --- /feedback ---

- (x) `<a>`

  --- feedback ---

Correct! The `<a>` tag is used to create hyperlinks in HTML. It stands for "anchor" and is followed by the href attribute, specifying the link destination.

  --- /feedback ---

--- /choices ---

--- /question ---
