// src/badges.js
// Profile badges. Add a new badge by adding one entry to BADGES.
//   completed - how many quizzes the user has completed
//   perfect   - how many of those were scored 100%

const BADGES = [
  {
    id: "first-quiz",
    icon: "bi-patch-check-fill",
    name: "First Quiz",
    description: "Complete 1 quiz",
    isEarned: (stats) => stats.completed >= 1,
  },
  {
    id: "three-quizzes",
    icon: "bi-trophy-fill",
    name: "Quiz Regular",
    description: "Complete 3 quizzes",
    isEarned: (stats) => stats.completed >= 3,
  },
  {
    id: "perfect-score",
    icon: "bi-star-fill",
    name: "Perfect Score",
    description: "Score 100% on a quiz",
    isEarned: (stats) => stats.perfect >= 1,
  },
];

export function getBadges(stats) {
  return BADGES.map(function (badge) {
    return { ...badge, earned: badge.isEarned(stats) };
  });
}

export function renderBadges(container, badges) {
  container.replaceChildren();

  badges.forEach(function (badge) {
    const col = document.createElement("div");
    col.className = "col-4";

    const item = document.createElement("div");
    item.className = "badge-item " + (badge.earned ? "earned" : "locked");

    const circle = document.createElement("div");
    circle.className = "badge-circle";
    const icon = document.createElement("i");
    icon.className = "bi " + (badge.earned ? badge.icon : "bi-lock-fill");
    icon.setAttribute("aria-hidden", "true");
    circle.appendChild(icon);

    const name = document.createElement("p");
    name.className = "badge-name";
    name.textContent = badge.name;

    const description = document.createElement("p");
    description.className = "badge-description";
    description.textContent = badge.description;

    const status = document.createElement("p");
    status.className = "badge-status";
    status.textContent = badge.earned ? "Earned" : "Locked";

    item.append(circle, name, description, status);
    col.appendChild(item);
    container.appendChild(col);
  });
}