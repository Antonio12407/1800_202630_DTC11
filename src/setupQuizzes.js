
import { db } from "./firebaseConfig.js";
import { doc, getDoc, setDoc } from "firebase/firestore";

async function createQuizDatabase() {
    const status = document.getElementById("status");

    try {
        // Create a reference to our sample quiz.
        const quizRef = doc(db, "Quizzes", "quiz001");

        // Check whether the quiz already exists.
        const quizSnap = await getDoc(quizRef);

        if (!quizSnap.exists()) {
            await setDoc(quizRef, {
                questionIds: ["q1", "q2", "q3"]
            });
        }

        // Three sample questions.
        const questions = [
            {
                id: "q1",
                answer: "B",
                details: "Sample question 1",
                M_C: {
                    A: "Option 1",
                    B: "Option 2",
                    C: "Option 3",
                    D: "Option 4"
                },
                img: "",
                explanation: "Sample explanation 1"
            },
            {
                id: "q2",
                answer: "A",
                details: "Sample question 2",
                M_C: {
                    A: "Option 1",
                    B: "Option 2",
                    C: "Option 3",
                    D: "Option 4"
                },
                img: "",
                explanation: "Sample explanation 2"
            },
            {
                id: "q3",
                answer: "C",
                details: "Sample question 3",
                M_C: {
                    A: "Option 1",
                    B: "Option 2",
                    C: "Option 3",
                    D: "Option 4"
                },
                img: "",
                explanation: "Sample explanation 3"
            }
        ];

        // Create each question in Firestore.
        for (const question of questions) {
            const questionRef = doc(
                db,
                "Quizzes",
                "quiz001",
                "question",
                question.id
            );

            const questionSnap = await getDoc(questionRef);

            // Only create questions that don't exist yet.
            if (!questionSnap.exists()) {
                await setDoc(questionRef, {
                    answer: question.answer,
                    details: question.details,
                    M_C: question.M_C,
                    img: question.img,
                    explanation: question.explanation
                });
            }
        }

        status.textContent = "Quiz database created successfully!";
        console.log("Quiz database created successfully!");

    } catch (error) {
        console.error("Error creating database:", error);
        status.textContent = "Error: " + error.message;
    }
}

document.getElementById("createQuiz").addEventListener(
    "click",
    createQuizDatabase
);
