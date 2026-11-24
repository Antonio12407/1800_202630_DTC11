import { onAuthReady } from "/src/authentication.js";

// If you have custom global styles, import them as well:
// import '../styles/style.css';

// Keep Start Quiz disabled until the saved completion date is checked.
startBtn.disabled = true;

// Start Quiz goes to the first question.
startBtn.addEventListener("click", function () {
  location.href = "quiz.html";
});

// Show the button as finished for today.
function lockStartButton() {
  startBtn.textContent = "Completed Today";
  startBtn.classList.replace("btn-outline-success", "btn-secondary");
  startBtn.disabled = true;
}

// Show the button as ready (e.g. a new day started while the page was open).
function unlockStartButton() {
  startBtn.textContent = "Start Quiz";
  startBtn.classList.replace("btn-secondary", "btn-outline-success");
  startBtn.disabled = false;
}

let currentUser = null;

// Load the streak and today's status from Firestore and show them.
// getStreakData also resets (and saves) the streak to 0 if a day was missed.
async function refreshStreak() {
  if (!currentUser) return;

  try {
    const { currentStreak, completedToday } = await getStreakData(currentUser);
    if (streakEl) {
      streakEl.textContent = currentStreak;
    }

    // One quiz per day: the saved date decides, so this works
    // across tabs and devices and unlocks again tomorrow.
    if (completedToday) {
      lockStartButton();
    } else {
      unlockStartButton();
    }
  } catch (error) {
    // Don't block the quiz if Firestore can't be reached;
    // submitting still won't count the same day twice.
    console.error("Could not load streak:", error);
    startBtn.disabled = false;
  }
}

onAuthReady(function (user) {
  // Logged-out users go back to the landing page.
  if (!user) {
    location.href = "index.html";
    return;
  }

  currentUser = user;

  // Use email if the user has no display name.
  nameEl.textContent = user.displayName || user.email;

  refreshStreak();
});

// The streak depends on today's date, so re-check it whenever the user
// comes back to this page. Otherwise a tab left open overnight, or a page
// restored with the Back button, keeps showing yesterday's streak.
window.addEventListener("pageshow", function (event) {
  if (event.persisted) refreshStreak();
});

document.addEventListener("visibilitychange", function () {
  if (document.visibilityState === "visible") refreshStreak();
});
