To link JavaScript files to an HTML document, you add a `<script>` element with an `src` attribute set to the name of the JavaScript file.

You should place the `<script>` element just before the closing `</body>` tag, as you may need all the HTML content on the page to load before running the JavaScript functions.

--- code ---
---
language: html
filename: 
line_numbers: true
---

  <body>
    <!-- HTML content -->
    
    <script src="scripts.js"></script>
  </body>

--- /code ---
