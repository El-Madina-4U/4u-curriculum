// Dropdown functions
const dropdown = document.getElementById("dropdown-options");

function openDropdown() {
  console.log("clicked");
  if (dropdown.classList.contains("open")) {
    dropdown.classList.remove("open");
  } else {
    dropdown.classList.add("open");
  }
}

// Constants
const body = document.querySelector("body");
const instruction = document.querySelector("#instruction");
const content = document.querySelector("#content-holder");
const title = document.querySelector("#title");
const slot1 = document.querySelector("#slot-1");
const slot2 = document.querySelector("#slot-2");
const slot3 = document.querySelector("#slot-3");

// Clear 
function clear(){
  body.classList = '';
  
  title.innerHTML = "";
  
  slot1.classList = 'content';
  slot1.innerHTML = "";
  
  slot2.classList = 'content';
  slot2.innerHTML = "";
  
  slot3.classList = 'content';
  slot3.innerHTML = "";
  
  dropdown.classList.remove("open");
}

// Option 1
function option1() {
  clear();

  instruction.style.display = 'none';
  content.style.display = "grid";

  body.classList.add("trex");

  title.innerHTML = "T-Rex <br> &#129430";

  slot1.classList.add("trex");
  slot1.innerHTML =
    "<h1>Anatomy and Characteristics</h1> \n \
      <p>One of the largest meat-eating dinosaurs</p> \n \
      <p>Powerful hind limbs</p> \n \
      <p>Massive skull with sharp teeth</p> \n \
      <p>Tiny, two-fingered forelimbs</p>";

  slot2.classList.add("trex");
  slot2.innerHTML =
    "<h1>Trivia</h1> \n \
      <p>T-Rex had an huge bite force, capable of crushing bone</p> \n \
      <p>T-Rex was a fast runner</p> \n \
      <p>The name Tyrannosaurus Rex means tyrant lizard king in Greek</p>";

  slot3.classList.add("trex");
  slot3.innerHTML =
    "<h1>Activity</h1> \n \
      <ol>\n \
      <li>Get into teams and line up at a start line</li> \n \
      <li>Put one toy for each team member at the other end of the room</li> \n \
      <li>One person from each team races to 'bite' a toy and bring it back to the team</li> \n \
      <li>The first team to return all their toys wins!</li> </ol>";
  
  localStorage.setItem("choice", "trex");
}

// Option 2
function option2() {
  clear();

  instruction.style.display = 'none';
  content.style.display = "grid";

  body.classList.add("triceratops");

  title.innerHTML = "Triceratops";

  slot1.classList.add("triceratops");
  slot1.innerHTML =
    "<h1>Anatomy and Characteristics</h1> \n \
      <p>A herbivorous dinosaur</p> \n \
      <p>Known for its distinctive frill and three facial horns</p> \n \
      <p>It had a bulky body, a beak-like mouth, and a large bony plate projecting from the back of its skull</p> \n \
      <p>Triceratops likely lived in herds and used its horns for defense</p>";

  slot2.classList.add("triceratops");
  slot2.innerHTML =
    "<h1>Trivia</h1> \n \
      <p>Triceratops was a bit of a show off, its frill may have been used for display</p>\n \
      <p>Triceratops roamed North America during the Late Cretaceous period</p>\n \
      <p>Triceratops means three-horned face in Greek</p>";

  slot3.classList.add("triceratops");
  slot3.innerHTML =
    "<h1>Activity</h1> \n \
      <ol>\n \
        <li>Create some Triceratops horns using paper or cardboard</li>\n \
        <li>Attach them to headbands or make them handheld</li>\n \
        <li>Place the horns at varying distances on the ground</li>\n \
        <li>Use hula hoops or create rings from cardboard</li>\n \
        <li>Take turns tossing the rings onto the Triceratops horns, earning 10 points!</li>\n \
        <li>The person with the most points after all turns wins!</li> </ol>";

  localStorage.setItem("choice", "triceratops");
}

// Option 3
function option3() {
  clear();

  instruction.style.display = 'none';
  content.style.display = "grid";

  body.classList.add("stegosaurus");

  title.innerHTML = "Stegosaurus";

  slot1.classList.add("stegosaurus");
  slot1.innerHTML =
    "<h1>Anatomy and Characteristics</h1> \n \
      <p>Stegosaurus was a plant eater (a herbivor)</p> \n \
      <p>It had a double row of large bony plates along its back</p> \n \
      <p>It had spikes on its tail</p> \n \
      <p>It a small head, with a small brain compared to its body size</p>";

  slot2.classList.add("stegosaurus");
  slot2.innerHTML =
    "<h1>Trivia</h1> \n \
      <p>Stegosaurus had a second brain in its hips, assisting in coordinating movement and balance</p>\n \
      <p>Stegosaurus lived during the Late Jurassic period</p> \n \
      <p>Stegosaurus means armoured roof lizard in Greek</p> \n \
      <p>The stop-motion puppet used in the 1933 film King Kong was based on a 1897 illustration of Stegosaurus</p>";

  slot3.classList.add("stegosaurus");
  slot3.innerHTML =
    "<h1>Activity</h1> \n \
      <ol><li>Decorate some paper plates to make Stegosaurus's bony plates</li>\n \
      <li>Once the plates are dry, have a 'Stegosaurus Parade' to showcase your plates</li>\n \
      <li>Share the designs and celebrate the creativity!</li></ol>";

  localStorage.setItem("choice", "stegosaurus");
}

// Observers
const slot1observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      slot1.classList.add("fade-in");
    }
  },
  { threshold: 1 }
);
slot1observer.observe(slot1);

const slot2observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      slot2.classList.add("grow-in");
    }
  },
  { threshold: 1 }
);
slot2observer.observe(slot2);

const slot3observer = new IntersectionObserver(
  (entries) => {
    if (entries[0].isIntersecting) {
      slot3.classList.add("rise-in");
    }
  },
  { threshold: 1 }
);
slot3observer.observe(slot3);

// Loaded function
document.addEventListener("DOMContentLoaded", function () {
  const choice = localStorage.getItem("choice");

  if (choice == "trex"){
    option1();
  } else if (choice == "triceratops"){
    option2();
  } else if (choice == "stegosaurus"){
    option3();
  }
});

// Reset
function reset(){
  clear();
  content.style.display = "";
  instruction.style.display = 'flex';
  localStorage.setItem("choice", "");
}