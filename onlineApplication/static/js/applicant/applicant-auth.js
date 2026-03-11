document.addEventListener("DOMContentLoaded", function () {
    checkApplicantAccess();
    renderApplicantNavbar();
    loadApplicantName();
    highlightActiveNav();
});

// ===============================
// PROTECT APPLICANT PAGES
// ===============================

function checkApplicantAccess() {
    const user = localStorage.getItem("userRole");

    const protectedPages = [
        "applicant-dashboard.html",
        "application.html"
    ];

    const currentPage = window.location.pathname.split("/").pop();

    if (protectedPages.includes(currentPage)) {
        if (user !== "applicant") {
            window.location.href = "../index.html";
        }
    }
}

// ===============================
// NAVBAR
// ===============================

function renderApplicantNavbar() {
    const menu = document.getElementById("userMenu");
    if (!menu) return;

    const user = localStorage.getItem("userRole");

    if (user === "applicant") {
        menu.innerHTML = `
            <li>
                <a class="dropdown-item" href="#" onclick="viewProfile()">
                    <i class="bi bi-person"></i> View Profile
                </a>
            </li>
            <li><hr class="dropdown-divider"></li>
            <li>
                <a class="dropdown-item text-danger" href="#" onclick="logout()">
                    <i class="bi bi-box-arrow-right"></i> Logout
                </a>
            </li>
        `;
    }
}

// ===============================
// LOAD USER NAME
// ===============================

function loadApplicantName() {
    const name = localStorage.getItem("applicantName") || "Applicant";

    const navName = document.getElementById("navUserName");
    const welcomeName = document.getElementById("welcomeUserName");

    if (navName) navName.textContent = name;
    if (welcomeName) welcomeName.textContent = name;
}

// ===============================
// VIEW PROFILE
// ===============================

function viewProfile() {
    // Later you can redirect:
    window.location.href = "../applicant/applicant-profile.html";
}

// ===============================
// LOGOUT
// ===============================

function logout() {
    localStorage.removeItem("userRole");
    localStorage.removeItem("applicantName");

    window.location.href = "../index.html";
}

// ===============================
// SCROLL EFFECT
// ===============================

function setupScrollEffect() {
    const navbar = document.getElementById("mainNavbar");
    if (!navbar) return;

    window.addEventListener("scroll", function () {
        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
}

//==============================
// NAVIGATION BUTTONS
//==============================

function goDashboard() {
    window.location.href = "../applicant/applicant-dashboard.html";
}

function goApplications() {
    window.location.href = "../applicant/applicant-myapplication.html";
}

function goVacancies() {
    window.location.href = "../applicant/applicant-vacancies.html";
}

function highlightActiveNav() {

    const currentPage = window.location.pathname.split("/").pop();

    const links = document.querySelectorAll(".nav-link");

    links.forEach(link => {

        const text = link.textContent.trim();

        if (currentPage === "applicant-dashboard.html" && text.includes("Dashboard")) {
            link.classList.add("active");
        }

        if (currentPage === "applicant-application.html" && text.includes("Applications")) {
            link.classList.add("active");
        }
    });
}