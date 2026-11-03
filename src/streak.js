// src/streak.js
// -------------------------------------------------------------
// Saves and loads each user's quiz streak in Firestore, so it survives
// page refreshes, browser restarts, and switching devices.
//
// Firestore layout:  users/{uid}  ->  { streak, lastCompletedDate }
// -------------------------------------------------------------

import { db } from "/src/firebaseConfig.js";
import { doc, getDoc, runTransaction } from "firebase/firestore";
import { applyCompletion, effectiveStreak } from "/src/streakLogic.js";

const userRef = (uid) => doc(db, "users", uid);

// Loads the saved data for a user.
// Returns { streak, lastCompletedDate }, where `streak` is already 0 if
// the streak has been broken (missed a day).
export async function getStreakData(uid) {
  const snap = await getDoc(userRef(uid));
  const data = snap.exists() ? snap.data() : null;
  return {
    streak: effectiveStreak(data),
    lastCompletedDate: data?.lastCompletedDate ?? null,
  };
}

// Call once when the user finishes a quiz.
// Uses a transaction so a double click or two open tabs can't count twice.
// Returns { streak, lastCompletedDate, changed }.
export async function recordQuizCompletion(uid) {
  return runTransaction(db, async (tx) => {
    const ref = userRef(uid);
    const snap = await tx.get(ref);
    const result = applyCompletion(snap.exists() ? snap.data() : null);

    if (result.changed) {
      tx.set(
        ref,
        { streak: result.streak, lastCompletedDate: result.lastCompletedDate },
        { merge: true },
      );
    }
    return result;
  });
}
