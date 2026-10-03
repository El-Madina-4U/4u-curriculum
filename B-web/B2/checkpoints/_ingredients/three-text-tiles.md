![A page with three equal height tiles in the centre. Each tile has centred text.](images/three-tiles.PNG)

The code example creates three tiles of equal height. The text within the tile is centred on the x-axis and y-axis. 

+ `xcenter` places the text in the centre horizontally
+ `ycenter` places the text in the centre vertically
+ `tile` sets a fixed height for the `div` content

--- code ---
---
language: HTML
filename: index.html
line_numbers: true
line_number_start: 
line_highlights: 
---
      <section class="wrap">
        <div class="tertiary xcenter ycenter tile">
          <p>Add text here.</p>
        </div>
        <div class="secondary xcenter ycenter tile">
          <p>Add text here.</p>
        </div>
        <div class="tertiary xcenter ycenter tile">
          <p>Add text here.</p>
        </div>
      </section>
--- /code ---
