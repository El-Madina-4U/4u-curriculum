`position: sticky` is often used for navigation bars or elements that you want to remain visible as the user scrolls down the page but return to their normal position when scrolling back up.

When an element is set to `position: sticky`, it initially behaves like `position: relative`. 

This means the element will appear in the normal position in the document. 

When the specified scroll point is reached, the element then switches to a fixed position (as if set to `position: fixed`) and does not scroll with the rest of the content.

Here's an example:

--- code ---
---
language: css
filename:
line_numbers: true
line_number_start: 1
line_highlights: 
---

.sticky-element {
  position: sticky;
  top: 50px;
}

--- /code ---

Line 2 sets the position property to `sticky` for any element with the attribute `class="sticky-element"`.

Line 3 sets the distance from the top of the viewport where the element becomes 'sticky' (its position becomes fixed).