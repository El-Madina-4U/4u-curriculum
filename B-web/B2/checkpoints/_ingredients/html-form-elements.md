Form elements in HTML allow users to input data, interact with the page, and submit information. 

![An example HTML form with form fields annotated to show their use.](images/form-labelled.png)

--- collapse ---

---
title: Types of form elements
---

Here are some useful form elements:
+ `<input>` A single-line text box, checkbox, or button, for example
+ `<select>` A drop-down list
+ `<textarea>` For entering multiple lines of text
+ `<label>` Text to tell the user what information to enter

--- /collapse ---

The `<input>` element can be displayed in many ways using the `type` attribute.

You set the type of input using `type=`.

--- collapse ---

---
title: Examples of input types
---

+ **text:** Single line of text. 

        <input type="text">

**Try it**:
<br><input type="text">

+ **password:** Hides the entered text.

        <input type="password">

**Try it**:
<br><input type="password">

+ **checkbox:** Tick one or more options.

        <input type="checkbox"> <label>Breakfast</label>
        <input type="checkbox"> <label>Lunch</label>

**Try it**:
<br><input type="checkbox"><label>Breakfast</label>
<br><input type="checkbox"><label>Lunch</label>

+ **radio:** Select one option from a group.
  
        <input type="radio" name="meal"> <label>Breakfast</label>
        <input type="radio" name="meal"> <label>Lunch</label>

**Try it**:
<br><input type="radio" name="meal"><label>Breakfast</label>
<br><input type="radio" name="meal"><label>Lunch</label>
<br>**Tip:** The radio buttons must have the same `name` attribute so that selecting a radio button deselects any other selected radio button. 

+ **number** Numeric data with arrows to increase/decrease the value. 

        <input type="number">
        
**Try it**:
<br><input type="number">

--- /collapse ---


You can add attributes to an `<input>` element to help the user and control what can be entered.

--- collapse ---

---
title: Examples of input attributes
---

+ placeholder: Provides a hint of what the user should enter. It is replaced when the user enters a value.
Example: `<input type="text" placeholder="Enter your name">`
<br><input type="text" placeholder="Enter your name">

+ value: Sets the default data entered in the input field. For example, in a form where the user is asked for their dietary requirements, you could set the default value of that field to "None".
Example: `<input type="text" name="Dietary requirements" value="None">`
<br><input type="text" name="Dietary requirements" value="None">

+ required: Checks the input field is filled out before allowing the form to be submitted.
Example: `<input type="text" required>`

+ maxlength: Sets the maximum number of characters allowed in a text or password input.
Example: `<input type="text" maxlength="3">`
<br><input type="text" maxlength="3">

+ min and max: Sets the minimum and maximum values for number or date inputs.
Example: `<input type="number" min="0" max="100">`

--- /collapse ---
