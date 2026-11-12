// src/quizProgress.js
// Saves where the user is in today's quiz, and sends them back there
// if they leave and return. Stored in Firestore on users/{uid}.

import { db } from "./firebaseConfig.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { onAuthReady } from "/src/authentication.js";
import { getTodayDate } from "/src/streak.js";

const query = window.location.search; // e.g. "?question=2&answer1=B. Option 2"

onAuthReady(async function (user) {
  if (!user) return; // quiz.js sends logged-out users to the login page

  const userRef = doc(db, "users", user.uid);

  try {
    if (query === "") {
      // Fresh start (e.g. Start Quiz): resume if there is progress from today.
      const data = (await getDoc(userRef)).data() || {};
      const saved = data.quizProgress;

      if (saved && saved.date === getTodayDate() && saved.query) {
        location.replace("quiz.html?" + saved.query);
      }
    } else if (!query.includes("review=true")) {
      // The user is on a question: remember it.
      await setDoc(
        userRef,
        { quizProgress: { date: getTodayDate(), query: query.slice(1) } },
        { merge: true }
      );
    }
  } catch (error) {
    console.error("Could not save or load quiz progress:", error);
  }
});