// src/settings.js
// Runs on settings.html. Lets the user change their username and email.
// Changes are saved in Firebase Authentication and on users/{uid} in Firestore.

import { auth, db } from "/src/firebaseConfig.js";
import { onAuthReady, authErrorMessage } from "/src/authentication.js";
import { doc, getDoc, setDoc } from "firebase/firestore";
import {
  updateProfile,
  verifyBeforeUpdateEmail,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";

const nameForm = document.getElementById("name-form");
const nameInput = document.getElementById("name-input");
const nameStatus = document.getElementById("name-status");

const emailForm = document.getElementById("email-form");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const emailStatus = document.getElementById("email-status");

let currentUser = null;

onAuthReady(async function (user) {
  if (!user) {
    location.href = "login.html";
    return;
  }

  currentUser = user;

  nameInput.value = user.displayName || "";
  emailInput.value = user.email || "";


  try {
    const userRef = doc(db, "users", user.uid);
    const data = (await getDoc(userRef)).data() || {};

    if (data.email !== user.email) {
      await setDoc(userRef, { email: user.email }, { merge: true });
    }
  } catch (error) {
    console.error("Could not sync email:", error);
  }
});

nameForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const newName = nameInput.value.trim();

  if (newName === "") {
    nameStatus.textContent = "Please enter a username.";
    return;
  }

  try {
    await updateProfile(currentUser, { displayName: newName });

    await setDoc(doc(db, "users", currentUser.uid), { name: newName }, { merge: true });

    nameStatus.textContent = "Username saved!";
  } catch (error) {
    console.error("Could not save username:", error);
    nameStatus.textContent = "Could not save your username. Please try again.";
  }
});

emailForm.addEventListener("submit", async function (event) {
  event.preventDefault();

  const newEmail = emailInput.value.trim();
  const password = passwordInput.value;

  if (newEmail === currentUser.email) {
    emailStatus.textContent = "That is already your email.";
    return;
  }

  try {
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    await reauthenticateWithCredential(currentUser, credential);

    await verifyBeforeUpdateEmail(auth.currentUser, newEmail);

    passwordInput.value = "";
    emailStatus.textContent =
      "We sent a verification link to " + newEmail +
      ". Your email changes after you click it.";
  } catch (error) {
    console.error("Could not change email:", error);
    emailStatus.textContent = authErrorMessage(error);
  }
});