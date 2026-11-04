// src/results.js
// -------------------------------------------------------------
// Runs on results.html. Scores the user's selected answers against
// the quiz in Firestore and displays the result.
//
// The selected answers come from the URL (answer1, answer2, ... set by
// quiz.js / review.js), or from sessionStorage as a fallback.
//
// Exports `resultsReady`, a promise for the scored result, so
// saveHistory.js can store exactly what was shown (including the
// selected answers) without re-reading the page.
// -------------------------------------------------------------

import { db } from "./firebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";

// The answer the user picked for a question, e.g. "B. Option 2", or null.
function getSelectedAnswer(questionNumber) {
    const parameters = new URLSearchParams(window.location.search);

    return parameters.get("answer" + questionNumber) ||
        sessionStorage.getItem("question" + questionNumber + "Answer");
}

// Resolves with { quizId, score, total, answers } once the result
// is displayed, or with null if the quiz could not be scored.
async function showResults() {
    const status = document.getElementById("status");

    try {
        // Retrieve the quiz from Firestore.
        const quizSnapshot = await getDocs(
            collection(db, "Quizzes")
        );

        // Our current test database contains one quiz.
        if (quizSnapshot.size !== 1) {
            throw new Error("Expected one quiz in the database.");
        }

        const quizId = quizSnapshot.docs[0].id;

        // Retrieve the questions belonging to the quiz.
        const questionsSnapshot = await getDocs(
            collection(db, "Quizzes", quizId, "question")
        );

        if (questionsSnapshot.empty) {
            throw new Error("No questions found.");
        }

        // One entry per question: what the user picked and whether it was right.
        const answers = [];

        questionsSnapshot.forEach((question) => {
            const data = question.data();

            // Temporary matching using sample question numbers.
            const match = data.details.match(/^Sample question (\d+)$/);
            if (!match) {
                throw new Error("Invalid sample question number.");
            }

            const questionNumber = Number(match[1]);
            const userAnswer = getSelectedAnswer(questionNumber);

            if (!userAnswer) {
                throw new Error("Please complete the quiz first.");
            }

            const selected = userAnswer.trim()[0].toUpperCase();
            const correctAnswer = data.answer.toUpperCase();

            answers.push({
                questionNumber: questionNumber,
                question: data.details,
                selected: selected,                // e.g. "B"
                selectedText: userAnswer.trim(),   // e.g. "B. Option 2"
                correctAnswer: correctAnswer,
                isCorrect: selected === correctAnswer
            });
        });

        // Keep the answers in question order.
        answers.sort((a, b) => a.questionNumber - b.questionNumber);

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
