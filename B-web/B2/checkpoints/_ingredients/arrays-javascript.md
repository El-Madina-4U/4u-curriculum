An **array** is a collection of data in programming. 

Imagine a series of variables all linked together, individual items are called **elements**.

Elements are accessed using an **index**.

The first element in the array is at index 0.

     ___________   ___________   ___________  
    | Element 1 | | Element 2 | | Element 3 |
     ‾‾‾‾‾‾‾‾‾‾‾   ‾‾‾‾‾‾‾‾‾‾    ‾‾‾‾‾‾‾‾‾‾‾
    |  Index 0  | |  Index 1  | |  Index 2  |

You used this in **Comic character** for the Hero slider. 

Square brackets `[]` are used to refer to the position of the element in the list.

--- code ---
---
language: js
filename: scripts.js
---
  
heroSlides[0].classList.remove("active");

--- /code ---