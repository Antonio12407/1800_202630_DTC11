// src/shareResults.js
// -------------------------------------------------------------
// Copies quiz results to the clipboard and displays a popup.
// -------------------------------------------------------------

import { resultsReady } from "./results.js";
import { copyToClipboard } from "./clipboard.js";

const shareBtn = document.getElementById("share-score");

const result = await resultsReady;

if (result) {
  shareBtn.disabled = false;

  shareBtn.addEventListener("click", async function () {
    const message =
      "I scored " + result.score + "/" + result.total +
      " on today's Quaggle quiz!";

    try {
      await copyToClipboard(message);

      await Swal.fire({
        icon: "success",
        title: "Copied to clipboard!",
        text: "Your quiz results are ready to share!",
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      console.error("Could not copy results:", error);

      await Swal.fire({
        icon: "error",
        title: "Copy failed",
        text: "Couldn't copy your results. Please try again.",
        confirmButtonText: "OK"
      });
    }
  });
}