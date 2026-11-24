// src/results.js
// -------------------------------------------------------------
// Runs on results.html. Scores the user's selected answers against
// the quiz in Firestore and displays the result.
//
// The selected answers come from the URL (answer1, answer2, ... set by
// quiz.js), or from sessionStorage as a fallback.
//
// Exports `resultsReady`, a promise for the scored result, so
// saveHistory.js can store exactly what was shown (including the
// selected answers) without re-reading the page.
// -------------------------------------------------------------

import { getTodaysQuizId, getQuiz } from "./quizzes.js";

const parameters = new URLSearchParams(window.location.search);

// The answer the user picked for a question, e.g. "B. The address ...", or null.
function getSelectedAnswer(questionNumber) {
    return parameters.get("answer" + questionNumber) ||
        sessionStorage.getItem("question" + questionNumber + "Answer");
}

// Resolves with { quizId, score, total, answers } once the result
// is displayed, or with null if the quiz could not be scored.
async function showResults() {
    const status = document.getElementById("status");

    try {
        // Score the quiz the user actually took (quiz.js puts its id in
        // the URL), falling back to today's quiz.
        const quizId = parameters.get("quiz") || await getTodaysQuizId();
        const quiz = await getQuiz(quizId);

        // One entry per question: what the user picked and whether it was right.
        // Questions are already in display order, so question 1 is index 0.
        const answers = quiz.questions.map((question, index) => {
            const questionNumber = index + 1;
            const userAnswer = getSelectedAnswer(questionNumber);

            if (!userAnswer) {
                throw new Error("Please complete the quiz first.");
            }

            const selected = userAnswer.trim()[0].toUpperCase();
            const correctAnswer = question.answer.toUpperCase();

            return {
                questionNumber: questionNumber,
                question: question.details,
                selected: selected,                // e.g. "B"
                selectedText: userAnswer.trim(),   // e.g. "B. The address ends ..."
                correctAnswer: correctAnswer,
                isCorrect: selected === correctAnswer
            };
        });

        const total = answers.length;
        const score = answers.filter((answer) => answer.isCorrect).length;
        const percentage = Math.round((score / total) * 100);

        // Display the results on the HTML page.
        document.getElementById("score").textContent = score;
        document.getElementById("total").textContent = total;
        document.getElementById("percentage").textContent =
            percentage + "%";

        status.textContent = "";

        return { quizId, score, total, answers };

    } catch (error) {
        console.error("Error loading results:", error);
        status.textContent = "Error: " + error.message;
        return null;
    }
}

export const resultsReady = showResults();
