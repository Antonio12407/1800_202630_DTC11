// src/streak.js
// -------------------------------------------------------------
// Daily quiz streak, stored on each user's Firestore document:
//   users/{uid} -> { currentStreak: number, lastQuizDate: "YYYY-MM-DD" }
// Dates are the user's LOCAL calendar day.
// -------------------------------------------------------------

import { db } from "./firebaseConfig.js";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Get today's date in YYYY-MM-DD format.
export function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

// Find how many calendar days are between two YYYY-MM-DD dates.
// Uses UTC so daylight-saving changes can't shift the result.
function daysBetween(firstDate, secondDate) {
  const [y1, m1, d1] = firstDate.split("-").map(Number);
  const [y2, m2, d2] = secondDate.split("-").map(Number);

  const oneDay = 1000 * 60 * 60 * 24;
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / oneDay);
}

// Read the saved streak fields for a user (defaults if none yet).
async function loadStreak(user) {
  if (!user) {
    throw new Error("Please sign in first.");
  }

  const userRef = doc(db, "users", user.uid);
  const data = (await getDoc(userRef)).data() || {};

  return {
    userRef: userRef,
    currentStreak: data.currentStreak || 0,
    lastQuizDate: data.lastQuizDate || ""
  };
}

// Called when the user submits a completed quiz.
// Returns the new streak.
export async function recordQuizCompletion(user) {
  const { userRef, currentStreak, lastQuizDate } = await loadStreak(user);
  const today = getTodayDate();

  // A quiz was already completed today: don't count it twice.
  if (lastQuizDate === today) {
    return currentStreak;
  }

  // Quiz yesterday extends the streak; first quiz or a missed day starts at 1.
  const completedYesterday =
    lastQuizDate !== "" && daysBetween(lastQuizDate, today) === 1;
  const newStreak = completedYesterday ? currentStreak + 1 : 1;

  await setDoc(userRef, {
    currentStreak: newStreak,
    lastQuizDate: today
  }, { merge: true });

  return newStreak;
}

// Called when the dashboard (or a quiz page) loads.
// Resets and saves the streak if a full calendar day was missed.
// Returns the streak to display and whether today's quiz is done.
export async function getStreakData(user) {
  const { userRef, currentStreak, lastQuizDate } = await loadStreak(user);
  const today = getTodayDate();

  // The streak is only alive if the last quiz was today or yesterday.
  // A gap of 2+ days means at least one whole day had no quiz.
  const missedDay =
    lastQuizDate !== "" && daysBetween(lastQuizDate, today) > 1;

  if (missedDay && currentStreak !== 0) {
    // Save the reset so Firestore matches what the user sees.
    // Only writes once: after this the stored streak is already 0.
    try {
      await setDoc(userRef, { currentStreak: 0 }, { merge: true });
    } catch (error) {
      // Still show 0; the reset will be saved on the next load.
      console.error("Could not save streak reset:", error);
    }
  }

  return {
    currentStreak: missedDay ? 0 : currentStreak,
    completedToday: lastQuizDate === today
  };
}

// Called by the quiz pages (quiz, answer, review) once Firebase reports
// the user. Enforces one quiz per day using the saved completion date,
// so it can't be skipped by opening a quiz page directly, in a new tab,
// or on another device.
export async function checkDailyQuizLimit(user) {
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
}
