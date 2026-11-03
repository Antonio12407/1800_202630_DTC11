import { db } from "./firebaseConfig.js";
import { collection, addDoc } from "firebase/firestore";

async function createQuizDatabase() {
  const status = document.getElementById("status");
  const button = document.getElementById("createQuiz");

  button.disabled = true;
  status.textContent = "Creating quiz database...";

  try {
    // Create a quiz with an automatically generated ID.
    const quizRef = await addDoc(
      collection(db, "Quizzes"),
      {}
    );

    // Reference the question subcollection.
    const questionsRef = collection(
      db,
      "Quizzes",
      quizRef.id,
      "question"
    );

    // Create three sample questions.
    const questions = [
      {
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

    // Add each question with an automatic document ID.
    for (const question of questions) {
      await addDoc(questionsRef, question);
    }

    status.textContent = "Quiz database created successfully!";
    console.log("Quiz ID:", quizRef.id);

  } catch (error) {
    console.error("Error creating database:", error);
    status.textContent = "Error: " + error.message;
  }
}

document.getElementById("createQuiz").addEventListener(
  "click",
  createQuizDatabase
);