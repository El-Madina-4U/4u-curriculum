## Reflection

Well done, you have learned a lot! Now it's time to reflect - reflecting is an important part of learning because it helps make new connections in your brain.

Answer the three questions below to reflect on what you've learned.

After each question, press submit. You will be guided towards the correct answer. You can do this activity as many times as you want to.

Have fun!

--- question ---

---
legend: Question 1 of 3
---

When creating new variables to store colours and fonts, your CSS might look like this...

--- code ---
---
language: css
filename: default.css
line_numbers: false
---

:root {
  /* Font variable */
  --main-font: 'sans-serif';
  
  /* Base Colours */
  --body-background: #FFFFFF;
  --body-text-colour: #000000;
  --nav-bar: #FFFFFF;
}

--- /code ---

Which of these would allow you to **use** the `--body-background` variable in another CSS selector?

--- choices ---

- ( ) `background-color: --body-background;` ()

  --- feedback ---

  You need to tell CSS that you are using a variable.

  --- /feedback ---

- (x) `background-color: var(--body-background);`

  --- feedback ---

  Correct!

  --- /feedback ---

- ( ) `background-color: root(--body-background);` 

  --- feedback ---

  The `:root` selector is used to create variables for your whole webpage, but when you use them you need to use another keyword.

  --- /feedback ---

--- /choices ---

--- /question ---
