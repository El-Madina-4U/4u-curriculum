Comparison operators in JavaScript are used to compare two values and return a Boolean result (either `true` or `false`). These are some commonly used comparison operators:

### Equal (==)
Checks if two values are equal, and it converts the data types to be the same if they are different.

--- code ---
---
language: js
filename: script.js
line_numbers: true
---
    var num1 = 5;
    var num2 = "5";
    console.log(num1 == num2); // Outputs: true
    
--- /code ---

- In this example, num1 and num2 are considered equal because the values are the same after data type conversion.

### Strict equal (===)
Checks if two values are equal without converting them to be the same data type. It also checks if the data types are the same.

--- code ---
---
language: js
filename: script.js
line_numbers: true
---

    var num1 = 5;
    var num2 = "5";
    console.log(num1 === num2); // Outputs: false
    
--- /code ---

- In this example, num1 and num2 are not strictly equal because their data types are different

### Not equal (!=) 
Checks if two values are not equal and converts them to the same data type if they are different.

--- code ---
---
language: js
filename: script.js
line_numbers: true
---

    var num1 = 5;
    var num2 = "5";
    console.log(num1 != num2); // Outputs: false
    
--- /code ---

- In this example, num1 and num2 are equal after the data types are converted. It will return as false.

### Strict not equal (!==) 
Checks if two values are not equal, without converting them to the same data type. It also checks if the data types are different.

--- code ---
---
language: js
filename: script.js
line_numbers: true
---

    var num1 = 5;
    var num2 = "5";
    console.log(num1 !== num2); // Outputs: true
  
--- /code ---

- In this example, num1 and num2 have different data types. So it will return as true.

### Greater than (>) 
Checks if the value on the left is greater than the value on the right.

--- code ---
---
language: js
filename: script.js
line_numbers: true
---

    var num1 = 10;
    var num2 = 5;
    console.log(num1 > num2); // Outputs: true
  
--- /code ---

- In this example, num1 is greater than num2, so it will return as true.

### Less than (<)
Checks if the value on the left is less than the value on the right.

--- code ---
---
language: js
filename: script.js
line_numbers: true
---

    var num1 = 10;
    var num2 = 15;
    console.log(num1 < num2); // Outputs: true
  
--- /code ---

- In this example, num1 is less than num2, so it will return as true.