import { db } from "./firebaseConfig.js";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  where,
  serverTimestamp,
  getCountFromServer,
} from "firebase/firestore";
import { getTodayDate } from "./streak.js";

export async function saveQuizResult(user, { quizId, score, total, answers = [] }) {
  if (!user) {
    throw new Error("Please sign in first.");
  }

  const completedDate = getTodayDate();
  const entryRef = doc(
    db,
    "users",
    user.uid,
    "quizHistory",
    completedDate + "_" + quizId
  );

  if ((await getDoc(entryRef)).exists()) {
    return false;
  }

  await setDoc(entryRef, {
    quizId: quizId,
    score: score,
    total: total,
    percentage: total > 0 ? Math.round((score / total) * 100) : 0,
    answers: answers.map(function (answer) {
      return {
        questionNumber: answer.questionNumber,
        question: answer.question,
        selected: answer.selected,
        selectedText: answer.selectedText,
        correctAnswer: answer.correctAnswer,
        isCorrect: answer.isCorrect,
      };
    }),
    completedDate: completedDate,
    completedAt: serverTimestamp(),
  });

  return true;
}

export async function getCompletedQuizCount(user) {
  if (!user) {
    throw new Error("Please sign in first.");
  }

  const snapshot = await getCountFromServer(
    collection(db, "users", user.uid, "quizHistory")
  );
  return snapshot.data().count;
}

export async function getPerfectQuizCount(user) {
  if (!user) {
    throw new Error("Please sign in first.");
  }

  const snapshot = await getCountFromServer(
    query(
      collection(db, "users", user.uid, "quizHistory"),
      where("percentage", "==", 100)
    )
  );
  return snapshot.data().count;
}

export async function getQuizHistory(user) {
  if (!user) {
    throw new Error("Please sign in first.");
  }

  const historyQuery = query(
    collection(db, "users", user.uid, "quizHistory"),
    orderBy("completedAt", "desc")
  );
  const snapshot = await getDocs(historyQuery);

  return snapshot.docs.map(function (entry) {
    const data = entry.data();
    return {
      id: entry.id,
      score: data.score,
      total: data.total,
      percentage: data.percentage,
      answers: data.answers || [], // older entries were saved without answers
      completedDate: data.completedDate,
      completedAt: data.completedAt ? data.completedAt.toDate() : null,
    };
  });
}

export async function getQuizHistoryEntry(user, entryId) {
  if (!user) {
    throw new Error("Please sign in first.");
  }

  const entrySnap = await getDoc(
    doc(db, "users", user.uid, "quizHistory", entryId)
  );

  if (!entrySnap.exists()) {
    return null;
  }

  const data = entrySnap.data();
  return {
    id: entrySnap.id,
    quizId: data.quizId,
    score: data.score,
    total: data.total,
    percentage: data.percentage,
    answers: data.answers || [],
    completedDate: data.completedDate,
  };
}