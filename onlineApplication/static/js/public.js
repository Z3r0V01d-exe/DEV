window.addEventListener("scroll", function () {
    const navbar = document.getElementById("mainNavbar");

    if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

function renderNavbar() {
    const menu = document.getElementById("userMenu");
    const user = localStorage.getItem("userRole");

    if (!user) {
        menu.innerHTML = `
            <li><a class="dropdown-item" href="#" onclick="login('applicant')">Login as Applicant</a></li>
            <li><a class="dropdown-item" href="#" onclick="login('admin')">Login as Admin</a></li>
        `;
    } 
    else if (user === "applicant") {
        menu.innerHTML = `
            <li><a class="dropdown-item" href="#">My Application</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" onclick="logout()">Logout</a></li>
        `;
    } 
    else if (user === "admin") {
        menu.innerHTML = `
            <li><a class="dropdown-item" href="#">Admin Dashboard</a></li>
            <li><a class="dropdown-item" href="#">Manage Applications</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" onclick="logout()">Logout</a></li>
        `;
    }
}

function login(role) {
    localStorage.setItem("userRole", role);
    renderNavbar();
}

function logout() {
    localStorage.removeItem("userRole");
    renderNavbar();
}

document.addEventListener("DOMContentLoaded", renderNavbar);