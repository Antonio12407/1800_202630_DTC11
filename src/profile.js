// src/profile.js
// -------------------------------------------------------------
// Runs on profile.html. Shows the logged-in user's name, email and
// current streak, and the "Share my streak" button copies a short
// message with the streak to the clipboard. The Log out button is
// here (not in the navbar).
// -------------------------------------------------------------

import { onAuthReady, logoutUser } from "/src/authentication.js";
import { getStreakData } from "/src/streak.js";
import { copyToClipboard } from "/src/clipboard.js";

const nameEl = document.getElementById("profile-name");
const emailEl = document.getElementById("profile-email");
const streakEl = document.getElementById("profile-streak");
const unitEl = document.getElementById("profile-streak-unit");
const shareBtn = document.getElementById("share-streak");
const statusEl = document.getElementById("share-status");
const logoutBtn = document.getElementById("logout-button");
const logoutStatusEl = document.getElementById("logout-status");

let currentStreak = 0;
let loggingOut = false;

// Log out: signs out of Firebase, then logoutUser() goes to index.html.
logoutBtn.addEventListener("click", async function () {
  loggingOut = true;
  logoutBtn.disabled = true;
  logoutStatusEl.textContent = "";

  try {
    await logoutUser();
  } catch (error) {
    console.error("Could not log out:", error);
    loggingOut = false;
    logoutBtn.disabled = false;
    logoutStatusEl.textContent = "Couldn't log out. Please try again.";
  }
});

// The text that gets copied, e.g. "I'm on a 5-day streak on Quaggle!"
function shareMessage(streak) {
  if (streak === 0) {
    return "I'm starting my Quaggle streak!";
  }

  return "I'm on a " + streak + "-day streak on Quaggle!";
}

shareBtn.addEventListener("click", async function () {
  try {
    await copyToClipboard(shareMessage(currentStreak));
    statusEl.textContent = "Copied! Paste it anywhere to share your streak.";
  } catch (error) {
    console.error("Could not copy streak:", error);
    statusEl.textContent = "Couldn't copy automatically. Please try again.";
  }
});

onAuthReady(async function (user) {
  // The profile belongs to a logged-in user. (While logging out,
  // logoutUser() handles the redirect to index.html instead.)
  if (!user) {
    if (!loggingOut) location.href = "login.html";
    return;
  }

  nameEl.textContent = user.displayName || "Quaggle user";
  emailEl.textContent = user.email || "";

  try {
    // Same streak as the dashboard (0 if a day was missed).
    const { currentStreak: streak } = await getStreakData(user);
    currentStreak = streak;
  } catch (error) {
    console.error("Could not load streak:", error);
  }

  streakEl.textContent = currentStreak;
  unitEl.textContent = currentStreak === 1 ? "day" : "days";
  shareBtn.disabled = false;
});
