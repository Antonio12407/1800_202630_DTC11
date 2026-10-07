import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

// If you have custom global styles, import them as well:
// import '../styles/style.css';

function sayHello() {

}

const dateElement = document.getElementById("formatted-date");
const today = new Date();
const day = today.getDate();
const month = today.getMonth() + 1;
const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];
const year = today.getFullYear();

dateElement.innerHTML = `${months[month]} ${day}, ${year}`;

// document.addEventListener('DOMContentLoaded', sayHello);
