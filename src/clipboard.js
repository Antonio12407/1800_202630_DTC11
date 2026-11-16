// src/clipboard.js
// -------------------------------------------------------------
// Shared helper for the "Share" buttons (profile page, results page).
// -------------------------------------------------------------

// Copy text to the clipboard. Uses the Clipboard API, with a fallback
// for browsers or pages where it isn't available (e.g. plain http).
// Throws if the text could not be copied.
export async function copyToClipboard(text) {
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
