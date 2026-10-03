The intersection observer is used to detect when an element (e.g. `<img>`, `<p>`, or `<div>`) enters or leaves the user's browser viewport.

You can also add options to the observer, like setting a threshold.

Threshold values range from `0` to `1`. 

`1` means that every single pixel of the element has to be in the viewport for the callback to run. 

`0` is the default value and means that just one pixel must be intersecting for the callback to run.

Here is an example of how the `threshold` option is used in an intersection observer in the [Animated story](https://projects.raspberrypi.org/en/projects/animated-story) project (part of the [More web](https://projects.raspberrypi.org/en/raspberrypi/more-web) path).

The option `threshold: 1` in this example means the callback only triggers when all of the snail image is in the viewport.

--- code ---
---
language: js
filename: 
line_numbers: true
line_number_start: 1
line_highlights: 6
---

const snailObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    entries[0].target.classList.add("startCrawl");
  }
},
{ threshold: 1 }
);
snailObserver.observe(document.querySelector("#snail"));

--- /code ---
