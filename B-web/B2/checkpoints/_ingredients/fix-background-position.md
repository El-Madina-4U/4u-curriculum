You can fix an element's background image so other content scrolls in front of it.

This is achieved in CSS by adding the `background-attachment: fixed` property to the element's selector.

Here is an example:

--- code ---
---
language: css
filename:
line_numbers: true
line_number_start: 1
line_highlights: 4
---

.garden {
  background-image: url("garden.jpeg");
  background-size: cover;
  background-attachment: fixed;
}

--- /code ---

![A gif showing a fixed background image as other content scrolls in front of it.](images/background-attachment-fixed.gif)
