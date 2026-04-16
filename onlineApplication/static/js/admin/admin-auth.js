document.addEventListener("DOMContentLoaded", () => {
    const adminName = localStorage.getItem("userName"); // from login
    const userRole = localStorage.getItem("userRole");

    const nameElement = document.getElementById("navUserName");

    // 🔐 Protect admin pages
    if (userRole !== "admin") {
        window.location.href = "../index.html";
        return;
    }

    // ✅ Show real admin name
    if (nameElement && adminName) {
        nameElement.textContent = adminName;
    } else if (nameElement) {
        nameElement.textContent = "Administrator";
    }
});

/* ==========================
   NAVIGATION FUNCTIONS
========================== */

function goAdminDashboard(){
    window.location.href = "../admin/admin-dashboard.html";
}

function goManageVacancies(){
    window.location.href = "../admin/admin-vacancies.html";
}

function goApplicants(){
    window.location.href = "../admin/admin-applicants.html";
}

function goReports(){
    window.location.href = "../admin/admin-reports.html";
}

function adminProfile(){
    window.location.href = "../admin/admin-profile.html";
}

/* ==========================
   LOGOUT
========================== */

function adminLogout(){
        localStorage.clear();
        window.location.href = "../index.html";
}