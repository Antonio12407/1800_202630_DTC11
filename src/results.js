
import { db } from "./firebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";

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

        let correct = 0;
        let total = 0;

        questionsSnapshot.forEach((question) => {
            const data = question.data();

            // Temporary matching using sample question numbers.
            const match = data.details.match(/^Sample question (\d+)$/);
            if (!match) {
                throw new Error("Invalid sample question number.");
            }

            const questionNumber = Number(match[1]);

            // Read the answer saved by quiz.html.
            const userAnswer = sessionStorage.getItem(
                "question" + questionNumber + "Answer"
            );

            if (!userAnswer) {
                throw new Error("Please complete the quiz first.");
            }

            const selectedAnswer = userAnswer.trim()[0].toUpperCase();

            // Compare the user's answer with Firestore.
            if (selectedAnswer === data.answer.toUpperCase()) {
                correct++;
            }

            total++;
        });

        // Calculate the final percentage.
        const percentage = Math.round((correct / total) * 100);

        // Display the results on the HTML page.
        document.getElementById("score").textContent = correct;
        document.getElementById("total").textContent = total;
        document.getElementById("percentage").textContent =
            percentage + "%";

        status.textContent = "";

    } catch (error) {
        console.error("Error loading results:", error);
        status.textContent = "Error: " + error.message;
    }
}

showResults();
