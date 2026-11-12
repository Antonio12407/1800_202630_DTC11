// src/main.js
// -------------------------------------------------------------
// Runs on main.html (the dashboard). Once Firebase reports the
// logged-in user, it shows their name and streak, and locks the
// Start Quiz button if today's quiz is already done.
// -------------------------------------------------------------

import { onAuthReady } from "/src/authentication.js";
import { getStreakData } from "/src/streak.js";

const nameEl = document.getElementById("name-goes-here");
const streakEl = document.getElementById("streak-count");
const startBtn = document.getElementById("start-quiz");

// Keep Start Quiz disabled until the saved completion date is checked.
startBtn.disabled = true;

// Start Quiz goes to the first question.
startBtn.addEventListener("click", function () {
  location.href = "quiz.html";
});

// Show the button as finished for today.
function lockStartButton() {
  startBtn.textContent = "Completed Today";
  startBtn.classList.replace("btn-outline-success", "btn-secondary");
  startBtn.disabled = true;
}

onAuthReady(async function (user) {
  // Logged-out users go back to the landing page.
  if (!user) {
    location.href = "index.html";
    return;
  }

  // Use email if the user has no display name.
  nameEl.textContent = user.displayName || user.email;

  try {
    const { currentStreak, completedToday } = await getStreakData(user);
    streakEl.textContent = currentStreak;

    // One quiz per day: the saved date decides, so this works
    // across tabs and devices and unlocks again tomorrow.
    if (completedToday) {
      lockStartButton();
    } else {
      startBtn.disabled = false;
    }
  } catch (error) {
    // Don't block the quiz if Firestore can't be reached;
    // submitting still won't count the same day twice.
    console.error("Could not load streak:", error);
    startBtn.disabled = false;
  }
});
