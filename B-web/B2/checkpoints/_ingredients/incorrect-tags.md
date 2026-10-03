Carefully check the spelling of your HTML tags, attributes, and classes. 

Incorrect tags can mean that the tag text gets displayed on your webpage instead of controlling the layout.

This example incorrectly uses 'image' instead of 'img'! `<img>` is the correct HTML tag. 

--- code ---
---
language: HTML
filename: index.html
line_numbers: false
---

    <image class="bordered-box" src="happy.png" alt="An outline of an anime style girl with a happy facial expression."/>

--- /code ---

It is also incorrect to have spaces in tags, so the example below is incorrect. 

--- code ---
---
language: HTML
filename: index.html
line_numbers: false
---

< h1>Lorem ipsum</h1>

--- /code ---
