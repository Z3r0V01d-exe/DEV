window.addEventListener("scroll", function () {
    const navbar = document.getElementById("mainNavbar");

    if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

// ===============================
// NAVBAR LOGIN SYSTEM
// ===============================

let selectedRole = null;

document.addEventListener("DOMContentLoaded", function () {
    renderNavbar();

    // Scroll shadow effect
    window.addEventListener("scroll", function () {
        const navbar = document.getElementById("mainNavbar");
        if (window.scrollY > 20) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });
});


// ===============================
// RENDER NAVBAR BASED ON ROLE
// ===============================
function renderNavbar() {
    const menu = document.getElementById("userMenu");
    const user = localStorage.getItem("userRole");

    if (!user) {
        menu.innerHTML = `
            <li>
                <a class="dropdown-item" href="#" onclick="login('applicant')">
                    <i class="bi bi-person"></i> Login as Applicant
                </a>
            </li>
            <li>
                <a class="dropdown-item" href="#" onclick="login('admin')">
                    <i class="bi bi-shield-lock"></i> Login as Admin
                </a>
            </li>
        `;
    } 
    else if (user === "applicant") {
        menu.innerHTML = `
            <li>
                <a class="dropdown-item" href="#">
                    <i class="bi bi-file-earmark-text"></i> My Application
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
    else if (user === "admin") {
        menu.innerHTML = `
            <li>
                <a class="dropdown-item" href="#">
                    <i class="bi bi-speedometer2"></i> Admin Dashboard
                </a>
            </li>
            <li>
                <a class="dropdown-item" href="#">
                    <i class="bi bi-folder-check"></i> Manage Applications
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
// LOGIN FUNCTION
// ===============================
function login(role) {
    selectedRole = role;

    const title = document.getElementById("loginTitle");
    const registerOption = document.getElementById("registerOption");

    if (role === "admin") {
        title.innerText = "Admin Login";
        registerOption.style.display = "none";
    } else {
        title.innerText = "Applicant Login";
        registerOption.style.display = "block";
    }

    const loginModal = new bootstrap.Modal(document.getElementById("loginModal"));
    loginModal.show();
}


// ===============================
// LOGIN FORM SUBMIT
// ===============================
document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    if (!selectedRole) return;

    // ✅ Save logged-in role in browser storage
    localStorage.setItem("userRole", selectedRole);

    const modalEl = document.getElementById("loginModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();

    this.reset();
    renderNavbar();

    // ===============================
    // 🔵 REDIRECT AFTER LOGIN
    // ===============================
    // If Admin logs in → go to Admin Dashboard
    if (selectedRole === "admin") {
        window.location.assign = "/admin/admin-dashboard.html";
        // 🔴 Change filename if needed
    } 
    // If Applicant logs in → go to Application page
    else if (selectedRole === "applicant") {
        window.location.assign("/applicant/applicant-dashboard.html");
        // 🔴 Change filename if needed
    }
});

function switchToRegister() {
    const loginModalEl = document.getElementById("loginModal");
    const loginModal = bootstrap.Modal.getInstance(loginModalEl);
    loginModal.hide();

    const registerModal = new bootstrap.Modal(document.getElementById("registerModal"));
    registerModal.show();
}

// ===============================
// REGISTER MODAL
// ===============================
function openRegister() {
    const registerModal = new bootstrap.Modal(document.getElementById("registerModal"));
    registerModal.show();
}

document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    if (registerPassword.value !== confirmPassword.value) {
        confirmPassword.classList.add("is-invalid");
        return;
    }

    // Auto-login as applicant
    localStorage.setItem("userRole", "applicant");

    const modalEl = document.getElementById("registerModal");
    const modalInstance = bootstrap.Modal.getInstance(modalEl);
    modalInstance.hide();

    this.reset();
    renderNavbar();

});

const emailInput = document.getElementById("registerEmail");

emailInput.addEventListener("input", function () {
    if (emailInput.validity.typeMismatch) {
        emailInput.classList.add("is-invalid");
    } else {
        emailInput.classList.remove("is-invalid");
    }
});

document.addEventListener("DOMContentLoaded", function () {

    const registerForm = document.getElementById("registerForm");
    const registerPassword = document.getElementById("registerPassword");
    const confirmPassword = document.getElementById("confirmPassword");
    const passwordMatchFeedback = document.getElementById("passwordMatchFeedback");

    const strengthBar = document.getElementById("passwordStrengthBar");
    const strengthText = document.getElementById("passwordStrengthText");

    const emailInput = document.getElementById("registerEmail");

    // =========================
    // EMAIL VALIDATION
    // =========================
    const emailFeedback = document.getElementById("emailFeedback");

    emailInput.addEventListener("input", function () {

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

        if (!emailPattern.test(emailInput.value)) {
            emailInput.classList.add("is-invalid");
            emailFeedback.innerText = "Enter a valid email (example@email.com)";
        } else {
            emailInput.classList.remove("is-invalid");
            emailFeedback.innerText = "";
        }
    });

    // =========================
    // CONTACT NUMBER VALIDATION
    // =========================
    const contactInput = document.getElementById("registerContact");
    const contactFeedback = document.getElementById("contactFeedback");

    contactInput.addEventListener("input", function () {

        // Accept:
        // +639XXXXXXXXX (13 chars)
        // 09XXXXXXXXX (11 chars)

        const phPattern = /^(\+63|09)\d{9}$/;

        if (!phPattern.test(contactInput.value)) {
            contactInput.classList.add("is-invalid");
            contactFeedback.innerText = "Enter valid PH number (+639XXXXXXXXX or 09XXXXXXXXX)";
        } else {
            contactInput.classList.remove("is-invalid");
            contactFeedback.innerText = "";
        }
    });

    //==========================
    // PDF FILE VALIDATION
    //==========================
    const resumeInput = document.getElementById("registerResume");
    const resumeFeedback = document.getElementById("resumeFeedback");

    resumeInput.addEventListener("change", function () {

        const file = resumeInput.files[0];
        if (!file) return;

        const fileName = file.name.toLowerCase();

        const pattern = /^[a-z]+_[a-z]+_resume\.pdf$/;

        if (!pattern.test(fileName)) {
            resumeInput.classList.add("is-invalid");
            resumeFeedback.innerText = 
            "Filename must be: surname_firstname_resume.pdf";
            resumeInput.value = "";
        } else {
            resumeInput.classList.remove("is-invalid");
            resumeFeedback.innerText = "";
        }
    });

    // =========================
    // PASSWORD STRENGTH
    // =========================
    registerPassword.addEventListener("input", function () {

        const value = registerPassword.value;
        let strength = 0;

        if (value.length >= 6) strength++;
        if (/[A-Z]/.test(value)) strength++;
        if (/[0-9]/.test(value)) strength++;
        if (/[^A-Za-z0-9]/.test(value)) strength++;

        strengthBar.classList.remove("bg-danger", "bg-warning", "bg-info", "bg-success");

        switch (strength) {
            case 0:
                strengthBar.style.width = "0%";
                strengthText.innerText = "";
                break;

            case 1:
                strengthBar.style.width = "25%";
                strengthBar.classList.add("bg-danger");
                strengthText.innerText = "Weak";
                break;

            case 2:
                strengthBar.style.width = "50%";
                strengthBar.classList.add("bg-warning");
                strengthText.innerText = "Moderate";
                break;

            case 3:
                strengthBar.style.width = "75%";
                strengthBar.classList.add("bg-info");
                strengthText.innerText = "Strong";
                break;

            case 4:
                strengthBar.style.width = "100%";
                strengthBar.classList.add("bg-success");
                strengthText.innerText = "Very Strong";
                break;
        }

        validatePasswordMatch();
    });

    // =========================
    // PASSWORD MATCH CHECK
    // =========================
    function validatePasswordMatch() {

        if (confirmPassword.value === "") {
            confirmPassword.classList.remove("is-valid", "is-invalid");
            passwordMatchFeedback.innerText = "";
            return;
        }

        if (registerPassword.value === confirmPassword.value) {
            confirmPassword.classList.remove("is-invalid");
            confirmPassword.classList.add("is-valid");
            passwordMatchFeedback.innerText = "Passwords match";
            passwordMatchFeedback.style.color = "green";
        } else {
            confirmPassword.classList.remove("is-valid");
            confirmPassword.classList.add("is-invalid");
            passwordMatchFeedback.innerText = "Passwords do not match";
            passwordMatchFeedback.style.color = "red";
        }
    }

    confirmPassword.addEventListener("input", validatePasswordMatch);

    // =========================
    // REGISTER SUBMIT
    // =========================
    registerForm.addEventListener("submit", function (e) {
        e.preventDefault();

        if (registerPassword.value !== confirmPassword.value) {
            confirmPassword.classList.add("is-invalid");
            passwordMatchFeedback.innerText = "Passwords do not match";
            passwordMatchFeedback.style.color = "red";
            return;
        }

        if (
            emailInput.classList.contains("is-invalid") ||
            contactInput.classList.contains("is-invalid") ||
            resumeInput.classList.contains("is-invalid")
        ) {
            alert("Please fix all errors before submitting.");
            return;
        }

        // Auto-login
        localStorage.setItem("userRole", "applicant");

        const modalEl = document.getElementById("registerModal");
        const modalInstance = bootstrap.Modal.getInstance(modalEl);
        modalInstance.hide();

        registerForm.reset();
        strengthBar.style.width = "0%";
        strengthText.innerText = "";
        confirmPassword.classList.remove("is-valid");

        renderNavbar();

        window.location.assign("/applicant/applicant-dashboard.html");
    });

    // ===============================
    // PROTECT BUTTONS - REQUIRE LOGIN
    // ===============================
    const protectedLinks = document.querySelectorAll(".require-login");

    protectedLinks.forEach(link => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            const user = localStorage.getItem("userRole");

            if (!user) {
                login("applicant");
            } 

            else if (user === "admin") {
                window.location.assign("/admin/admin-dashboard.html"); 
                // 🔴 Change this to your actual admin page file
            } 
            else if (user === "applicant") {
                window.location.assign("/applicant/applicant-dashboard.html"); 
            }
        });
    });

});

function backToLogin() {
    const registerModalEl = document.getElementById("registerModal");
    const registerModal = bootstrap.Modal.getInstance(registerModalEl);
    registerModal.hide();

    login("applicant"); // reopen applicant login
}


// ===============================
// LOGOUT
// ===============================
function logout() {
    localStorage.removeItem("userRole");
    renderNavbar();
}