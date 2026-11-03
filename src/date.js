import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// --------------------------------------
// Show today's date, e.g. "November 3, 2026"
// --------------------------------------

document.getElementById("formatted-date").textContent =
    new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
    });
