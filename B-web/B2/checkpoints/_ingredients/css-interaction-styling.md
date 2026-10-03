When writing CSS, you might want to change the styling of an element when the user interacts with it. 

In the example below, the styling of the `a` elements is changed, but only when a user **hovers** over them with their mouse. The syntax for this is `a:hover`. 

The style in this selector will **only** be used when a user's mouse is on top of the element.

--- code ---
---
language: css
filename: style.css
---

.nav-items > a:hover {
  color: white;
}

--- /code ---
