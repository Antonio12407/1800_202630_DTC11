// src/review.js
// -------------------------------------------------------------
// Runs on review.html. When the user presses Submit, the quiz counts as
// completed: the streak and last completion date are saved, then the
// user is sent back to the home page.
// -------------------------------------------------------------

import { onAuthReady } from "/src/authentication.js";
import { recordQuizCompletion } from "/src/streak.js";

const submitBtn = document.getElementById("submit-quiz");
let currentUser = null;

// Only logged-in users can complete a quiz (the streak is saved per user).
onAuthReady((user) => {
  if (!user) {
    location.href = "login.html";
    return;
  }
  currentUser = user;
});

submitBtn?.addEventListener("click", async () => {
  if (!currentUser) return; // auth not ready yet

  submitBtn.disabled = true; // prevent double clicks
  try {
    await recordQuizCompletion(currentUser.uid);
    location.href = "main.html"; // streak badge there shows the new value
  } catch (err) {
    console.error("Could not save quiz completion:", err);
    submitBtn.disabled = false;
    alert("Could not save your progress. Please try again.");
  }
});
