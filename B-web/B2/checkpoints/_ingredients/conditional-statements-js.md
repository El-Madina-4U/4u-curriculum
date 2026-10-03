In JavaScript, conditional statements are used to make decisions in your code based on conditions. Conditions are checked to see if they are true and code is executed based on the result of the checks.

There are three types of conditional statements in JavaScript: 
`if`, `else if`, `else`.

### if

`if` is used to execute a block of code **if** a specified condition is met (true).
    
--- code ---
---
language: js
filename: 
line_numbers: true
---
if (condition) {
  // Code to be executed if the condition is true
}
    
--- /code ---

### else if

`else if` is used to check multiple conditions. It runs different blocks of code based on the results of the checks. 
 
When an `else if` condition is met, no checks are made on subsequent `else if` (or `else`) blocks.

--- code ---
---
language: js
filename: 
line_numbers: true
---

if (condition1) {
  // Code to be executed if condition1 is true
} else if (condition2) {
  // Code to be executed if condition2 is true
}
    
--- /code ---

### else

`else` sets an alternative block of code that is executed if the previous (`if` and/or `else if`) conditions are not met (false).
    
--- code ---
---
language: js
filename: 
line_numbers: true
---

if (condition1) {
  // Code to be executed if condition1 is true
} else if (condition2) {
  // Code to be executed if condition2 is true
} else {
  // Code to be executed if none of the conditions are true
}
    
--- /code ---

### How to write a conditional statement
  + Use the keyword `if` to start the conditional statement
  + Place the condition that you want to check inside brackets `()`
  + Add code inside the curly braces `{}` that will execute if the condition is true 

--- code ---
---
language: js
filename: 
line_numbers: true
---

var age = 18;

if (age >= 18) {
  console.log("You are an adult.");
}

--- /code ---


