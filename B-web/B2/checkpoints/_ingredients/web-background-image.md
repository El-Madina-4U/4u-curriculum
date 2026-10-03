You can add a background image to appear behind other elements on your webpage. 

![A colourful electronic circuit background behind the main content on a webpage.](images/background-image.png)

Find this style declaration in `style.css`:

--- code ---
---
language: CSS
filename: style.css
line_numbers: false
---

/* add a background image to body */

body {
  /*background-image: url('name.jpg');*/ /* Uncomment and change filename to add a background image */
  /*background-repeat: repeat;*/ /* Make the image repeat */
  /*background-size: cover;*/ /* Make the image cover the whole container */
}

--- /code ---

Remove the `/*` and `*/` comment markers and replace `name.jpg` with the name of your background image. 

--- code ---
---
language: CSS
filename: style.css
line_numbers: false
---

/* add a background image to body */

body {
  background-image: url('mybackground.png'); /* Uncomment and change filename to add a background image */
  /*background-repeat: repeat;*/ /* Make the image repeat */
  /*background-size: cover;*/ /* Make the image cover the whole container */
}

--- /code ---

You could also try uncommenting the other properties.

**Tip:** You don't need to update the HTML because this style applies directly to the `<body>` tag. You could create a class to apply a background image to specific elements. 


