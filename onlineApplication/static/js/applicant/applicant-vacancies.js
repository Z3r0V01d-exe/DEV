/* ==============================
   GLOBAL STATE
============================== */
let allVacancies = [];

/* ==============================
   STATUS ENGINE (SYNC WITH ADMIN)
============================== */
function getVacancyStatus(v) {
    const now = new Date();
    const openDate = new Date(v.openingDate);
    const closeDate = new Date(v.closingDate);

    if (now < openDate) return "Scheduled";
    if (now >= openDate && now <= closeDate) return "Open";
    if (now > closeDate) return "Closed";

    return v.status || "Closed";
}

/* ==============================
   INIT
============================== */
document.addEventListener("DOMContentLoaded", () => {
    loadVacancies();
});

/* ==============================
   LOAD VACANCIES (FROM BACKEND)
============================== */
async function loadVacancies() {
    try {
        const res = await fetch(
            `http://localhost:5000/api/vacancies?role=applicant`
        );

        const data = await res.json();

        // ✅ Only OPEN vacancies
        allVacancies = (data.vacancies || [])
            .map(v => ({
                ...v,
                status: getVacancyStatus(v)
            }))
            .filter(v => v.status === "Open");

        renderVacancies();

    } catch (err) {
        console.error("Error loading vacancies:", err);
    }
}

/* ==============================
   FORMAT DATE & TRUNCATE TEXT
============================== */
function formatDate(dateString) {
    const d = new Date(dateString);

    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

function truncateText(text, maxLength = 100) {
    if (!text) return "No description";

    return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
}

/* ==============================
   RENDER GRID (4x layout)
============================== */
function renderVacancies() {
    const grid = document.getElementById("vacanciesGrid");
    const empty = document.getElementById("noVacancies");

    grid.innerHTML = "";

    if (!allVacancies.length) {
        empty.classList.remove("d-none");
        return;
    }

    empty.classList.add("d-none");

    allVacancies.forEach(v => {

        const closingDate = new Date(v.closingDate);
        const today = new Date();
        const diffDays = Math.ceil(
            (closingDate - today) / (1000 * 60 * 60 * 24)
        );

        let badge = `<span class="badge bg-success">Open</span>`;

        if (diffDays <= 3) {
            badge = `<span class="badge bg-warning text-dark">Closing Soon</span>`;
        }

        const card = document.createElement("div");
        card.className = "vacancy-card";

        card.innerHTML = `
            <div class="vacancy-header">
                <h3 class="vacancy-title">${v.positionTitle}</h3>
            </div>

            <div class="vacancy-info">

                <!-- SINGLE OFFICE ONLY -->
                <div class="vacancy-meta vacancy-office">
                    <i class="bi bi-building"></i>
                    <span>${v.office}</span>
                </div>

                <!-- DEADLINE -->
                <div class="vacancy-meta deadline">
                    <i class="bi bi-calendar-event"></i>
                    <span>Apply until ${formatDate(v.closingDate)}</span>
                </div>

                <!-- DESCRIPTION PREVIEW -->
                <p class="vacancy-desc">
                    ${truncateText(v.description, 120)}
                </p>

            </div>

            <div class="vacancy-actions">

                <button 
                    class="btn apply-btn btn-sm"
                    data-id="${v._id}"
                    data-title="${v.positionTitle}"
                    data-office="${v.office}"
                    data-description="${encodeURIComponent(v.description)}"
                    data-closing="${v.closingDate}"
                >
                    Apply Now
                </button>

            </div>
        `;

        grid.appendChild(card);
    });

    attachApplyEvents();
}

/* ==============================
   APPLY BUTTON
============================== */
function attachApplyEvents() {
    document.querySelectorAll(".apply-btn").forEach(btn => {

        btn.addEventListener("click", () => {

            const job = {
                _id: btn.dataset.id,                // ← added _id (matches MongoDB format)
                id: btn.dataset.id,                 // ← kept id as fallback
                positionTitle: btn.dataset.title,   // ← renamed from position to positionTitle
                office: btn.dataset.office,
                description: decodeURIComponent(btn.dataset.description),
                closingDate: btn.dataset.closing,
                appliedDate: new Date().toLocaleDateString()
            };

            // Save selected vacancy for application page
            localStorage.setItem("selectedVacancy", JSON.stringify(job));

            // Redirect to application page
            window.location.href = "applicant-application.html";
        });

    });
}

/* ==============================
   FILTERS
============================== */
const searchInput = document.getElementById("vacancySearch");
const officeFilter = document.getElementById("officeFilter");
const regionFilter = document.getElementById("regionFilter");

function filterVacancies() {
    const search = searchInput.value.toLowerCase();
    const office = officeFilter.value.toLowerCase();
    const region = regionFilter.value.toLowerCase();

    const cards = document.querySelectorAll(".vacancy-card");

    cards.forEach(card => {
        const title = card.querySelector(".vacancy-title").textContent.toLowerCase();
        const officeText = card.querySelector(".vacancy-office").textContent.toLowerCase();

        let visible = true;

        if (search && !title.includes(search)) visible = false;
        if (office && !officeText.includes(office)) visible = false;
        if (region && !officeText.includes(region)) visible = false;

        card.style.display = visible ? "flex" : "none";
    });
}

/* ==============================
   EVENTS
============================== */
searchInput.addEventListener("keyup", filterVacancies);
officeFilter.addEventListener("change", filterVacancies);
regionFilter.addEventListener("change", filterVacancies);