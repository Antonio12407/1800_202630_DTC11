
import { onAuthReady } from "./authentication.js";
import { checkDailyQuizLimit, recordQuizCompletion } from "./streak.js";
import { getTodaysQuizId, getQuiz } from "./quizzes.js";
import { showAnswerBreakdown } from "./answerBreakdown.js";

// One quiz per day: redirects if today's quiz is already done
// (or to login if signed out). Uses the saved Firestore date.
// `userReady` resolves with the logged-in user, needed to save the
// quiz as completed after the last question.
const userReady = new Promise(function (resolve) {
    onAuthReady(function (user) {
        checkDailyQuizLimit(user);
        resolve(user);
    });
});

async function loadQuiz() {
    const answerButtons = document.querySelectorAll(".answer-button");

    try {
        // The URL carries the quiz state between pages:
        //   quiz=<quiz id>, total=<question count>, answer1, answer2, ...
        const parameters = new URLSearchParams(window.location.search);

        // Keep the quiz the user started, even if midnight passes;
        // otherwise start today's quiz.
        const quizId = parameters.get("quiz") || await getTodaysQuizId();
        const quiz = await getQuiz(quizId);
        const questions = quiz.questions;

        parameters.set("quiz", quizId);
        parameters.set("total", String(questions.length));

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

        // Display an image only if the question has one
        // (the box is hidden by default in quiz.html).
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

        // When an answer is selected: show the breakdown pop-up (right or
        // wrong, and why), then move to the next question.
        answerButtons.forEach(function (button, index) {
            button.addEventListener("click", async function () {

                // Keep the user's selected answer in the URL.
                parameters.set(
                    "answer" + questionNumber,
                    button.textContent.trim()
                );

                // No double answers while the pop-up is open.
                answerButtons.forEach(function (other) {
                    other.disabled = true;
                });

                const isLastQuestion = questionNumber >= questions.length;

                try {
                    await showAnswerBreakdown(question, letters[index], isLastQuestion);
                } catch (error) {
                    // Never block the quiz because the pop-up failed.
                    console.error("Could not show answer breakdown:", error);
                }

                if (!isLastQuestion) {
                    // Move to the next question.
                    parameters.set(
                        "question",
                        String(questionNumber + 1)
                    );

                    window.location.href =
                        "quiz.html?" + parameters.toString();
                    return;
                }

                // Last question: the quiz is complete. Save it (streak and
                // today's completion date), then go straight to the results.
                try {
                    const user = await userReady;
                    await recordQuizCompletion(user);

                    // Pass the selected answers (answer1, answer2, ...) along
                    // so the results page can score them and save them to
                    // quiz history.
                    parameters.delete("question");
                    window.location.href =
                        "results.html?" + parameters.toString();
                } catch (error) {
                    console.error("Could not save quiz completion:", error);

                    // Let the user try again by picking their answer again.
                    answerButtons.forEach(function (other) {
                        other.disabled = false;
                    });

                    const message = "Could not save your progress. Please pick your answer again to retry.";
                    if (window.Swal) {
                        window.Swal.fire({ icon: "error", title: "Something went wrong", text: message });
                    } else {
                        alert(message);
                    }
                }
            });
        });

        // Calculate the quiz progress.
        const percentage = Math.round(
            ((questionNumber - 1) / questions.length) * 100
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
