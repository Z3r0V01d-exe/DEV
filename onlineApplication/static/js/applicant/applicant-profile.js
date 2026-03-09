document.addEventListener("DOMContentLoaded", () => {
    // Empty template state
    document.getElementById("profileFullName").textContent = "";
    document.getElementById("profileEmail").textContent = "";

    document.getElementById("firstName").textContent = "";
    document.getElementById("lastName").textContent = "";
    document.getElementById("phone").textContent = "";
    document.getElementById("address").textContent = "";
});

/* =========================
   PROFILE FUNCTIONS
========================= */

function editProfile() {
    alert("Edit Profile feature will be available soon.");
}

function editPersonalInfo() {
    alert("Personal Information editing will be implemented later.");
}

/* =========================
   ACCOUNT FUNCTIONS
========================= */

function changePassword() {
    alert("Change Password feature coming soon.");
}

function logoutUser() {
    const confirmLogout = confirm("Are you sure you want to logout?");
    if(confirmLogout){
        // Later replace with session destroy
        localStorage.removeItem("user");
        window.location.href = "../index.html";
    }
}

/* =========================
   DOCUMENT FUNCTIONS
========================= */

function uploadDocument(type) {
    alert("Upload " + type + " document feature coming soon.");
}

function replaceDocument(type) {
    alert("Replace " + type + " document feature coming soon.");
}