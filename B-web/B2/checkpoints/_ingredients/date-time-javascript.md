JavaScript has a `Date()` function that returns the current date and time, using the browser's time zone.

For example:

`Mon Feb 19 2024 16:15:20 GMT+0000 (Greenwich Mean Time)`

A call to `Date()` returns a string.

Here is the result of the call to `Date()` when this page was loaded:

<iframe src="https://editor.raspberrypi.org/en/embed/viewer/comic-character-date" width="100%" height="100" frameborder="0" marginwidth="0" marginheight="0" allowfullscreen> </iframe>



### Creating a Date object 

This example creates a new Date object, representing the current date and time. It is held in the constant `currentDate`.

--- code ---
---
language: js
filename: 
line_numbers: false
---
     
    // Update Copyright Year function 
    const currentDate = new Date();
    
--- /code ---

### Get date components

These functions retrieve specific components of the date and time:

--- code ---
---
language: js
filename: 
line_numbers: 
line_number_start: 
line_highlights: 
---

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed (0 = January, 11 = December)
    const day = currentDate.getDate();
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const seconds = currentDate.getSeconds();
    const milliseconds = currentDate.getMilliseconds();

--- /code ---
