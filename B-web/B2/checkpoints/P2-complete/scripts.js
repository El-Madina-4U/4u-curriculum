// Update Copyright Year function 
const currentDate = new Date();
document.querySelector("#copyrightYear").innerText = currentDate.getFullYear();

// Create constants for superhero form
const characterDetails = document.querySelector("#character-details");
const summary = document.querySelector("#summary-section");

const characterName = document.querySelector("#name-text");
const characterAbility = document.querySelector("#ability-choice");
const characterOrigin = document.querySelector("#origin-text");

// Function to display summary
function displaySummary() {
  const summaryParagraph = document.querySelector("#summary-paragraph");

  summaryParagraph.textContent = `Your superhero name is ${characterName.value}. 
  Their ability is ${characterAbility.value}.
  Their origin story is ${characterOrigin.value}.`;

  characterDetails.style.display = "none";
  summary.style.display = "flex";
}

// Function to edit summary
function changeSummary() {
  characterDetails.style.display = "flex";
  summary.style.display = "none";
}

// Function to check the character details form 
const alertBox = document.querySelector("#alert");

function checkForm(){

  var alertMessage = "";

  if (characterName.value == ""){
    alertMessage = "Please enter a name"; 
  } else if (characterAbility.value == "") {
    alertMessage = "Please choose an ability";
  } else if (characterOrigin.value == "") {
    alertMessage = "Please write the origin story";
  } 
  
  if (alertMessage != ""){
    alertBox.innerText = alertMessage;
    alertBox.style.display = "block";
  } else {
    alertBox.style.display = "none";
    displaySummary();
  }
}

// Create the constant for light mode
const lightModeSwitch = document.querySelector("#lightModeSwitch");

// Light mode function
function changeLightMode(){
  var isLightMode = lightModeSwitch.checked;

  document.body.classList.toggle("light-mode");

  localStorage.setItem("lightMode", isLightMode);
}

// Check local storage 
document.addEventListener("DOMContentLoaded", function () {    

  if (localStorage.getItem("lightMode") == "true") {
    document.body.classList.toggle("light-mode");
    lightModeSwitch.checked = true;
  }

});

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