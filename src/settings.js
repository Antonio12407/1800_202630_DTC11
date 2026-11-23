import { db } from "./firebaseConfig.js";
import { onAuthReady, authErrorMessage, logoutUser } from "./authentication.js";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";

let currentUser = null;
let loggingOut = false;

onAuthReady(async function (user) {
  if (!user) {
    if (!loggingOut) location.href = "login.html";
    return;
  }

  currentUser = user;

  const userDoc = await getDoc(doc(db, "users", user.uid));
  const data = userDoc.data() || {};

  document.getElementById("nameInput").value =
    data.name || user.displayName || "";
});

function enableEdit() {
  document.getElementById("nameInput").disabled = false;
  document.getElementById("saveBtn").disabled = false;
  document.getElementById("nameInput").focus();
}

document.getElementById("editBtn").addEventListener("click", enableEdit);

function showMessage(text, isError) {
  const alertBox = document.getElementById("profileAlert");
  alertBox.textContent = text;
  alertBox.className = isError ? "alert alert-danger" : "alert alert-success";
}

async function saveProfile(event) {
  event.preventDefault();

  const newName = document.getElementById("nameInput").value.trim();

  if (newName === "") {
    showMessage("Please enter a username.", true);
    return;
  }

  if (newName === currentUser.displayName) {
    showMessage("Nothing changed.", false);
    return;
  }

  try {
    await updateProfile(currentUser, { displayName: newName });

    // ...and on the user's Firestore document.
    await updateDoc(doc(db, "users", currentUser.uid), { name: newName });

    // Lock the form again and show a confirmation
    document.getElementById("nameInput").disabled = true;
    document.getElementById("saveBtn").disabled = true;
    showMessage("Username saved!", false);
  } catch (error) {
    console.error("Could not save username:", error);
    showMessage(authErrorMessage(error), true);
  }
}

document.getElementById("profileForm").addEventListener("submit", saveProfile);

const logoutBtn = document.getElementById("logout-button");
const logoutStatus = document.getElementById("logout-status");

logoutBtn.addEventListener("click", async function () {
  loggingOut = true;
  logoutBtn.disabled = true;

  try {
    await logoutUser();
  } catch (error) {
    console.error("Could not log out:", error);
    loggingOut = false;
    logoutBtn.disabled = false;
    logoutStatus.textContent = "Couldn't log out. Please try again.";
  }
});