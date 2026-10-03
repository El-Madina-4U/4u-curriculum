To show or hide HTML elements using CSS, you can use the display property. There are different values for the display property that you can use:

+ In your CSS stylesheet, you can use `display: none;`. This value hides the element completely, and it won't take up any space on the page.

--- code ---
---
language: css
filename: 
line_numbers: true
---
    
.hide {
    display: none;
}
    
--- /code ---

Then, in your HTML file, you can apply the class to the elements you want to hide.

--- code ---
---
language: html
filename: 
line_numbers: true
---
    
    <div class="hide">This element is hidden.</div>
    
--- /code ---

+ To show an element, you can also create a selector in your CSS stylesheet and use the property `display: block;`.

--- code ---
---
language: css
filename: 
line_numbers: true
---
    
.hide {
    display: none;
}

.show {
    display: block; /* or inline, inline-block, etc. */
}
    
--- /code ---

--- code ---
---
language: html
filename: 
line_numbers: true
---
    
    <div class="hide">This element is initially hidden.</div>
    <div class="show">This element is initially visible.</div>
    
--- /code ---

+ You can also use JavaScript to toggle the visibility of an HTML element. This will make it appear and disappear.

--- code ---
---
language: js
filename: 
line_numbers: true
---
    
var element = document.querySelector(#myElement);

// To hide the element
element.style.display = "none";

// To show the element
element.style.display = "block";
    
--- /code ---
