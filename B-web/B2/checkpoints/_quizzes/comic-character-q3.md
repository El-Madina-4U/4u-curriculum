--- question ---

---
legend: Question 3 of 3
---

You used a JavaScript function to handle 'out of range' issues with your hero image slider.

How many images is this code designed to handle?

--- code ---
---
language: JavaScript
filename: scripts.js
line_numbers: true
line_number_start: 
line_highlights: 
---

if (currentHeroIndex < 0){
  currentHeroIndex = 3;
} else if (currentHeroIndex > 3) {
  currentHeroIndex = 0;
}

--- /code ---

--- choices ---

- ( ) 0

  --- feedback ---

  Incorrect. `0` is the index number of the first image.

  --- /feedback ---
  
- ( ) 3

  --- feedback ---

  Not quite! `3` is the final index number. Indexing starts at `0`.
 
  --- /feedback ---

- (x) 4

  --- feedback ---

  Correct! `currentHeroIndex` contains four items, starting at index `0` and finishing at index `3`.

  --- /feedback ---

--- /choices ---

--- /question ---
