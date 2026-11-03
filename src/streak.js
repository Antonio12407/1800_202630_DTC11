import { db } from "./firebaseConfig.js";
import { doc, getDoc, setDoc } from "firebase/firestore";

// Get today's date in YYYY-MM-DD format.
export function getTodayDate() {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return year + "-" + month + "-" + day;
}

// Find how many calendar days are between two dates.
function daysBetween(firstDate, secondDate) {
  const first = firstDate.split("-").map(Number);
  const second = secondDate.split("-").map(Number);

  const firstDay = Date.UTC(
    first[0], first[1] - 1, first[2]
  );

  const secondDay = Date.UTC(
    second[0], second[1] - 1, second[2]
  );

  return Math.round(
    (secondDay - firstDay) / (1000 * 60 * 60 * 24)
  );
}

// Called when the user submits a completed quiz.
export async function recordQuizCompletion(user) {
  if (!user) {
    throw new Error("Please sign in first.");
  }

  const userRef = doc(db, "Users", user.uid);
  const userSnap = await getDoc(userRef);

  let currentStreak = 0;
  let lastQuizDate = "";

  // Load existing streak data if available.
  if (userSnap.exists()) {
    const data = userSnap.data();

    currentStreak = data.currentStreak || 0;
    lastQuizDate = data.lastQuizDate || "";
  }

  const today = getTodayDate();

  // A quiz was already completed today.
  // Do not increase the streak again.
  if (lastQuizDate === today) {
    return currentStreak;
  }

  let newStreak = 1;

  if (lastQuizDate !== "") {
    const difference = daysBetween(lastQuizDate, today);

    if (difference < 0) {
      throw new Error("The device date appears incorrect.");
    }

    if (difference === 1) {
      // Completed a quiz yesterday.
      newStreak = currentStreak + 1;
    } else {
      // Missed at least one full calendar day.
      newStreak = 1;
    }
  }

  // Save the updated streak and completion date.
  await setDoc(userRef, {
    currentStreak: newStreak,
    lastQuizDate: today
  }, { merge: true });

  console.log("Current streak:", newStreak);

  return newStreak;
}

// Called when the dashboard loads.
export async function getStreakData(user) {
  if (!user) {
    throw new Error("Please sign in first.");
  }

  const userRef = doc(db, "Users", user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    return {
      currentStreak: 0,
      lastQuizDate: ""
    };
  }

  const data = userSnap.data();

  let currentStreak = data.currentStreak || 0;
  const lastQuizDate = data.lastQuizDate || "";

  const today = getTodayDate();

  if (lastQuizDate !== "") {
    const difference = daysBetween(lastQuizDate, today);

    // Reset when at least one full day was missed.
    if (difference > 1 && currentStreak !== 0) {
      currentStreak = 0;

      await setDoc(userRef, {
        currentStreak: 0
      }, { merge: true });
    }
  }

  return {
    currentStreak: currentStreak,
    lastQuizDate: lastQuizDate
  };
}