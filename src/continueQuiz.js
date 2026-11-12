// src/continueQuiz.js
// Runs on main.html. If the user has a quiz in progress today,
// the Start Quiz button says "Continue Quiz" instead.

import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import { onAuthReady } from "/src/authentication.js";
import { getTodayDate } from "/src/streak.js";

const startBtn = document.getElementById("start-quiz");

onAuthReady(async function (user) {
  if (!user) return; // main.js sends logged-out users away

  try {
    const data = (await getDoc(doc(db, "users", user.uid))).data() || {};
    const today = getTodayDate();
    const progress = data.quizProgress;

    const inProgress = progress && progress.date === today && progress.query;
    const finishedToday = data.lastQuizDate === today;

    // Only change the button if the quiz was started but not finished.
    if (inProgress && !finishedToday) {
      startBtn.textContent = "Continue Quiz";
    }
  } catch (error) {
    console.error("Could not check quiz progress:", error);
  }
});