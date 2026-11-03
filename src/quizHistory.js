// src/quizHistory.js
// Quiz history stored in Firestore (NOT in the browser):
//   users/{uid}/quizHistory/{YYYY-MM-DD_quizId}

import { db } from "./firebaseConfig.js";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { getTodayDate } from "./streak.js";

// Save one completed quiz. Returns true if saved, false if this
// quiz was already saved today (the first result is kept).
export async function saveQuizResult(user, { quizId, score, total }) {
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
    completedDate: completedDate,
    completedAt: serverTimestamp(),
  });

  return true;
}

// Load the user's history, most recent first.
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
      completedDate: data.completedDate,
      completedAt: data.completedAt ? data.completedAt.toDate() : null,
    };
  });
}