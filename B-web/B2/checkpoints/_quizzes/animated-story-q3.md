
--- question ---

---
legend: Question 3 of 3
---

How does the intersection observer react when an observed element enters or exits the viewport?

--- choices ---

- ( ) It reacts by changing the viewport width and height.

  --- feedback ---

  The intersection observer does not manipulate the viewport size directly. It handles visibility changes by reacting with one or more actions.
 
  --- /feedback ---

- ( ) It reacts by changing the CSS styles of the observed element.

  --- feedback ---

  Not quite. The intersection observer does not modify CSS styles directly. Instead, it runs a specific action to allow you to handle the visibility changes.

  --- /feedback ---

- (x) It reacts by invoking a callback function.

  --- feedback ---
  
  Correct! The intersection observer notifies changes by invoking a callback function that you write when setting up the observer. This callback is triggered when the observed element enters or exits the viewport.
 
  --- /feedback ---

--- /choices ---

--- /question ---
