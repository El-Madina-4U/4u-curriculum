--- question ---

---
legend: Question 2 of 3
---

You used CSS properties in your project to specify the position of your content using a grid layout.

Look at the CSS styling for the orcas selector. 

Which columns will the orca image span?

--- code ---
---
language: css
filename: style.css
line_numbers: true
line_number_start: 
line_highlights: 
---

.orcas {
  background-image: url('orca-photo.jpg');
  grid-column-start: 1;
  grid-column-end: 3;
}

--- /code ---

--- choices ---

- (x) 1 and 2

  --- feedback ---

  Correct! `grid-column-start` sets which column to start the display of the image (the image will start in the first column) and the value of `grid-column-end` sets which column to end the display of the image (the image will not be displayed in the third column).

  --- /feedback ---
  
- ( ) 2 and 3

  --- feedback ---

  Take another look. `grid-column-start` sets which column to start the display of the image and the value of `grid-column-end` sets the column from which the image will **not** be displayed.
 
  --- /feedback ---

- ( ) 1, 2, and 3

  --- feedback ---

  Almost! The orcas image will start in the first column, but the value of `grid-column-end` sets which column to end the display of the image.

  --- /feedback ---

--- /choices ---

--- /question ---
