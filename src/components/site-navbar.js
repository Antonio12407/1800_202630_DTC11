import { logoutUser } from '/src/authentication.js';   // Our function to log out the user
import { onAuthReady } from "/src/authentication.js";  // Our function to get authenticated user

class SiteNavbar extends HTMLElement {
    constructor() {
        super();
        this.renderNavbar();
        this.renderAuthControls();
    }

    renderNavbar() {
        this.innerHTML = `
            <!--- Top Navbar Section starts --->
            <nav class="navbar bg-secondary-subtle fixed-top d-none d-md-block px-2">
            <div class="container-fluid">

                <!-- Left side: logo + app name, then Home -->
                <div class="d-flex align-items-center gap-4">
                    <a class="navbar-brand d-flex align-items-center gap-3 m-0" href="#">
                        <img src="./images/quaggle-quagga-transparent.png" alt="Quaggle logo" width="80" height="70">
                        <span class="fw-bold"
                            style="font-family: 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 34px; letter-spacing: -1px;">Quaggle</span>
                    </a>

                    <a href="#" class="text-dark text-decoration-none d-flex align-items-center gap-2 mx-2">
                        <i class="bi bi-house-fill fs-1" aria-hidden="true"></i>
                        <span class="fs-5">Home</span>
                    </a>
                </div>

                <!-- Right side: Profile and Settings -->
                <div class="d-flex align-items-center gap-4">
                    <div id="authControlsDesktop"></div>

                    <a href="#" class="text-dark text-decoration-none d-flex align-items-center gap-2">
                        <span class="fs-5">Settings</span>
                        <i class="bi bi-gear-fill fs-1" aria-hidden="true"></i>
                    </a>
                </div>

            </div>
        </nav>
        <!--- Top Navbar Section ends --->

        <!-- Bottom Navbar Section starts -->
        <nav class="navbar bg-secondary-subtle fixed-bottom d-md-none">
            <div class="container-fluid flex-nowrap gap-3">

                <div class="text-dark text-center flex-fill">
                    <i class="bi bi-house-fill fs-1" aria-hidden="true"></i>
                    <small class="d-block">Home</small>
                </div>

                <div id="authControls" class="text-center flex-fill"></div>

                <a href="#" class="text-dark text-decoration-none text-center flex-fill">
                    <i class="bi bi-gear-fill fs-1" aria-hidden="true"></i>
                    <small class="d-block">Settings</small>
                </a>

            </div>
        </nav>
        <!-- Bottom Navbar Section ends -->
        `;
    }

    /**
     * Displays Log in or Log out button in the navbar based on Firebase authentication status.
     * Updates automatically when the user's login status changes.
     */
    renderAuthControls() {
        const authControls = this.querySelector('#authControls');               // mobile
        const authControlsDesktop = this.querySelector('#authControlsDesktop'); // desktop

        // Pass a callback that runs when Firebase reports the login status
        onAuthReady(function (user) { // Receives the user object (or null)

            if (user) { // User is logged in
                authControls.innerHTML = `<a href="index.html" id="signOutBtn" class="text-dark text-decoration-none d-block">
                        <i class="bi bi-person-fill fs-1" aria-hidden="true"></i>
                        <small class="d-block">Log out</small>
                    </a>`;

                authControlsDesktop.innerHTML = `<a href="index.html" id="signOutBtnDesktop" class="text-dark text-decoration-none d-flex align-items-center gap-2">
                        <span class="fs-5">Log out</span>
                        <i class="bi bi-person-fill fs-1" aria-hidden="true"></i>
                    </a>`;

                authControls.querySelector('#signOutBtn').addEventListener('click', logoutUser);
                authControlsDesktop.querySelector('#signOutBtnDesktop').addEventListener('click', logoutUser);

            } else { // User is NOT logged in
                authControls.innerHTML = `<a href="login.html" class="text-dark text-decoration-none d-block">
                        <i class="bi bi-person-fill fs-1" aria-hidden="true"></i>
                        <small class="d-block">Log in</small>
                    </a>`;

                authControlsDesktop.innerHTML = `<a href="login.html" class="text-dark text-decoration-none d-flex align-items-center gap-2">
                        <span class="fs-5">Log in</span>
                        <i class="bi bi-person-fill fs-1" aria-hidden="true"></i>
                    </a>`;
            }
        });
    }
}

customElements.define('site-navbar', SiteNavbar);