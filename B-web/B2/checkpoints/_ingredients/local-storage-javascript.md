When your user navigates to another page (or reloads the current one), any changes they have made will be lost.

You can keep the user's choices with the `localStorage` property.

`localStorage` holds data as key-value pairs. A **key** is a 'label' for a value.

### localStorage methods

+ setItem(key, value):
Adds a key-value pair to localStorage.
Example: `localStorage.setItem("username", "raspberry")`

+ getItem(key):
Retrieves the value associated with the specified key.
Example: `var username = localStorage.getItem("username")`

+ removeItem(key):
Removes the key-value pair associated with the specified key.
Example: `localStorage.removeItem("username")`

+ clear():
Removes all key-value pairs from localStorage.
Example: `localStorage.clear()`

### Checking localStorage when a page loads

You can use `.addEventListener` to trigger a function in response to a page load event.

Here is an example from the Comic character project in the More web path:

--- code ---
---
language: js
---

document.addEventListener("DOMContentLoaded", function () {    
  
  if (localStorage.getItem("lightMode") == "true") {
    document.body.classList.toggle("light-mode");
    lightModeSwitch.checked = true;
  }

});
      
--- /code ---

`"DOMContentLoaded"` is an `eventType` that is triggered when the webpage is ready. 

**Tip:** It is better to use `"DOMContentLoaded"` here rather than the `"load"` eventType, which is only triggered when all images are loaded.
