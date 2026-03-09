document.addEventListener("DOMContentLoaded", () => {
    console.log("Admin dashboard loaded");
});

/* VACANCY FUNCTIONS */
function openAddVacancy(){
    const modal = new bootstrap.Modal(
        document.getElementById("addVacancyModal")
    );
    modal.show();
}
function editVacancy(id){
    alert("Edit vacancy feature coming soon.");

}
function deleteVacancy(id){
    const confirmDelete = confirm("Delete this vacancy?");
    if(confirmDelete){
        alert("Vacancy removed (template only).");
    }
}

/* APPLICATION FUNCTIONS */
function approveApplicant(id){

    alert("Applicant approved.");

}
function declineApplicant(id){

    const confirmDecline = confirm("Decline this application?");

    if(confirmDecline){
        alert("Application declined.");
    }

}
function viewApplicant(id){

    alert("View applicant profile.");
}