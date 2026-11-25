// src/progress.js
// -------------------------------------------------------------
// Runs on progress.html, which opens after Continue on the results
// screen. Shows the user's updated daily streak and their progress
// towards each badge (from badges.js), plus a Back to Home button.
// -------------------------------------------------------------

import { onAuthReady } from "/src/authentication.js";
import { getStreakData } from "/src/streak.js";
import { getCompletedQuizCount, getPerfectQuizCount } from "/src/quizHistory.js";
import { getBadges } from "/src/badges.js";

const streakEl = document.getElementById("progress-streak");
const unitEl = document.getElementById("progress-streak-unit");
const noteEl = document.getElementById("progress-streak-note");
const listEl = document.getElementById("progress-badges");

// One badge row: circle, name, "2 / 3 quizzes", description, progress bar.
function renderBadgeRow(badge) {
  const row = document.createElement("li");
  row.className = "progress-badge " + (badge.earned ? "earned" : "locked");

  // Reuse the badge circle style from badges.css (badge-item earned/locked).
  const item = document.createElement("div");
  item.className = "badge-item " + (badge.earned ? "earned" : "locked");
  const circle = document.createElement("div");
  circle.className = "badge-circle";
  const icon = document.createElement("i");
  icon.className = "bi " + (badge.earned ? badge.icon : "bi-lock-fill");
  icon.setAttribute("aria-hidden", "true");
  circle.appendChild(icon);
  item.appendChild(circle);

  const info = document.createElement("div");
  info.className = "progress-badge-info";

  const top = document.createElement("div");
  top.className = "progress-badge-top";

  const name = document.createElement("p");
  name.className = "progress-badge-name";
  name.textContent = badge.name;

  const count = document.createElement("p");
  count.className = "progress-badge-count";
  count.textContent = badge.earned
    ? "Earned!"
    : badge.current + " / " + badge.goal + " " + badge.unit;

  top.append(name, count);

  const description = document.createElement("p");
  description.className = "progress-badge-description";
  description.textContent = badge.description;

  const percent = Math.round((badge.current / badge.goal) * 100);
  const bar = document.createElement("div");
  bar.className = "progress";
  bar.setAttribute("role", "progressbar");
  bar.setAttribute("aria-label", badge.name + " progress");
  bar.setAttribute("aria-valuemin", "0");
  bar.setAttribute("aria-valuemax", String(badge.goal));
  bar.setAttribute("aria-valuenow", String(badge.current));
  const fill = document.createElement("div");
  fill.className = "progress-bar";
  fill.style.width = percent + "%";
  bar.appendChild(fill);

  info.append(top, description, bar);
  row.append(item, info);
  return row;
}

onAuthReady(async function (user) {
  if (!user) {
    location.href = "login.html";
    return;
  }

  // Daily streak (already updated when the quiz was completed).
  try {
    const { currentStreak, completedToday } = await getStreakData(user);
    streakEl.textContent = currentStreak;
    unitEl.textContent = currentStreak === 1 ? "day" : "days";
    noteEl.textContent = completedToday
      ? "Nice work! Come back tomorrow to keep it going."
      : "Take today's quiz to keep your streak going.";
  } catch (error) {
    console.error("Could not load streak:", error);
    noteEl.textContent = "Couldn't load your streak. Please refresh and try again.";
  }

  // Progress towards each badge, from the user's quiz history.
  try {
    const [completed, perfect] = await Promise.all([
      getCompletedQuizCount(user),
      getPerfectQuizCount(user),
    ]);

    listEl.replaceChildren(
      ...getBadges({ completed, perfect }).map(renderBadgeRow)
    );
  } catch (error) {
    console.error("Could not load badge progress:", error);
    document.getElementById("progress-status").textContent =
      "Couldn't load your badges. Please refresh and try again.";
  }
});
