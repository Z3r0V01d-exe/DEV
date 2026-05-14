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

    // ✅ Date logic ALWAYS wins for expired/future vacancies
    if (now > closeDate) return "Closed";
    if (now < openDate) return "Scheduled";

    // ✅ Only trust manual status if dates are ambiguous (within range)
    if (v.status === "Closed") return "Closed";

    return "Open";
}

/* ==============================
    TEXT TRUNCATION
============================== */

function truncateText(text, maxLength = 100) {
    if (!text) return "No description";

    return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
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
        const cardClass = status === "Open" ? "open-card"
                        : status === "Scheduled" ? "scheduled-card"
                        : "closed-card";
        const badgeClass = status.toLowerCase(); // "open" | "closed" | "scheduled"

        return `
        <div class="col-lg-3 col-md-4 col-sm-6">
            <div class="card vacancy-card ${cardClass} h-100"
                onclick='openVacancyFromDashboard(${JSON.stringify(v)})'
                style="cursor:pointer;">

                <div class="card-body d-flex flex-column">

                    <!-- BADGE -->
                    <div class="d-flex justify-content-end mb-2">
                        <span class="status-badge ${badgeClass}">
                            <span class="dot"></span>${status}
                        </span>
                    </div>

                    <!-- TITLE -->
                    <h4 class="fw-bold mb-2">${v.positionTitle}</h4>

                    <!-- OFFICE -->
                    <small class="text-muted mb-1">
                        <i class="bi bi-building"></i> ${v.office}
                    </small>

                    <div class="card-divider"></div>

                    <!-- DATE -->
                    <div class="mb-2 text-muted small">
                        <i class="bi bi-calendar-event"></i>
                        ${formatDate(v.openingDate)} → ${formatDate(v.closingDate)}
                    </div>

                    <!-- DESCRIPTION -->
                    <p class="flex-grow-1 small text-dark mb-0">
                        ${truncateText(v.description)}
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
