In JavaScript, you can view and change the content of an HTML element using various DOM properties.

### .innerHTML

`.innerHTML` refers to the text content as well as the CSS styling, attributes, and HTML tags of an element.

In this example, the HTML element has the attribute `id="myDiv"`.

--- code ---
---
language: html
filename: index.html
line_numbers: 
---

<div id="myDiv">
<p>This is the original content.</p>
</div>

--- /code ---

The `HTML` content of this element can be changed.

--- code ---
---
language: js
filename: scripts.js
line_numbers: 
---
     
// Update HTML element content 
document.querySelector(#myDiv).innerHTML = "<p>New content with <strong>HTML</strong> tags!</p>";
    
--- /code ---

### .innerText 

`.innerText` refers to the text content as well as the CSS styling but **not** the tags and attributes of an element.

--- code ---
---
language: html
filename: index.html
line_numbers: 
---

<div id="myDiv">
  <p>This is the original content.</p>
</div>

--- /code ---

--- code ---
---
language: js
filename: scripts.js
line_numbers: 
---
     
// Update HTML element content
document.querySelector(#myDiv).innerText = "New text content without HTML tags!";
    
--- /code ---

### .textContent

`.textContent` refers to only the text content of an HTML element.

--- code ---
---
language: html
filename: index.html
line_numbers: 
---

<div id="myDiv">
  <p>This is the original content.</p>
</div>

--- /code ---

--- code ---
---
language: js
filename: scripts.js
line_numbers: 
---
     
// Update HTML element content
document.querySelector(#myDiv).textContent = "New text content with HTML tags <strong>preserved</strong>!";
    
--- /code ---
