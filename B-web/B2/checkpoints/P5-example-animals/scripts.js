// Variables
var score = 0;
var currentQ = 0;

// Constants
const scoreText = document.querySelector("#scoreText");
const questions = document.querySelectorAll(".q-container");
const fullMarks = document.querySelector(".fullMarks");
const retry = document.querySelector(".retry");

// Check answer function
function checkAnswer(question, result) {
  let answer = document.querySelector(`input[name="${question}"]:checked`);
  let qResult = document.querySelector(result);
  
  qResult.style.display = "block";

  if (answer) {
    document.querySelector("#" + question).disabled = true;
    if (answer.value === "correct") {
      qResult.innerText = "Correct";
      score+=1;
      scoreText.innerText = `Score: ${score}`;
      nextQ();
    } else {
      qResult.innerText = "Incorrect";
      nextQ();
    }
  } else {
    qResult.innerText = "Please select an answer";
  }
}

// Next question function
function nextQ() {
  questions[currentQ].classList.add("fade-out");
  setTimeout(() => {
    if (currentQ < questions.length - 1) {
      questions[currentQ].style.display = "none";
      currentQ++;
      questions[currentQ].classList.add("slide-left");
      questions[currentQ].style.display = "block";
    } else {
      scoreText.innerText = `Final score: ${score}/${questions.length}`;
      scoreText.classList.add("glowing");
      if (score === questions.length) {
        fullMarks.style.display = "block";
      } else {
        retry.style.display = "block";
      }
    }
  }, "2000");
}

// Display first question
questions[0].style.display = "block";
questions[0].style.opacity = 1;