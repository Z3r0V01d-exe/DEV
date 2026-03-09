document.addEventListener("DOMContentLoaded", function(){

    const applications = JSON.parse(localStorage.getItem("applications")) || [];

    const emptyState = document.getElementById("noApplicationState");
    const grid = document.getElementById("applicationsGrid");

    // If no applications
    if(applications.length === 0){
        emptyState.style.display = "block";
        grid.classList.add("d-none");
        return;
    }

    // If applications exist
    emptyState.style.display = "none";
    grid.classList.remove("d-none");

    applications.forEach(app => {

        const card = document.createElement("div");
        card.classList.add("application-card");

        card.innerHTML = `
            <div class="application-title">${app.position}</div>
            <div class="application-office">${app.office}</div>
            <div class="application-date">Applied: ${app.date}</div>

            <div class="application-status">
                <span class="badge bg-warning text-dark">Pending Review</span>
            </div>

            <div class="application-actions">
                <button class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-eye"></i> View
                </button>
            </div>
        `;

        grid.appendChild(card);

    });

});