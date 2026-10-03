DOM (document object model) functions are a set of tools used to manipulate the content, style, and structure of web documents dynamically using JavaScript.

Here are some examples you may have used in your projects:

+ `querySelector(selector)`: Returns the first element that matches the specified CSS selector.
    
--- code ---
---
language: js
filename: 
line_numbers:
---
     // Update Copyright Year function 
     const currentYear = new Date().getFullYear();
     document.querySelector("#copyrightYear").innerText = currentYear
    
--- /code ---

In this example, an HTML element uses an attribute `id="copyrightYear"`. The element with this selector is then altered (its innerText property is changed).

+ `querySelectorAll(selector)`: Returns a list of all elements that match the specified CSS selector.

--- code ---
---
language: js
filename: 
line_numbers:
---

// Change Hero function
const heroSlides = document.querySelectorAll('.hero-slide');
var currentHeroIndex = 0;

function changeHero(direction) {

  heroSlides[currentHeroIndex].classList.remove("active");
  currentHeroIndex = currentHeroIndex + direction;

  if (currentHeroIndex < 0){
    currentHeroIndex = 2;
  } else if (currentHeroIndex > 2) {
    currentHeroIndex = 0;
  }

  heroSlides[currentHeroIndex].classList.add("active");

}
  
--- /code ---

In this example, multiple HTML elements contain the same attribute `class="hero-slide"` and a list of these is returned by the function. The list is then used in the code.
