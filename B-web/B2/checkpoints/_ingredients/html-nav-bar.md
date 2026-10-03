### Add the HTML to show the navbar

The navbar is placed in `<nav>` tags in the webpage header.

Find the `<header>` and `</header>` tags.

Add the `<nav>` tags.

--- code ---
---
language: html
filename: index.html
line_numbers: true
line_number_start: 10
line_highlights: 11, 13
---

    <header>
      <nav>
        
      </nav>
    </header>

--- /code ---

Use a `<div>` to contain the links to the other pages. 

Inside the `<nav>` tags, add a new `<div>`.

--- code ---
---
language: html
filename: index.html
line_numbers: true
line_number_start: 10
line_highlights: 12-14
---

    <header>
      <nav>
        <div>

        </div>
      </nav>
    </header>

--- /code ---

Add `<a>` tags to create links to each page.

--- code ---
---
language: html
filename: index.html
line_numbers: true
line_number_start: 10
line_highlights: 13-15
---

    <header>
      <nav>
        <div>
          <a href="index.html">Home</a>
          <a href="wildlife.html">Wildlife</a>
          <a href="climate.html">Climate</a>
        </div>
      </nav>
    </header>

--- /code ---

Add a `nav-items` class attribute to the `<div>` containing the navbar links. 

--- code ---
---
language: html
filename: index.html
line_numbers: true
line_number_start: 10
line_highlights: 12
---

    <header>
      <nav>
        <div class="nav-items">
          <a href="index.html">Home</a>
          <a href="wildlife.html">Wildlife</a>
          <a href="climate.html">Climate</a>
        </div>
      </nav>
    </header>

--- /code ---

### Style the whole navbar

Open the `style.css` file and a `nav` element selector.

--- code ---
---
language: css
filename: style.css
line_numbers: true
line_number_start: 36
line_highlights:
---
/* Nav bar */
nav {
  padding: 0 15px;
  height: 60px;
  font-size: 22px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #33658A;
}

--- /code ---

Create a selector for the `nav-items` class to space out the links.

--- code ---
---
language: css
filename: style.css
line_numbers: true
line_number_start: 49
line_highlights: 50-53
---
/* Nav items */
.nav-items {
  display: flex;
  gap: 100px;
}

--- /code ---

### Style the links

As well as styling the whole navbar, you can style individual links.

Create another selector to style each `<a>` tag in the `nav-items` div.

--- code ---
---
language: css
filename: style.css
line_numbers: true
line_number_start: 55
line_highlights: 56-60
---
/* Nav bar links */
.nav-items > a {
  color: #55DDE0;
  text-decoration: none;
  transition: .4s ease-in-out;
}

--- /code ---

Add a selector to style each link when you hover over it.

--- code ---
---
language: css
filename: style.css
line_numbers: true
line_number_start: 62
line_highlights: 63-65
---
/* Nav links hover */
.nav-items > a:hover {
  color: white;
}

--- /code ---

### Creating an active link

The index.html page will be loaded first.

When that page is open, the link should stay white and not be clickable.

Add a new `active` CSS class for the link to the page that is currently open.

--- code ---
---
language: css
filename: style.css
line_numbers: true
line_number_start: 67
line_highlights: 68-71
---
/* Nav links active */
.nav-items .active {
  color: white;
  pointer-events: none;
}

--- /code ---

Open `index.html`.

Add the `active` class attribute to the index.html `<a>` tag.

--- code ---
---
language: html
filename: index.html
line_numbers: true
line_number_start: 10
line_highlights: 13
---

    <header>
      <nav>
        <div class="nav-items">
          <a href="index.html" class="active">Home</a>
          <a href="wildlife.html">Wildlife</a>
          <a href="climate.html">Climate</a>
        </div>
      </nav>
    </header>

--- /code ---
