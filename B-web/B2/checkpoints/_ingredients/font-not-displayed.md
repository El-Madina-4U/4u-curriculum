When you want to use a new Google Font, you need to make sure you have:

+ Added the `<link>` from Google Fonts to the `<head>` section of your webpage
+ Updated the font variables in `default.css` or the style sheet that you are using for your colour and font palette 

This example adds the 'Bangers' font and uses it for headers and titles, but not for the body:

--- code ---
---
language: HTML
filename: index.html
line_numbers: false
---

<!-- Import fonts from Google -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bangers&display=swap" rel="stylesheet">

--- /code ---

--- code ---
---
language: CSS
filename: default.css
line_numbers: false
---

--body-font: 1.1rem Verdana, sans-serif;
--header-font: lighter 3rem 'Bangers', cursive;
--title-font: lighter 2rem 'Bangers', cursive;

--- /code ---
