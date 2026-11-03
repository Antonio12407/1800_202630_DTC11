import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// --------------------------------------
// Get today's date
// --------------------------------------

const dateElement = document.getElementById("formatted-date");
const today = new Date();
const day = today.getDate();
const month = today.getMonth(); // 0-based, matches the months array
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const year = today.getFullYear();

dateElement.textContent =`${months[month]} ${day}, ${year}`;