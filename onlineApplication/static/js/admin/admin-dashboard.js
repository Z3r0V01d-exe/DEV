/* ==============================
   ADMIN DASHBOARD
============================== */

let allVacancies    = [];
let allApplications = [];
let appsTabLoaded   = false;

/* ── Helpers ──────────────────────────────────────────────────────────── */
function getVacancyStatus(v) {
    const now       = new Date();
    const openDate  = new Date(v.openingDate);
    const closeDate = new Date(v.closingDate);

    if (now > closeDate)       return "Closed";
    if (now < openDate)        return "Scheduled";
    if (v.status === "Closed") return "Closed";
    return "Open";
}

function truncateText(text, maxLength = 90) {
    if (!text) return "No description";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
}

function formatDate(dateString) {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short", day: "numeric", year: "numeric"
    });
}

/** Return up to 2 uppercase initials from a full name */
function getInitials(name) {
    if (!name) return "?";
    return name.trim().split(/\s+/).slice(0, 2).map(w => w[0]).join("").toUpperCase();
}

/* ── Init ─────────────────────────────────────────────────────────────── */
document.addEventListener("DOMContentLoaded", () => {

    // Today's date in welcome banner
    const dateEl = document.getElementById("dashTodayDate");
    if (dateEl) {
        dateEl.textContent = new Date().toLocaleDateString("en-PH", {
            weekday: "long", year: "numeric", month: "long", day: "numeric"
        });
    }

    loadDashboardData();

    // Load applications tab on first click
    const appsTabBtn = document.getElementById("applicationsTabBtn");
    if (appsTabBtn) {
        appsTabBtn.addEventListener("shown.bs.tab", () => {
            if (!appsTabLoaded) loadApplicationsTab();
        });
    }
});

/* ── Load vacancies + applicant stats ─────────────────────────────────── */
async function loadDashboardData() {
    try {
        const adminId = localStorage.getItem("userId");

        const [vacRes, appRes] = await Promise.all([
            fetch(`http://localhost:5000/api/vacancies?adminId=${adminId}`),
            fetch("http://localhost:5000/api/applications/all")
        ]);

        if (vacRes.ok) {
            const vacData = await vacRes.json();
            allVacancies  = (vacData.vacancies || []).map(v => ({
                ...v,
                status: getVacancyStatus(v)
            }));
        }

        if (appRes.ok) {
            const appData  = await appRes.json();
            allApplications = appData.data || [];
        }

        updateStats();
        renderVacancyCards();

    } catch (err) {
        console.error("Dashboard load error:", err);
        ["totalApplicants","pendingApplications","approvedApplications","activeVacancies"]
            .forEach(id => {
                const el = document.getElementById(id);
                if (el) el.textContent = "0";
            });
        renderVacancyCards();
    }
}

/* ── Update stat cards ────────────────────────────────────────────────── */
function updateStats() {
    const uniqueApplicants = new Set(
        allApplications.map(a => a.applicant?._id || a.applicant).filter(Boolean)
    ).size;

    const pending  = allApplications.filter(a =>
        ["pending", "reviewed", "shortlisted"].includes(a.status || "pending")
    ).length;

    const approved = allApplications.filter(a =>
        (a.status || "pending") === "approved"
    ).length;

    const activeVacancies = allVacancies.filter(v =>
        getVacancyStatus(v) === "Open"
    ).length;

    animateCount("totalApplicants",      uniqueApplicants);
    animateCount("pendingApplications",  pending);
    animateCount("approvedApplications", approved);
    animateCount("activeVacancies",      activeVacancies);
}

function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = "0";
    if (target === 0) return;

    let current = 0;
    const step  = Math.ceil(target / 20);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current;
    }, 40);
}

/* ── Render vacancy cards ─────────────────────────────────────────────── */
function renderVacancyCards() {
    const container = document.getElementById("vacancyContainer");
    if (!container) return;

    if (!allVacancies.length) {
        container.innerHTML = `
            <div class="col-12 text-center py-5 text-muted">
                <i class="bi bi-briefcase fs-2 d-block mb-2" style="color:#d1d5db;"></i>
                No vacancies created yet.
            </div>
        `;
        return;
    }

    container.innerHTML = allVacancies.map(v => {
        const status    = getVacancyStatus(v);
        const cardClass = status === "Open"
            ? "open-card"
            : status === "Scheduled"
                ? "scheduled-card"
                : "closed-card";
        const badgeClass = status.toLowerCase();

        return `
        <div class="col-xl-3 col-lg-4 col-md-6">
            <div class="card vacancy-card ${cardClass} h-100"
                onclick='openVacancyFromDashboard(${JSON.stringify(v)})'
                style="cursor:pointer;">
                <div class="card-body d-flex flex-column">
                    <div class="d-flex justify-content-end mb-2">
                        <span class="status-badge ${badgeClass}">
                            <span class="dot"></span>${status}
                        </span>
                    </div>
                    <h4 class="mb-2">${v.positionTitle}</h4>
                    <small class="text-muted mb-1">
                        <i class="bi bi-building me-1"></i>${v.office}
                    </small>
                    <div class="card-divider"></div>
                    <div class="mb-2 text-muted small">
                        <i class="bi bi-calendar-event me-1"></i>
                        ${formatDate(v.openingDate)} → ${formatDate(v.closingDate)}
                    </div>
                    <p class="flex-grow-1 small text-dark mb-0">
                        ${truncateText(v.description)}
                    </p>
                </div>
            </div>
        </div>
        `;
    }).join("");
}

function openVacancyFromDashboard(vacancy) {
    localStorage.setItem("selectedVacancy", JSON.stringify(vacancy));
    window.location.href = "admin-vacancies.html";
}

/* ── Applications tab ─────────────────────────────────────────────────── */
async function loadApplicationsTab() {
    appsTabLoaded = true;

    const loading   = document.getElementById("dashAppLoading");
    const tableWrap = document.getElementById("dashAppTableWrap");
    const footer    = document.getElementById("dashAppFooter");
    const countChip = document.getElementById("dashAppCount");
    const tbody     = document.getElementById("applicationTable");

    if (loading)   loading.style.display   = "flex";
    if (tableWrap) tableWrap.style.display = "none";
    if (footer)    footer.style.display    = "none";

    try {
        let apps = allApplications;

        if (!apps.length) {
            const res  = await fetch("http://localhost:5000/api/applications/all");
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            apps = allApplications = data.data || [];
        }

        if (loading) loading.style.display = "none";

        if (apps.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5">
                        <i class="bi bi-inbox fs-2 d-block mb-2" style="color:#d1d5db;"></i>
                        <span class="text-muted">No applications submitted yet.</span>
                    </td>
                </tr>
            `;
            if (tableWrap) tableWrap.style.display = "block";
            return;
        }

        if (countChip) {
            countChip.textContent   = `${apps.length} total`;
            countChip.style.display = "inline-flex";
        }

        const recent = [...apps]
            .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
            .slice(0, 10);

        const STATUS_BADGE = {
            pending:     { label: "Pending",     cls: "dash-badge-pending"     },
            reviewed:    { label: "Reviewed",    cls: "dash-badge-reviewed"    },
            shortlisted: { label: "Shortlisted", cls: "dash-badge-shortlisted" },
            approved:    { label: "Approved",    cls: "dash-badge-approved"    },
            rejected:    { label: "Rejected",    cls: "dash-badge-rejected"    }
        };

        tbody.innerHTML = recent.map((app, i) => {
            const status   = app.status || "pending";
            const badge    = STATUS_BADGE[status] || STATUS_BADGE.pending;
            const fullName = `${app.firstName || ""} ${app.lastName || ""}`.trim() || "—";
            const initials = getInitials(fullName);
            const position = app.vacancy?.positionTitle
                          || app.vacancySnapshot?.positionTitle
                          || "—";
            const office   = app.vacancy?.office
                          || app.vacancySnapshot?.office
                          || app.vacancy?.department
                          || app.vacancySnapshot?.department
                          || "DENR";

            return `
                <tr class="dash-app-row" style="animation-delay:${i * 30}ms;">
                    <td>
                        <div class="dash-app-name">
                            <div class="dash-app-avatar">${initials}</div>
                            <span>${fullName}</span>
                        </div>
                    </td>
                    <td title="${position}" style="max-width:180px;">${position}</td>
                    <td>
                        <i class="bi bi-building me-1" style="color:#8a9187;"></i>${office}
                    </td>
                    <td style="color:#8a9187; font-size:12.5px;">${formatDate(app.appliedAt)}</td>
                    <td class="text-center">
                        <span class="dash-status-badge ${badge.cls}">${badge.label}</span>
                    </td>
                </tr>
            `;
        }).join("");

        if (tableWrap) tableWrap.style.display = "block";
        if (footer)    footer.style.display    = "flex";

    } catch (err) {
        console.error("Applications tab load error:", err);
        if (loading) loading.style.display = "none";

        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-4">
                    <i class="bi bi-exclamation-circle me-2"></i>
                    Failed to load applications. Please refresh.
                </td>
            </tr>
        `;
        if (tableWrap) tableWrap.style.display = "block";
    }
}

/* ── Auto refresh every 60s ───────────────────────────────────────────── */
setInterval(async () => {
    try {
        const adminId = localStorage.getItem("userId");

        const [vacRes, appRes] = await Promise.all([
            fetch(`http://localhost:5000/api/vacancies?adminId=${adminId}`),
            fetch("http://localhost:5000/api/applications/all")
        ]);

        if (vacRes.ok) {
            const vacData = await vacRes.json();
            allVacancies  = (vacData.vacancies || []).map(v => ({
                ...v,
                status: getVacancyStatus(v)
            }));
        }

        if (appRes.ok) {
            const appData  = await appRes.json();
            allApplications = appData.data || [];
        }

        updateStats();
        renderVacancyCards();

    } catch (err) {
        console.error("Auto-refresh error:", err);
    }
}, 60000);