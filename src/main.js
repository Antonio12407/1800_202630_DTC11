import { onAuthReady } from "/src/authentication.js";
import { getStreakData } from "/src/streak.js";

// If you have custom global styles, import them as well:
// import '../styles/style.css';

// --------------------------------------
// Get user's name function
// --------------------------------------
function showName() {
  // Pass a CALLBACK function to run when Firebase finishes checking login status
  onAuthReady(function (user) {
    // Firebase passes the user object (or null)
    if (user) {
      // User is logged in
      const name = user.displayName || user.email; // Use email if name is missing
      document.getElementById("name-goes-here").textContent = name;
    } else {
      // User is NOT logged in
      location.href = "index.html"; // Redirect to login page
    }
  });
}

// --------------------------------------
// Daily quiz limit lockout logic
// --------------------------------------
function checkQuizLimit() {
  const startBtn = document.querySelector(".btn-outline-success");
  const isCompleted = sessionStorage.getItem("quaggle_completed_today");

  if (startBtn) {
    if (isCompleted === "true") {
      // Lock out the quiz button for the session
      startBtn.textContent = "Completed Today";
      startBtn.classList.remove("btn-outline-success");
      startBtn.classList.add("btn-secondary");
      startBtn.disabled = true;
    } else {
      // Allow starting the quiz
      startBtn.addEventListener("click", function () {
        window.location.href = "quiz.html";
      });
    }
  }
}

// Load the saved streak into the badge
onAuthReady(async function (user) {
  if (!user) return; // showName() above already redirects logged-out users
  try {
    const { streak } = await getStreakData(user.uid);
    document.getElementById("streak-count").textContent = streak;
  } catch (err) {
    console.error("Could not load streak:", err);
  }
});

showName();
checkQuizLimit();
export const db = getFirestore(app);
