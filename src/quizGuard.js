// src/quizGuard.js
// -------------------------------------------------------------
// Included on the quiz pages (quiz.html, answer.html).
// Enforces the one-quiz-per-day rule using the completion date
// saved in Firestore, so it can't be skipped by opening a quiz
// page directly, in a new tab, or on another device.
// -------------------------------------------------------------

import { onAuthReady } from "/src/authentication.js";
import { getStreakData } from "/src/streak.js";

onAuthReady(async function (user) {
  // The quiz is saved per user, so it needs a login.
  if (!user) {
    location.href = "login.html";
    return;
  }

  try {
    const { completedToday } = await getStreakData(user);

    // Today's quiz is already done: back to the dashboard,
    // which shows "Completed Today".
    if (completedToday) {
      location.replace("main.html");
    }
  } catch (error) {
    // If Firestore can't be reached, let the user keep going;
    // submitting still won't count the same day twice.
    console.error("Could not check today's quiz:", error);
  }
});
