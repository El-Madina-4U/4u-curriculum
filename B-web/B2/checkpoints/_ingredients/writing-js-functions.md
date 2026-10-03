A function is a reusable block of code that performs a specific task.

Functions break your code into particular tasks so it is easier to understand. 

They are especially useful when you have tasks that need to be done multiple times. They're like tools you can use over and over in different parts of your code.

### Writing a function:

+ Start with the `function` keyword to indicate the creation of a function. 
+ Give your function a name (e.g. `addNumbers`).
+ Include brackets `()` after the function name. These can contain the parameters (inputs) your function needs.
+ Use open curly braces `{` to define the block of code that the function will execute.
+ Close the curly braces `}` to show the end of the function.

Here is an example:

--- code ---
---
language: js
filename:
line_numbers:
line_number_start:
line_highlights:
---

function addNumbers(a, b) {
  return a + b;
}
    
--- /code ---

Here, `addNumbers` is a function that takes two inputs `a` and `b` and returns their sum.

### Using a function:

You use a function by **calling** it.

Here, the function `addNumbers()` is called with values 5 and 8. 

It returns the sum of the numbers, which you can then use. In this example, the sum of 5 and 8 is assigned to the variable `result` and then `result` is displayed in the console.

--- code ---
---
language: js
filename:
line_numbers: 
line_number_start:
line_highlights:
---

let result = addNumbers(5, 8);
console.log(result); // Outputs: 13
    
--- /code ---
