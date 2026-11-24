import { onAuthReady } from "/src/authentication.js";
import { getQuizHistoryEntry } from "/src/quizHistory.js";
import { getQuiz } from "/src/quizzes.js";

const dateEl = document.getElementById("detail-date");
const statusEl = document.getElementById("detail-status");
const listEl = document.getElementById("answer-list");

const quizId = new URLSearchParams(window.location.search).get("id");

onAuthReady(async function (user) {
  if (!user) {
    location.href = "login.html";
    return;
  }

  try {
    const quiz = await getQuizHistoryEntry(user, quizId);

    if (quiz === null) {
      statusEl.textContent = "Quiz not found.";
      return;
    }

    // "2026-11-24" -> "November 24, 2026" (same format as the home page)
    const [year, month, day] = quiz.completedDate.split("-").map(Number);
    dateEl.textContent = new Date(year, month - 1, day).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
    statusEl.textContent =
      quiz.score + " / " + quiz.total + " correct (" + quiz.percentage + "%)";

    if (quiz.answers.length === 0) {
      statusEl.textContent += " - Detailed answers were not saved for this quiz.";
    }

    let questions = [];
    try {
      questions = (await getQuiz(quiz.quizId)).questions;
    } catch (error) {
      console.error("Could not load the original quiz:", error);
    }

    for (let i = 0; i < quiz.answers.length; i++) {
      const answer = quiz.answers[i];

      const item = document.createElement("li");
      const title = document.createElement("strong");
      const questionText = document.createElement("p");
      const yourAnswer = document.createElement("p");

      if (answer.isCorrect) {
        item.className = "answer-card correct";
        title.textContent = "Question " + answer.questionNumber + " - Correct";
      } else {
        item.className = "answer-card incorrect";
        title.textContent = "Question " + answer.questionNumber + " - Incorrect";
      }

      questionText.textContent = answer.question;
      yourAnswer.textContent = "Your answer: " + answer.selectedText;

      item.appendChild(title);
      item.appendChild(questionText);
      item.appendChild(yourAnswer);

      if (!answer.isCorrect) {
        const original = questions[answer.questionNumber - 1];
        let correctText = answer.correctAnswer;

        if (original && original.M_C && original.M_C[answer.correctAnswer]) {
          correctText = answer.correctAnswer + ". " + original.M_C[answer.correctAnswer];
        }

        const rightAnswer = document.createElement("p");
        rightAnswer.textContent = "Correct answer: " + correctText;
        item.appendChild(rightAnswer);
      }

      listEl.appendChild(item);
    }
  } catch (error) {
    console.error("Could not load quiz:", error);
    statusEl.textContent = "Could not load this quiz. Please try again.";
  }
});