In JavaScript, the `unobserve` method is used with an intersection observer to stop observing a target element.

You could use `unobserve` to stop triggering an animation, or to avoid memory or performance issues.

Here is an example of how `unobserve` is used in the [Animated story](https://projects.raspberrypi.org/en/projects/animated-story) project in the [More web](https://projects.raspberrypi.org/en/raspberrypi/more-web) path:

--- code ---
---
language: js
filename:
line_numbers: true
line_number_start: 1
line_highlights: 6
---

// Hide bounce observer
const bounceObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    console.log("BOUNCE TRIGGER IN VIEWPORT");
    document.querySelector("#bounce").style.opacity = 0;
    bounceObserver.unobserve(entries[0].target);
  }
});
bounceObserver.observe(document.querySelector("#hideBounce"));

--- /code ---

On line 6 there is a call to `bounceObserver` to `unobserve` the target entry (the element with `id="hideBounce"`). 

This avoids memory or performance issues, because there is no need to keep observing the element once it is hidden.
