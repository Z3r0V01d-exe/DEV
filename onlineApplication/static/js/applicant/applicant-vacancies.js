document.addEventListener("DOMContentLoaded", () => {

    const vacancies = [];

    const grid = document.getElementById("vacanciesGrid");
    const empty = document.getElementById("noVacancies");

    if (vacancies.length === 0) {
        empty.classList.remove("d-none");
        return;
    }

    vacancies.forEach(job => {

        const card = document.createElement("div");
        card.className = "vacancy-card";

        const closingDate = new Date(job.closing);
        const today = new Date();
        const diffDays = Math.ceil((closingDate - today) / (1000 * 60 * 60 * 24));

        let badge = `<span class="badge bg-success">Open</span>`;

        if (diffDays <= 3) {
            badge = `<span class="badge bg-warning text-dark">Closing Soon</span>`;
        }

        card.innerHTML = `
            <div class="vacancy-header">
                <h3 class="vacancy-title">${job.title}</h3>
                ${badge}
            </div>

            <div class="vacancy-info">

                <div class="vacancy-meta vacancy-office">
                    <i class="bi bi-building"></i>
                    <span>${job.office}</span>
                </div>

                <div class="vacancy-meta">
                    <i class="bi bi-geo-alt"></i>
                    <span>${job.location}</span>
                </div>

                <div class="vacancy-meta deadline">
                    <i class="bi bi-calendar-event"></i>
                    <span>Apply until ${job.closing}</span>
                </div>

            </div>

            <div class="vacancy-actions">

                <button class="btn btn-outline-secondary btn-sm view-btn">
                    <i class="bi bi-eye"></i> Details
                </button>

                <button 
                    class="btn apply-btn btn-sm"
                    data-id="${job.id}"
                    data-title="${job.title}"
                    data-office="${job.office}"
                >
                    Apply Now
                </button>

            </div>
        `;

        grid.appendChild(card);
    });

    // Apply button logic
    document.querySelectorAll(".apply-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const job = {
                position: btn.dataset.title,
                office: btn.dataset.office,
                date: new Date().toLocaleDateString()
            };

            const applications =
                JSON.parse(localStorage.getItem("applications")) || [];

            applications.push(job);

            localStorage.setItem("applications", JSON.stringify(applications));

            alert("Application submitted successfully!");

        });

    });

    const searchInput = document.getElementById("vacancySearch");
    const officeFilter = document.getElementById("officeFilter");
    const regionFilter = document.getElementById("regionFilter");

    searchInput.addEventListener("keyup", function(){

        const value = this.value.toLowerCase();
        const cards = document.querySelectorAll(".vacancy-card");

        cards.forEach(card => {

            const title = card.querySelector(".vacancy-title").textContent.toLowerCase();

            if(title.includes(value)){
                card.style.display = "flex";
            } else {
                card.style.display = "none";
            }

        });

    });

    function filterVacancies(){

        const search = searchInput.value.toLowerCase();
        const office = officeFilter.value.toLowerCase();
        const region = regionFilter.value.toLowerCase();

        const cards = document.querySelectorAll(".vacancy-card");

        cards.forEach(card => {

            const title = card.querySelector(".vacancy-title").textContent.toLowerCase();
            const officeText = card.querySelector(".vacancy-office").textContent.toLowerCase();

            let visible = true;

            if(search && !title.includes(search)){
                visible = false;
            }

            if(office && !officeText.includes(office)){
                visible = false;
            }

            if(region && !officeText.includes(region)){
                visible = false;
            }

            card.style.display = visible ? "flex" : "none";

        });

    }

    searchInput.addEventListener("keyup", filterVacancies);
    officeFilter.addEventListener("change", filterVacancies);
    regionFilter.addEventListener("change", filterVacancies);

});