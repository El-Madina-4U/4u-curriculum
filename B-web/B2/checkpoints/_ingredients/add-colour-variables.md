You can create additional variables in `default.css` to store more colours.

**Tip:** You might want to add a new background colour **and** a new text colour to use with it.

--- code ---
---
language: html
filename: default.css
line_numbers: true
line_number_start: 4
line_highlights: 15-16
---

:root {
  --primary: #08586B;
  --onprimary:#4f4e4e;
  --secondary: #E0DB54;
  --onsecondary:#ffffff;
  --tertiary:#AF5C08;
  --ontertiary: #ffffff;
  --page:#ffffff;
  --onpage:#000000;
  --detail: #AB7C1C;
  --detail2: #38640D;
  --highlight: #DC9110;
  --onhighlight: #443C35;
}

--- /code ---

You can create a class in `style.css` that uses your new colours. 

--- code ---
---
language: html
filename: style.css
line_numbers: true
line_number_start: 8
line_highlights: 18-21
---

.secondary {
  background: var(--secondary);
  color: var(--onsecondary);
}

.tertiary {
  background: var(--tertiary);
  color: var(--ontertiary);
}

.highlight {
  background: var(--highlight);
  color: var(--onhighlight);
}

--- /code ---

Your new class can then be used in your `index.html` file at any time so that an element can use your new colour pairing. 

--- code ---
---
language: html
filename: index.html
line_numbers: false
---

<section class="highlight">

--- /code ---
