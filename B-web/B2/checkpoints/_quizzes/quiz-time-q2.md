
--- question ---

---
legend: Question 2 of 3
---

Here is some JavaScript you used in your project.


    function checkAnswer(question, result) {

    }

Here is some HTML you used with the JavaScript.

    <button id="q1" onclick="checkAnswer('q1', '#result1')">Check Answer</button>

Which of these is an argument passed to the parameter `question`?

--- choices ---

- ( ) `id="q1"`

  --- feedback ---

  Not quite! The `id` attribute of the button element is used to change it later.

  --- /feedback ---

- (x) `'q1'`

  --- feedback ---

  Correct! When the function runs, it uses the parameter `question` to refer to the first value passed to it as an argument (in this case `q1`). The second argument is `'#result1'`, which is passed to the parameter `result`.

  --- /feedback ---

- ( ) `checkAnswer`

  --- feedback ---
  
  Not quite! `checkAnswer` is the name of the function that handles the button's `onclick` event.

  --- /feedback ---

--- /choices ---

--- /question ---
