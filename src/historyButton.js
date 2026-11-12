// src/historyButton.js
// Runs on main.html. After today's quiz is finished, shows a
// "Quiz History" button right beside the "Completed Today" button.

import { db } from "./firebaseConfig.js";
import { doc, getDoc } from "firebase/firestore";
import { onAuthReady } from "/src/authentication.js";
import { getTodayDate } from "/src/streak.js";

const startBtn = document.getElementById("start-quiz");

onAuthReady(async function (user) {
  if (!user) return; // main.js sends logged-out users away

  try {
    const data = (await getDoc(doc(db, "users", user.uid))).data() || {};

    // Only show it once today's quiz is finished.
    if (data.lastQuizDate !== getTodayDate()) return;

    const row = startBtn.parentElement;

    // Put the two buttons side by side (even on phones).
    row.className = "d-flex flex-wrap justify-content-center gap-2";

    const historyBtn = document.createElement("a");
    historyBtn.href = "history.html";
    historyBtn.className = "btn btn-outline-success btn-lg px-4";
    historyBtn.textContent = "Quiz History";

    row.appendChild(historyBtn);
  } catch (error) {
    console.error("Could not check today's quiz:", error);
  }
});