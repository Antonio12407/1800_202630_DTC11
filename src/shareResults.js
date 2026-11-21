// src/shareResults.js
// -------------------------------------------------------------
// Add-on for results.html. Once results.js has scored the quiz, the
// "Share my score" button copies a short message with the score to
// the clipboard, e.g. "I scored 4/5 (80%) on today's Quaggle quiz!"
// -------------------------------------------------------------

import { resultsReady } from "/src/results.js";
import { copyToClipboard } from "/src/clipboard.js";

const shareBtn = document.getElementById("share-score");
const statusEl = document.getElementById("share-status");

// The text that gets copied.
function shareMessage({ score, total }) {
  const percentage = Math.round((score / total) * 100);
  return "I scored " + score + "/" + total + " (" + percentage + "%) on today's Quaggle quiz!";
}

const result = await resultsReady;

if (result) {
  shareBtn.disabled = false;

  shareBtn.addEventListener("click", async function () {
    try {
      await copyToClipboard(shareMessage(result));
      statusEl.textContent = "Results copied to clipboard! Paste it anywhere to share your score.";
    } catch (error) {
      console.error("Could not copy score:", error);
      statusEl.textContent = "Couldn't copy automatically. Please try again.";
    }
  });
} else {
  // results.js couldn't score the quiz (it shows its own error),
  // so there is no score to share.
  shareBtn.hidden = true;
}
