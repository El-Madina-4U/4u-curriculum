// Language quiz
var score = 0;
var currentQ = 0;
const questions = document.querySelectorAll(".q-container");
const alert = document.querySelector("#alert");

function nextQ(question){
  // Update score
  let answer = document.querySelector(`input[name="${question}"]:checked`);
  if (answer){
    //Hide Alert
    alert.innerHTML = "";
    alert.style.display = "none";

    //Increase score
    score += parseInt(answer.value);
  
    // Change question
    questions[currentQ].classList.remove("slide-left");
    questions[currentQ].classList.add("fade-out");
    currentQ++;
    if (currentQ == questions.length - 1){
      console.log("Called")
      quizResult();
    }
    setTimeout(() => {
      questions[currentQ - 1].style.display = "none";
      questions[currentQ].classList.add("slide-left");
      questions[currentQ].style.display = "block";
    }, "2000");
  } else {
    alert.style.display = "block";
    alert.innerHTML = "<p>Please pick an option!</p>"
  }
  
}

questions[0].style.display = "block";
questions[0].style.opacity = 1;

function quizResult(){
  if (score <= 6){
    scratch();
  } else if (score <= 12){
    python();
  } else {
    unity();
  }
}

// Languages
const languageHeading = document.querySelector("#languagetitle");
const languageText = document.querySelector("#languagetext");
const project1 = document.querySelector("#project1");
const project2 = document.querySelector("#project2");

function scratch(){
  languageHeading.innerText = "Scratch";

  languageText.innerText = "Scratch is a block based coding environment \n \
    It is perfect for beginners but also those who want to get more confident with coding. \n \
    Here are some projects you might like!";

  project1.innerText = "projects.raspberrypi.org/en/projects/alien-language";
  project2.innerText = "projects.raspberrypi.org/en/projects/beat-the-goalie";
  
}

function python(){
  languageHeading.innerText = "Python";

  languageText.innerText = "Python is a text-based programming language. \n \
    It uses commands in plain English, which makes it simpler to understand. \n \
    Here are some projects you might like!";

  project1.innerText = "projects.raspberrypi.org/en/projects/hello-world";
  project2.innerText = "projects.raspberrypi.org/en/projects/colourful-creations";
  
}

function unity(){
  languageHeading.innerText = "C#";

  languageText.innerText = "C# is a more advanced text based programming language. \n \
    There are loads of awesome things you can do with it. Like creating games with the Unity engine! \n \
    Here are some projects you might like!";

  project1.innerText = "projects.raspberrypi.org/en/projects/explore-a-3d-world";
  project2.innerText = "projects.raspberrypi.org/en/projects/star-collector";
}