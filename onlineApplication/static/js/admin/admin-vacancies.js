// Modal instance
let addVacancyModal;

// Open modal
function openAddVacancy() {
    const modalElement = document.getElementById('addVacancyModal');
    addVacancyModal = new bootstrap.Modal(modalElement);
    addVacancyModal.show();
}

// Close modal
function closeAddVacancy() {
    if(addVacancyModal){
        addVacancyModal.hide();
    }
}


// Save vacancy (template only)
function saveVacancy() {

    const title = document.getElementById("positionTitle").value;
    const office = document.getElementById("denrOffice").value;
    const closingDate = document.getElementById("closingDate").value;
    const description = document.getElementById("jobDescription").value;

    console.log("Position:", title);
    console.log("Office:", office);
    console.log("Closing Date:", closingDate);
    console.log("Description:", description);

    alert("Vacancy saved (template only)");

    closeAddVacancy();
}

// Edit Vacancy
function editVacancy(id) {
    alert("Edit vacancy ID: " + id);
}


// Close Vacancy
function closeVacancy(id) {
    if(confirm("Are you sure you want to close this vacancy?")){
        alert("Vacancy closed: " + id);
    }
}   

// Delete Vacancy
function deleteVacancy(id) {
    if(confirm("Delete this vacancy permanently?")){

        alert("Vacancy deleted: " + id);
    }
}