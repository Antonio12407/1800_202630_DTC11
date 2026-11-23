// src/history.js
// Runs on history.html. Loads the logged-in user's completed
// quizzes from Firestore and lists them, newest first.

import { onAuthReady } from "/src/authentication.js";
import { getQuizHistory } from "/src/quizHistory.js";

const listEl = document.getElementById("history-list");
const statusEl = document.getElementById("history-status");

function formatDate(entry) {
  if (entry.completedAt) {
    return entry.completedAt.toLocaleString("en-US", {
      dateStyle: "long",
      timeStyle: "short",
    });
  }
  return entry.completedDate; // fallback: YYYY-MM-DD
}

// One quiz in the list. Each entry is a real link to its breakdown, so
// it can be tapped, clicked, or opened with the keyboard, and it shows
// a "View breakdown" label and a chevron so people know it opens.
function renderEntry(entry) {
  const item = document.createElement("li");

  const link = document.createElement("a");
  link.className = "history-item";
  link.href = "history-detail.html?id=" + encodeURIComponent(entry.id);

  const info = document.createElement("div");
  const date = document.createElement("div");
  date.className = "history-date";
  date.textContent = formatDate(entry);
  const score = document.createElement("div");
  score.className = "history-score";
  score.textContent = entry.score + " / " + entry.total + " correct";
  const cta = document.createElement("div");
  cta.className = "history-cta";
  cta.textContent = "View breakdown";
  info.append(date, score, cta);

  const side = document.createElement("div");
  side.className = "history-side";

  const badge = document.createElement("span");
  badge.className = "history-percent";
  badge.textContent = entry.percentage + "%";

  const chevron = document.createElement("i");
  chevron.className = "bi bi-chevron-right history-chevron";
  chevron.setAttribute("aria-hidden", "true");

  side.append(badge, chevron);
  link.append(info, side);
  item.appendChild(link);
  return item;
}

onAuthReady(async function (user) {
  if (!user) {
    location.href = "login.html";
    return;
  }

  try {
    const history = await getQuizHistory(user);
    listEl.replaceChildren();

    if (history.length === 0) {
      statusEl.textContent =
        "No quizzes completed yet. Take today's quiz and your results will show up here.";
      document.getElementById("start-link").classList.remove("d-none");
      return;
    }

    statusEl.textContent = "";
    history.forEach(function (entry) {
      listEl.appendChild(renderEntry(entry));
    });
  } catch (error) {
    console.error("Could not load quiz history:", error);
    statusEl.textContent =
      "Could not load your quiz history. Please refresh and try again.";
  }
});