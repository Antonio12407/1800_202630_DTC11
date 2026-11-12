// src/saveHistory.js
// Add-on for results.html. Waits until results.js has scored and
// displayed the quiz, then saves that result (score, completion date,
// and the selected answers) to Firestore (users/{uid}/quizHistory).

import { onAuthReady } from "/src/authentication.js";
import { saveQuizResult } from "/src/quizHistory.js";
import { resultsReady } from "/src/results.js";

const statusEl = document.getElementById("status");

onAuthReady(async function (user) {
  if (!user) return; // results.js handles the signed-out case

  try {
    const result = await resultsReady;
    if (!result) return; // results.js already showed the error

    await saveQuizResult(user, result);
  } catch (error) {
    console.error("Could not save quiz history:", error);
    if (statusEl) {
      statusEl.textContent =
        "Your results are shown, but they could not be saved to your history.";
    }
  }
});
