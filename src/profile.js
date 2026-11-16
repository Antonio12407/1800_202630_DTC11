// src/profile.js
// -------------------------------------------------------------
// Runs on profile.html. Shows the logged-in user's name, email and
// current streak, and the "Share my streak" button copies a short
// message with the streak to the clipboard.
// -------------------------------------------------------------

import { onAuthReady } from "/src/authentication.js";
import { getStreakData } from "/src/streak.js";

const nameEl = document.getElementById("profile-name");
const emailEl = document.getElementById("profile-email");
const streakEl = document.getElementById("profile-streak");
const unitEl = document.getElementById("profile-streak-unit");
const shareBtn = document.getElementById("share-streak");
const statusEl = document.getElementById("share-status");

let currentStreak = 0;

// The text that gets copied, e.g. "I'm on a 5-day streak on Quaggle! ..."
function shareMessage(streak) {
  if (streak === 0) {
    return "I'm starting my Quaggle streak! Learning to spot misinformation, one daily quiz at a time.";
  }

  const days = streak === 1 ? "1-day" : streak + "-day";
  return "I'm on a " + days + " streak on Quaggle! Learning to spot misinformation, one daily quiz at a time.";
}

// Copy text to the clipboard. Uses the Clipboard API, with a fallback
// for browsers or pages where it isn't available (e.g. plain http).
async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.opacity = "0";
  document.body.appendChild(textArea);
  textArea.select();

  const copied = document.execCommand("copy");
  textArea.remove();

  if (!copied) {
    throw new Error("Copy command was blocked.");
  }
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
  // The profile belongs to a logged-in user.
  if (!user) {
    location.href = "login.html";
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
