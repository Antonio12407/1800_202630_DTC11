// src/saveHistory.js
// Add-on for results.html. Waits until results.js has displayed the
// score, then saves that result to Firestore (users/{uid}/quizHistory).

import { db } from "./firebaseConfig.js";
import { collection, getDocs } from "firebase/firestore";
import { onAuthReady } from "/src/authentication.js";
import { saveQuizResult } from "/src/quizHistory.js";

const scoreEl = document.getElementById("score");
const totalEl = document.getElementById("total");
const statusEl = document.getElementById("status");

// Resolves with { score, total } once results.js has filled in real numbers.
function waitForScore() {
  return new Promise(function (resolve) {
    function check() {
      const score = Number(scoreEl.textContent);
      const total = Number(totalEl.textContent);
      if (/^\d+$/.test(scoreEl.textContent.trim()) && total > 0) {
        observer.disconnect();
        resolve({ score: score, total: total });
      }
    }
    const observer = new MutationObserver(check);
    observer.observe(scoreEl, { childList: true, characterData: true, subtree: true });
    observer.observe(totalEl, { childList: true, characterData: true, subtree: true });
    check();
  });
}

onAuthReady(async function (user) {
  if (!user) return; // results.js handles the signed-out case

  try {
    const { score, total } = await waitForScore();
    const quizSnapshot = await getDocs(collection(db, "Quizzes"));
    const quizId = quizSnapshot.docs[0].id;
    await saveQuizResult(user, { quizId: quizId, score: score, total: total });
  } catch (error) {
    console.error("Could not save quiz history:", error);
    if (statusEl) {
      statusEl.textContent =
        "Your results are shown, but they could not be saved to your history.";
    }
  }
});