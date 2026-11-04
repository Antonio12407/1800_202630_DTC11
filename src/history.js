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

function renderEntry(entry) {
  const item = document.createElement("li");
  item.className = "history-item";

  const info = document.createElement("div");
  const date = document.createElement("div");
  date.className = "history-date";
  date.textContent = formatDate(entry);
  const score = document.createElement("div");
  score.className = "history-score";
  score.textContent = entry.score + " / " + entry.total + " correct";
  info.append(date, score);

  const badge = document.createElement("span");
  badge.className = "history-percent";
  badge.textContent = entry.percentage + "%";

  item.append(info, badge);
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