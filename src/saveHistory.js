// src/saveHistory.js
// Add-on for results.html. Waits until results.js has scored and
// displayed the quiz, then saves that result (score, completion date,
// and the selected answers) to Firestore (users/{uid}/quizHistory).
//
// Continue opens the progress screen, which counts quizzes from this
// history, so Continue waits for the save to finish first (up to a few
// seconds, so a slow connection never traps the user here).

import { onAuthReady } from "/src/authentication.js";
import { saveQuizResult } from "/src/quizHistory.js";
import { resultsReady } from "/src/results.js";

const statusEl = document.getElementById("status");
const continueLink = document.getElementById("continue-link");

// Resolves once saving has finished, failed, or been skipped.
let markSaveDone;
const saveDone = new Promise(function (resolve) {
  markSaveDone = resolve;
});

onAuthReady(async function (user) {
  try {
    if (!user) return; // results.js handles the signed-out case

    const result = await resultsReady;
    if (!result) return; // results.js already showed the error

    await saveQuizResult(user, result);
  } catch (error) {
    console.error("Could not save quiz history:", error);
    if (statusEl) {
      statusEl.textContent =
        "Your results are shown, but they could not be saved to your history.";
    }
  } finally {
    markSaveDone();
  }
});

const MAX_WAIT_MS = 4000;

continueLink?.addEventListener("click", async function (event) {
  event.preventDefault();
  continueLink.setAttribute("aria-disabled", "true");
  continueLink.textContent = "Saving...";

  await Promise.race([
    saveDone,
    new Promise(function (resolve) {
      setTimeout(resolve, MAX_WAIT_MS);
    }),
  ]);

  location.href = continueLink.href;
});
