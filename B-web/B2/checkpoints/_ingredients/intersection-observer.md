The `IntersectionObserver` is used to detect when an element (e.g. `<img>`, `<p>`, or `<div>`) enters or leaves the user's browser viewport.

It is commonly used to 'lazy load' images and trigger animations.

The observer has three main parts:

**Target elements:** You specify which elements you want the observer to observe. These are the elements you're interested in knowing whether they have entered of exited the viewport.

**Callback:** The callback is a function that is triggered when the observed element enters or exits the viewport. The function could output a messange to the Console, or change an HTML element, for example.

**Options:** You can also provide some options to the intersection observer, like setting a threshold. The threshold is the amount of the observed element that needs to be visible to trigger the callback. For example, you could use a threshold of 0.5 to be notified when an element is 50% visible, or a threshold of 1 to be notified when an element is fully visible.

Here is an example of the use of `IntersectionObserver` from the [Animated story](https://projects.raspberrypi.org/en/projects/animated-story) project in the [More web](https://projects.raspberrypi.org/en/raspberrypi/more-web) path:

--- code ---
---
language: js
filename:
line_numbers: true
line_number_start: 1
line_highlights: 
---

const bounceObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    console.log("BOUNCE TRIGGER IN VIEWPORT");
  }
});
bounceObserver.observe(document.querySelector("#hideBounce"));

--- /code ---

On line 1, `entries` is a collection of all elements on the webpage with the `id="hideBounce"` attribute. These are the target elements, as specified in the observer call on line 6.

A collection of items is called an 'array'.

The `bounceObserver` is set to observe when the first (in this case, the only) item in the `entries` array comes into the viewport (using `isIntersecting` on line 2).

When it does, the observer 'callback' outputs a message to the Console (line 3).
