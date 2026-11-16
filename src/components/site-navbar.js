import { onAuthReady } from "/src/authentication.js";  // Our function to get authenticated user

class SiteNavbar extends HTMLElement {
    constructor() {
        super();
        this.renderNavbar();
        this.updateProfileLinks();
    }

    renderNavbar() {
        this.innerHTML = `
            <!--- Top Navbar Section starts --->
            <nav class="navbar bg-secondary-subtle fixed-top d-none d-md-block px-2">
            <div class="container-fluid">

                <!-- Left side: logo + app name, then Home -->
                <div class="d-flex align-items-center gap-4">
                    <a class="navbar-brand d-flex align-items-center gap-3 m-0" href="#">
                        <img src="./images/quagga_logo.png" alt="Quaggle logo" width="80" height="62">
                        <span class="fw-bold"
                            style="font-family: 'Bricolage Grotesque', Helvetica, sans-serif; font-size: 34px; letter-spacing: -1px;">Quaggle</span>
                    </a>

                    <a href="main.html" class="text-dark text-decoration-none d-flex align-items-center gap-2 mx-2">
                        <i class="bi bi-house-fill fs-1" aria-hidden="true"></i>
                        <span class="fs-5">Home</span>
                    </a>
                </div>

                <!-- Right side: Profile and Settings -->
                <div class="d-flex align-items-center gap-4">
                    <a href="profile.html" class="profile-link text-dark text-decoration-none d-flex align-items-center gap-2">
                        <span class="fs-5">Profile</span>
                        <i class="bi bi-person-circle fs-1" aria-hidden="true"></i>
                    </a>

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

                <a href="main.html" class="text-dark text-decoration-none text-center flex-fill">
                    <i class="bi bi-house-fill fs-1" aria-hidden="true"></i>
                    <small class="d-block">Home</small>
                </a>

                <a href="profile.html" class="profile-link text-dark text-decoration-none text-center flex-fill">
                    <i class="bi bi-person-circle fs-1" aria-hidden="true"></i>
                    <small class="d-block">Profile</small>
                </a>

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
     * The navbar always shows Profile (there is no Log in / Log out here:
     * Log in is on the home page, Log out is on the profile page).
     * When logged out, Profile goes straight to the login page.
     * Updates automatically when the user's login status changes.
     */
    updateProfileLinks() {
        const profileLinks = this.querySelectorAll(".profile-link"); // desktop + mobile

        onAuthReady(function (user) {
            profileLinks.forEach(function (link) {
                link.href = user ? "profile.html" : "login.html";
            });
        });
    }
}

customElements.define('site-navbar', SiteNavbar);
