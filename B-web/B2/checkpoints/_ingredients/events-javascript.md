You might want to use **events** to trigger any JavaScript functions you have written. 

Events can be triggered by the user or the browser.

+ User events:
  + Mouse events (click, double click, mouseover)
  + Keyboard events (keypress, keydown, keyup)
  + Touch events (touchstart, touchmove, touchend)

+ Browser events:
  + Page load events (load, unload)
  + Window events (resize, scroll)
  + Time events (setInterval, setTimeout)

The simplest way to do this is by making a button and adding an `onclick` attribute to it. 

In the **Comic character** project, you used a button to trigger a function that displayed a summary of the user's character.

Add a `<button>` element with the event `onclick="displaySummary()"`.

Add the text 'Create' to the `<button>`, so the user knows what the button does.

--- code ---
---
language: html
filename:
line_numbers: false
---

<button onclick="displaySummary()">Create</button>

--- /code ---

**Tip:** Change the function to whatever function you want to use when the user clicks your button. Also, update the text so the user knows what the button will do.

**Using other events**

In **Comic character**, you also used the `DOMContentLoaded` event to trigger code when the page loads.

Use `.addEventListener` like this:

--- code ---
---
language: js
filename: 
line_numbers: false
line_number_start: 
line_highlights: 
---
   
element.addEventListener(eventType, callbackFunction);

--- /code ---

+ element: The HTML element to which you want to attach the event listener
+ eventType: The type of event you want to listen for (e.g. "click", "keydown", "DOMContentLoaded")
+ callbackFunction: The function to be executed when the event happens

--- code ---
---
language: js
filename: scripts.js
line_numbers: true
line_number_start: 65
line_highlights: 69
---

// Check local storage
document.addEventListener("DOMContentLoaded", function () {    
  
  if (localStorage.getItem("lightMode") == "true") {
    document.body.classList.toggle("light-mode");
  }

});
  
--- /code ---
