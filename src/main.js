import { onAuthReady } from "/src/authentication.js";

// If you have custom global styles, import them as well:
// import '../styles/style.css';


// --------------------------------------
// Get user's name function
// --------------------------------------
function showName() {
    // Pass a CALLBACK function to run when Firebase finishes checking login status
    onAuthReady(function(user) {  // Firebase passes the user object (or null)
        if (user) {
            // User is logged in
            const name = user.displayName || user.email;  // Use email if name is missing
            document.getElementById("name-goes-here").textContent = name;
        } else {
            // User is NOT logged in
            location.href = "index.html";  // Redirect to login page
        }
    });
}

showName();

// document.addEventListener('DOMContentLoaded', sayHello);
