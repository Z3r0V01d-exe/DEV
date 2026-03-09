document.addEventListener("DOMContentLoaded", () => {
    // Template admin user (replace later with database)
    const adminUser = {
        name: "Administrator"
    };
    const nameElement = document.getElementById("adminName");
    if(nameElement){
        nameElement.textContent = adminUser.name;
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
        localStorage.removeItem("admin");
        window.location.href = "../index.html";
}