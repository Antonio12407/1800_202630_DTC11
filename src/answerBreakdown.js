// src/answerBreakdown.js
// -------------------------------------------------------------
// The pop-up shown right after the user answers a question:
// whether they got it right, and why.
//
// A question's `explanation` field has one line per option, e.g.
//   "A) Wrong. Lots of shares can feel like a clue, ...
//    B) Correct. The site was a fake run by a hoax writer, ..."
// The pop-up shows the line for the option the user picked and, if
// they were wrong, the line for the correct option too. Questions
// with a single plain explanation show that text instead.
//
// Uses SweetAlert2 (window.Swal), loaded by quiz.html.
// -------------------------------------------------------------

// Make text safe to put inside the pop-up's HTML.
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// The explanation line for one option letter, without the "A) " prefix,
// or null if the explanation isn't written one line per option.
function explanationFor(explanation, letter) {
  const lines = String(explanation || "").split(/\r?\n/);
  const line = lines.find(function (text) {
    return text.trim().toUpperCase().startsWith(letter + ")");
  });
  return line ? line.trim().slice(2).trim() : null;
}

// Drop a leading "Correct." / "Wrong." from a line, since the pop-up's
// title already says it.
function withoutVerdict(text) {
  return text.replace(/^(Correct|Wrong)\.\s*/i, "");
}

// Show the breakdown for one answered question.
//   question:       { M_C, answer, explanation }
//   selectedLetter: "A" | "B" | "C" | "D"
//   isLastQuestion: changes the button label
// Resolves when the user closes the pop-up.
export async function showAnswerBreakdown(question, selectedLetter, isLastQuestion) {
  const correctLetter = String(question.answer || "").trim().toUpperCase();
  const isCorrect = selectedLetter === correctLetter;

  const pickedWhy = explanationFor(question.explanation, selectedLetter);
  const correctWhy = explanationFor(question.explanation, correctLetter);

  let html = "";

  if (pickedWhy || correctWhy) {
    if (isCorrect) {
      html += "<p><strong>Your answer: " + escapeHtml(selectedLetter + ". " + question.M_C[selectedLetter]) + "</strong></p>";
      if (pickedWhy) html += "<p>" + escapeHtml(withoutVerdict(pickedWhy)) + "</p>";
    } else {
      html += "<p><strong>Your answer: " + escapeHtml(selectedLetter + ". " + question.M_C[selectedLetter]) + "</strong></p>";
      if (pickedWhy) html += "<p>" + escapeHtml(withoutVerdict(pickedWhy)) + "</p>";
      html += "<p><strong>Correct answer: " + escapeHtml(correctLetter + ". " + question.M_C[correctLetter]) + "</strong></p>";
      if (correctWhy) html += "<p>" + escapeHtml(withoutVerdict(correctWhy)) + "</p>";
    }
  } else {
    // Older questions: one plain explanation.
    if (!isCorrect) {
      html += "<p><strong>Correct answer: " + escapeHtml(correctLetter + ". " + question.M_C[correctLetter]) + "</strong></p>";
    }
    if (question.explanation) html += "<p>" + escapeHtml(question.explanation) + "</p>";
  }

  // If SweetAlert2 didn't load, don't block the quiz.
  if (!window.Swal) return;

  await window.Swal.fire({
    icon: isCorrect ? "success" : "error",
    title: isCorrect ? "Correct!" : "Not quite",
    html: '<div style="text-align:left">' + html + "</div>",
    confirmButtonText: isLastQuestion ? "See results" : "Next question",
    confirmButtonColor: "#3E2415",
    allowOutsideClick: false,
    allowEscapeKey: false
  });
}
