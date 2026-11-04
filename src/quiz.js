
import { db } from "./firebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";
import { onAuthReady } from "./authentication.js";
import { checkDailyQuizLimit } from "./streak.js";

// One quiz per day: redirects if today's quiz is already done
// (or to login if signed out). Uses the saved Firestore date.
onAuthReady(checkDailyQuizLimit);

async function loadQuiz() {
    const answerButtons = document.querySelectorAll(".answer-button");

    try {
        // Retrieve the quizzes from Firestore.
        const quizSnapshot = await getDocs(
            collection(db, "Quizzes")
        );

        if (quizSnapshot.empty) {
            throw new Error("No quizzes found.");
        }

        // Get the first quiz's ID.
        const quizId = quizSnapshot.docs[0].id;

        // Retrieve the questions from the quiz.
        const questionsSnapshot = await getDocs(
            collection(db, "Quizzes", quizId, "question")
        );

        if (questionsSnapshot.empty) {
            throw new Error("No questions found.");
        }

        // Store the questions in an array.
        const questions = [];

        questionsSnapshot.forEach(function (item) {
            const data = item.data();

            questions.push({
                id: item.id,
                details: data.details,
                M_C: data.M_C,
                img: data.img
            });
        });

        // Sort the sample questions by their numbers.
        questions.sort(function (a, b) {
            const numberA = Number(
                a.details.replace("Sample question ", "")
            );

            const numberB = Number(
                b.details.replace("Sample question ", "")
            );

            return numberA - numberB;
        });

        // Get the question number and answers from the URL.
        const parameters = new URLSearchParams(window.location.search);

        let questionNumber = Number(parameters.get("question"));

        if (!questionNumber || questionNumber < 1 ||
            questionNumber > questions.length) {
            questionNumber = 1;
        }

        // Get the current question.
        const question = questions[questionNumber - 1];

        // Display the question number and text.
        document.getElementById("question-title").textContent =
            "Question " + questionNumber;

        document.getElementById("question-description").textContent =
            question.details;

        // Hide unused fields.
        document.getElementById("question-source").hidden = true;
        document.getElementById("question-prompt").hidden = true;

        // Display an image if one exists.
        const questionImage = document.querySelector(".image-placeholder");

        if (questionImage) {
            if (question.img) {
                if (questionImage.tagName === "IMG") {
                    questionImage.src = question.img;
                } else {
                    questionImage.style.backgroundImage =
                        "url('" + question.img + "')";
                    questionImage.style.backgroundSize = "cover";
                    questionImage.style.backgroundPosition = "center";
                }

                questionImage.hidden = false;
                questionImage.style.display = "";
            }
        }

        // Display the four multiple-choice answers.
        const letters = ["A", "B", "C", "D"];

        answerButtons.forEach(function (button, index) {
            const letter = letters[index];

            button.textContent =
                letter + ". " + question.M_C[letter];
        });

        // Show the previously selected answer.
        const savedAnswer = parameters.get("answer" + questionNumber);

        answerButtons.forEach(function (button) {
            if (button.textContent.trim() === savedAnswer) {
                button.setAttribute("aria-pressed", "true");
                button.style.outline = "3px solid #8A5A3A";
            } else {
                button.setAttribute("aria-pressed", "false");
                button.style.outline = "";
            }
        });

        // Move to the next question when an answer is selected.
        answerButtons.forEach(function (button) {
            button.addEventListener("click", function () {

                // Keep the user's selected answer in the URL.
                parameters.set(
                    "answer" + questionNumber,
                    button.textContent.trim()
                );

                if (parameters.get("review") === "true") {
                    // Return to review after changing an answer.
                    parameters.delete("question");
                    parameters.delete("review");

                    window.location.href =
                        "review.html?" + parameters.toString();

                } else if (questionNumber < questions.length) {
                    // Move to the next question.
                    parameters.set(
                        "question",
                        String(questionNumber + 1)
                    );

                    window.location.href =
                        "quiz.html?" + parameters.toString();

                } else {
                    // Open the review page after the last question.
                    parameters.delete("question");
                    parameters.delete("review");

                    window.location.href =
                        "review.html?" + parameters.toString();
                }
            });
        });

        // Calculate the quiz progress.
        const percentage = Math.round(
            (questionNumber / questions.length) * 100
        );

        // Display the current progress.
        document.getElementById("progress-label").textContent =
            "Question " + questionNumber + " of " + questions.length;

        document.getElementById("quiz-progress")
            .setAttribute("aria-valuenow", percentage);

        const progressBar = document.getElementById("progress-bar");

        progressBar.style.width = percentage + "%";
        progressBar.textContent = percentage + "%";

    } catch (error) {
        console.error("Error loading quiz:", error);

        document.getElementById("question-title").textContent =
            "Unable to load quiz";

        document.getElementById("question-description").textContent =
            error.message;

        answerButtons.forEach(function (button) {
            button.disabled = true;
        });
    }
}

loadQuiz();
