/* ==============================
   VACANCY DASHBOARD MODULE (CLEAN)
============================== */

let allVacancies = [];

/* ==============================
   STATUS ENGINE (SINGLE SOURCE OF TRUTH)
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
    loadDashboardData();
});

/* ==============================
   LOAD DATA
============================== */
async function loadDashboardData() {
    try {
        const adminId = localStorage.getItem("userId");

        const res = await fetch(
            `http://localhost:5000/api/vacancies?adminId=${adminId}`
        );

        const data = await res.json();

        // Normalize + sync status
        allVacancies = (data.vacancies || []).map(v => ({
            ...v,
            status: getVacancyStatus(v)
        }));

        updateStats();
        renderVacancyCards();

    } catch (err) {
        console.error("Dashboard load error:", err);
    }
}

/* ==============================
   STATS
============================== */
function updateStats() {
    const active = allVacancies.filter(
        v => getVacancyStatus(v) === "Open"
    ).length;

    document.getElementById("activeVacancies").innerText = active;
}

/* ==============================
   FORMAT DATE
============================== */
function formatDate(dateString) {
    const d = new Date(dateString);

    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

/* ==============================
   RENDER CARDS
============================== */
function renderVacancyCards() {
    const container = document.getElementById("vacancyContainer");

    if (!allVacancies.length) {
        container.innerHTML = `
            <div class="col-12 text-center text-muted">
                No vacancies created yet.
            </div>
        `;
        return;
    }

    container.innerHTML = allVacancies.map(v => {

        const status = getVacancyStatus(v);

        return `
        <div class="col-lg-3 col-md-4 col-sm-6">

            <div class="card vacancy-card h-100 shadow-sm"
                onclick='openVacancyFromDashboard(${JSON.stringify(v)})'
                style="cursor:pointer; position:relative;">

                <!-- STATUS DOT ONLY -->
                <span class="status-dot ${status === 'Open' ? 'open' : 'closed'}"></span>

                <div class="card-body d-flex flex-column">

                    <!-- TITLE (BIGGER + SPACE BELOW) -->
                    <h4 class="fw-bold text-success mb-3">
                        ${v.positionTitle}
                    </h4>

                    <!-- OFFICE -->
                    <small class="text-muted mb-2">
                        <i class="bi bi-geo-alt"></i> ${v.office}
                    </small>

                    <!-- DATE -->
                    <div class="mb-2 text-muted small">
                        <i class="bi bi-calendar-event"></i>
                        ${formatDate(v.openingDate)} → ${formatDate(v.closingDate)}
                    </div>

                    <!-- DESCRIPTION -->
                    <p class="flex-grow-1 small text-dark mb-0">
                        ${v.description || "No description"}
                    </p>

                </div>

            </div>

        </div>
        `;
    }).join("");
}

/* ==============================
   OPEN VACANCY (DETAIL VIEW REDIRECT)
============================== */
function openVacancyFromDashboard(vacancy) {
    localStorage.setItem("selectedVacancy", JSON.stringify(vacancy));
    window.location.href = "admin-vacancies.html";
}

/* ==============================
   OPTIONAL: LIVE AUTO REFRESH (RECOMMENDED)
============================== */
setInterval(() => {
    allVacancies = allVacancies.map(v => ({
        ...v,
        status: getVacancyStatus(v)
    }));

    updateStats();
    renderVacancyCards();
}, 60000); // every 1 minute