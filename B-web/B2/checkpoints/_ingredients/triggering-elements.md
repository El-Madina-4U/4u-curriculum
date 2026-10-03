The intersection observer is used to detect when an element (e.g. `<img>`, `<p>`, or `<div>`) enters or leaves the user's browser viewport.

It can be used to trigger actions in its callback. These actions can act on the observed element, or a different element on the page.

Here is an example of the use of `IntersectionObserver` to trigger an action when an element with a specific id attribute ('trigger') enters (or leaves) the viewport:

--- code ---
---
language: js
filename:
line_numbers: true
line_number_start: 1
line_highlights: 
---

const triggerObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    // PUT ACTION HERE
  }
});
triggerObserver.observe(document.querySelector("#trigger"));

--- /code ---

On line 1, `entries` is a collection of all elements on the webpage with the `id="trigger"` attribute (as specified in the observer call on line 6). 

A collection of items is called an 'array'.

The `triggerObserver` is set to observe when the first (in this case, the only) item in the `entries` array comes into the viewport (using `isIntersecting` on line 2).

When it does, the observer's callback carries out the actions specified on line 3.

Here is an example of the use of `IntersectionObserver` to trigger an action when **any** element with a specific attribute ('trigger') enters (or leaves) the viewport:

--- code ---
---
language: js
filename:
line_numbers: true
line_number_start: 1
line_highlights: 
---

const triggers = document.querySelectorAll("trigger");
const triggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(
    (entry) => {
      if (entry.isIntersecting) {
        // PUT ACTION HERE
    }
  });
});
triggers.forEach((trigger) => imageObserver.observe(trigger));

--- /code ---
