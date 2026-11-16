// src/quizzes.js
// -------------------------------------------------------------
// Loads quizzes from Firestore. Quizzes are added by hand in the
// Firebase console:
//
//   Quizzes/{auto id}                     a quiz (fields optional, see below)
//   Quizzes/{auto id}/question/{auto id}  one question:
//     details      the question text            (string)
//     M_C          the options { A, B, C, D }   (map of strings)
//     answer       the correct letter, e.g. "B" (string)
//     img          image URL, or ""             (string)
//     explanation  why the answer is right      (string)
//
// Optional quiz fields:
//   title          a name for the quiz                       (string)
//   order          its place in the daily rotation: 1, 2, 3  (number)
//   questionOrder  question ids in display order             (array)
//
// The quizzes take turns by day. Quizzes with an `order` come first,
// sorted by it; the rest follow, sorted by id. Without questionOrder,
// questions are shown sorted by id (the same order on every page).
// -------------------------------------------------------------

import { db } from "./firebaseConfig.js";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { getTodayDate } from "./streak.js";

// Whole days since 1970-01-01 for a "YYYY-MM-DD" date (local calendar day).
function dayNumber(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  return Math.floor(Date.UTC(year, month - 1, day) / (1000 * 60 * 60 * 24));
}

// Compare two documents by id, so the order is the same on every page.
function byId(a, b) {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

// The id of today's quiz.
export async function getTodaysQuizId() {
  const snapshot = await getDocs(collection(db, "Quizzes"));

  if (snapshot.empty) {
    throw new Error("No quizzes found. Add one to the Quizzes collection in Firestore.");
  }

  // Quizzes with an `order` number first (by that number), then the rest by id.
  const quizzes = snapshot.docs.slice().sort(function (a, b) {
    const orderA = a.data().order;
    const orderB = b.data().order;
    const hasA = typeof orderA === "number";
    const hasB = typeof orderB === "number";

    if (hasA && hasB && orderA !== orderB) return orderA - orderB;
    if (hasA !== hasB) return hasA ? -1 : 1;
    return byId(a, b);
  });

  const index = dayNumber(getTodayDate()) % quizzes.length;
  return quizzes[index].id;
}

// One quiz with its questions in display order:
//   { id, title, questions: [{ id, details, M_C, answer, img, explanation }, ...] }
export async function getQuiz(quizId) {
  const quizSnapshot = await getDoc(doc(db, "Quizzes", quizId));

  if (!quizSnapshot.exists()) {
    throw new Error("Quiz not found.");
  }

  const quiz = quizSnapshot.data();
  const questionsSnapshot = await getDocs(
    collection(db, "Quizzes", quizId, "question")
  );

  if (questionsSnapshot.empty) {
    throw new Error("This quiz has no questions yet.");
  }

  const questions = questionsSnapshot.docs
    .map(function (questionDoc) {
      return { id: questionDoc.id, ...questionDoc.data() };
    })
    .sort(byId);

  // If the quiz lists its questions in order, follow that list
  // (questions missing from it go last, still sorted by id).
  const order = Array.isArray(quiz.questionOrder) ? quiz.questionOrder : [];
  if (order.length > 0) {
    const position = (question) => {
      const index = order.indexOf(question.id);
      return index === -1 ? order.length : index;
    };
    questions.sort((a, b) => position(a) - position(b) || byId(a, b));
  }

  return {
    id: quizId,
    title: quiz.title || "",
    questions: questions
  };
}
