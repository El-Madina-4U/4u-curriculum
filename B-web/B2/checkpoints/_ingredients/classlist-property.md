The `classList` property in JavaScript is used to add, remove, toggle, and check the presence of CSS classes on an element. 

--- code ---
---
language: js
filename: script.js
line_numbers: false
line_highlights: 5
---
   
// Light mode function 
function changeLightMode(){
  var isLightMode = lightModeSwitch.checked;
  document.body.classList.toggle("light-mode");
}

--- /code ---

These are some of the methods that can be used with the `classList` property.

+ Access classList:
`element.classList` returns a list of the class attributes of the element.

+ Add a class:
`classList.add("className")` adds the specified class to the element. If the class already exists, it is ignored.

+ Remove a class:
`classList.remove("className")` removes the specified class from the element.

+ Toggle a class:
`classList.toggle("className")` toggles the presence of the specified class. If the class is present, it is removed; otherwise, it is added.

+ Check if a class exists:
`classList.contains("className")` returns a Boolean (true/false) showing whether the specified class is present on the element.

+ Replace classes:
`classList.replace("oldClass", "newClass")` replaces the specified old class with a new one.
