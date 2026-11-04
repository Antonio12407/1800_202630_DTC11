
// src/review.js
// -------------------------------------------------------------
// Runs on review.html. When the user presses Submit, the quiz counts as
// completed: the streak and last completion date are saved, then the
// user is sent back to the home page.
// -------------------------------------------------------------

import { onAuthReady } from "/src/authentication.js";
import { recordQuizCompletion, checkDailyQuizLimit } from "/src/streak.js";

const submitBtn = document.getElementById("submit-quiz");
const parameters = new URLSearchParams(window.location.search);

let currentUser = null;

// Only logged-in users can complete a quiz (the streak is saved per user),
// and only once per day. checkDailyQuizLimit redirects otherwise.
onAuthReady((user) => {
  currentUser = user;
  checkDailyQuizLimit(user);
});

// Display the answers selected by the user.
const questionBoxes = document.querySelectorAll(".question-box");

questionBoxes.forEach(function (box, index) {
  const questionNumber = index + 1;

  // Get the selected answer from the URL.
  const selectedAnswer = parameters.get(
    "answer" + questionNumber
  );

  const heading = box.querySelector("h2");
  const goBackButton = box.querySelector(".go-back-button");

  // Create an area for the question and selected answer.
  const answerContainer = document.createElement("div");
  const answerText = document.createElement("p");

  if (selectedAnswer) {
    answerText.textContent = selectedAnswer;
  } else {
    answerText.textContent = "Not answered";
  }

  answerText.className = "mb-0 mt-2";

  // Keep the question heading and answer together.
  box.insertBefore(answerContainer, heading);
  answerContainer.appendChild(heading);
  answerContainer.appendChild(answerText);

  // Allow the user to return and change an answer.
  if (goBackButton) {
    goBackButton.removeAttribute("onclick");

    goBackButton.addEventListener("click", function () {
      const reviewParameters = new URLSearchParams(
        window.location.search
      );

      reviewParameters.set(
        "question",
        String(questionNumber)
      );

      reviewParameters.set("review", "true");

      window.location.href =
        "quiz.html?" + reviewParameters.toString();
    });
  }
});

submitBtn?.addEventListener("click", async () => {
  if (!currentUser) return; // auth not ready yet

  // Check that all three questions have been answered.
  for (let i = 1; i <= 3; i++) {
    if (!parameters.get("answer" + i)) {
      alert("Please answer all three questions before submitting.");
      return;
    }
  }

  submitBtn.disabled = true; // prevent double clicks
  try {
    await recordQuizCompletion(currentUser);
    // Pass the selected answers (answer1, answer2, ...) along so the
    // results page can score them and save them to quiz history.
    location.href = "results.html?" + parameters.toString();
  } catch (err) {
    console.error("Could not save quiz completion:", err);
    submitBtn.disabled = false;
    alert("Could not save your progress. Please try again.");
  }
});
