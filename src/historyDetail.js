// Runs on history-detail.html. Shows one saved quiz and its answers.

import { onAuthReady } from "/src/authentication.js";
import { getQuizHistory } from "/src/quizHistory.js";

const dateEl = document.getElementById("detail-date");
const statusEl = document.getElementById("detail-status");
const listEl = document.getElementById("answer-list");

const parameters = new URLSearchParams(window.location.search);
const quizId = parameters.get("id");

onAuthReady(async function (user) {
  if (!user) {
    location.href = "login.html";
    return;
  }

  try {
    const history = await getQuizHistory(user);
    let quiz = null;

    for (let i = 0; i < history.length; i++) {
      if (history[i].id === quizId) {
        quiz = history[i];
      }
    }

    if (quiz === null) {
      statusEl.textContent = "Quiz not found.";
      return;
    }

    dateEl.textContent = quiz.completedDate;
    statusEl.textContent =
      quiz.score + " / " + quiz.total + " correct (" + quiz.percentage + "%)";

    if (quiz.answers.length === 0) {
      statusEl.textContent += " - Detailed answers were not saved for this quiz.";
    }

    for (let i = 0; i < quiz.answers.length; i++) {
      const answer = quiz.answers[i];

      const item = document.createElement("li");
      const title = document.createElement("strong");
      const yourAnswer = document.createElement("p");

      if (answer.isCorrect) {
        item.className = "answer-card correct";
        title.textContent = "Question " + answer.questionNumber + " - Correct";
      } else {
        item.className = "answer-card incorrect";
        title.textContent = "Question " + answer.questionNumber + " - Incorrect";
      }

      yourAnswer.textContent = "Your answer: " + answer.selectedText;
      item.appendChild(title);
      item.appendChild(yourAnswer);

      if (!answer.isCorrect) {
        const rightAnswer = document.createElement("p");
        rightAnswer.textContent = "Correct answer: " + answer.correctAnswer;
        item.appendChild(rightAnswer);
      }

      listEl.appendChild(item);
    }
  } catch (error) {
    console.error("Could not load quiz:", error);
    statusEl.textContent = "Could not load this quiz. Please try again.";
  }
});