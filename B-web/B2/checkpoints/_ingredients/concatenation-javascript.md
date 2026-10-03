You can combine text (strings) and variables in JavaScript.

A "string" is a data type in JavaScript and other programming languages. Data types are groups of data that tell the program how we want to use data.

You can format strings using concatenation or template literals.

### Concatenation
 
You can combine strings together using the `+` operator.

--- code ---
---
language: js
filename: 
line_numbers: true
---
    
const superhero = "Iron Man";
const power = "suit of armor";
// Example using concatenation
const description = "The superhero " + superhero + " possesses a " + power + ".";
console.log(description);
    
--- /code ---

### Template literals

You can use include the contents of variables in a string by using backticks ``` ` ``` to embed variables within these symbols: `${}`.

Here is an example.

--- code ---
---
language: js
filename: 
line_numbers: true
---
    
const name = "Spider-Man";
const age = 25;
// Example using template literals
const message = `Hello, ${name}! You are ${age} years old.`;
console.log(message);
    
--- /code ---
