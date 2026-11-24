import { onAuthReady } from "/src/authentication.js";  // Our function to get authenticated user

// Which navbar tab each page belongs to (page filename without ".html").
// "" is the site root ("/"), which serves index.html.
const TAB_FOR_PAGE = {
    "": "home",
    "index": "home",
    "main": "home",
    "quiz": "home",
    "results": "home",
    "progress": "home",
    "profile": "profile",
    "history": "profile",
    "history-detail": "profile",
    "login": "profile",
    "settings": "settings",
};

class SiteNavbar extends HTMLElement {
    constructor() {
        super();
        this.renderNavbar();
        this.updateProfileLinks();
        this.highlightCurrentTab();
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

                    <a href="main.html" data-tab="home" class="text-dark text-decoration-none d-flex align-items-center gap-2 mx-2">
                        <i class="bi bi-house-fill fs-1" aria-hidden="true"></i>
                        <span class="fs-5 nav-label" data-label="Home">Home</span>
                    </a>
                </div>

                <!-- Right side: Profile and Settings -->
                <div class="d-flex align-items-center gap-4">
                    <a href="profile.html" data-tab="profile" class="profile-link text-dark text-decoration-none d-flex align-items-center gap-2">
                        <span class="fs-5 nav-label" data-label="Profile">Profile</span>
                        <i class="bi bi-person-circle fs-1" aria-hidden="true"></i>
                    </a>

                    <a href="settings.html" data-tab="settings" class="text-dark text-decoration-none d-flex align-items-center gap-2">
                        <span class="fs-5 nav-label" data-label="Settings">Settings</span>
                        <i class="bi bi-gear-fill fs-1" aria-hidden="true"></i>
                    </a>
                </div>

            </div>
        </nav>
        <!--- Top Navbar Section ends --->

        <!-- Bottom Navbar Section starts -->
        <nav class="navbar bg-secondary-subtle fixed-bottom d-md-none">
            <div class="container-fluid flex-nowrap gap-3">

                <a href="main.html" data-tab="home" class="text-dark text-decoration-none text-center flex-fill">
                    <i class="bi bi-house-fill fs-1" aria-hidden="true"></i>
                    <small class="d-block">Home</small>
                </a>

                <a href="profile.html" data-tab="profile" class="profile-link text-dark text-decoration-none text-center flex-fill">
                    <i class="bi bi-person-circle fs-1" aria-hidden="true"></i>
                    <small class="d-block">Profile</small>
                </a>

                <a href="settings.html" data-tab="settings" class="text-dark text-decoration-none text-center flex-fill">
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

    /**
     * Highlights the tab for the current page in both navbars (class
     * "active" + aria-current="page"). Matches on data-tab, not href,
     * because the Profile link's href changes when the user is logged out.
     * Pages not in TAB_FOR_PAGE highlight nothing.
     */
    highlightCurrentTab() {
        const fileName = location.pathname.split("/").pop().toLowerCase();
        const page = fileName.replace(/\.html$/, "");
        const tab = TAB_FOR_PAGE[page];

        if (!tab) return;

        this.querySelectorAll('a[data-tab="' + tab + '"]').forEach(function (link) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        });
    }
}

customElements.define('site-navbar', SiteNavbar);
