// ==================
// APPLICANT DASHBOARD
// ==================

document.addEventListener("DOMContentLoaded", function () {
    loadDashboardData();
});

// ==============================
// STATUS CONFIG
// ==============================

const STATUS_CONFIG = {
    pending:     { label: "Pending Review",  badge: "badge-pending",     row: "row-pending"     },
    reviewed:    { label: "Reviewed",        badge: "badge-reviewed",    row: "row-reviewed"    },
    shortlisted: { label: "Shortlisted",     badge: "badge-shortlisted", row: "row-shortlisted" },
    approved:    { label: "Approved",        badge: "badge-approved",    row: "row-approved"    },
    rejected:    { label: "Rejected",        badge: "badge-rejected",    row: "row-rejected"    }
};

// ==============================
// FORMAT DATE
// ==============================

function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-PH", {
        year: "numeric", month: "short", day: "numeric"
    });
}

// ==============================
// LOAD DASHBOARD DATA
// ==============================

async function loadDashboardData() {
    const applicantId = localStorage.getItem("userId");

    if (!applicantId) {
        renderEmptyTable();
        updateStats(0, 0, 0, 0);
        renderNotifications([]);
        return;
    }

    try {
        const res = await fetch(
            `http://localhost:5000/api/applications/my?applicantId=${applicantId}`
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const result       = await res.json();
        const applications = result.data || [];

        // ── Compute stats ────────────────────────────────────────────
        const total       = applications.length;
        const underReview = applications.filter(a =>
            ["pending", "reviewed", "shortlisted"].includes(a.status)
        ).length;
        const approved  = applications.filter(a => a.status === "approved").length;
        const rejected  = applications.filter(a => a.status === "rejected").length;

        updateStats(total, underReview, approved, rejected);

        // ── Render table ─────────────────────────────────────────────
        if (applications.length === 0) {
            renderEmptyTable();
        } else {
            renderTable(applications);
        }

        // ── Render notifications ──────────────────────────────────────
        renderNotifications(applications);

    } catch (err) {
        console.error("Dashboard load error:", err);
        renderEmptyTable("Failed to load applications. Please refresh.");
        updateStats(0, 0, 0, 0);
        renderNotifications([]);
    }
}

// ==============================
// UPDATE STAT CARDS
// ==============================

function updateStats(total, underReview, approved, rejected) {
    document.getElementById("totalApplications").textContent = total;
    document.getElementById("underReview").textContent       = underReview;
    document.getElementById("approvedCount").textContent     = approved;
    document.getElementById("rejectedCount").textContent     = rejected;

    // Animate counter
    animateCount("totalApplications", total);
    animateCount("underReview", underReview);
    animateCount("approvedCount", approved);
    animateCount("rejectedCount", rejected);
}

function animateCount(elementId, target) {
    const el = document.getElementById(elementId);
    if (!el || target === 0) return;

    let current = 0;
    const step  = Math.ceil(target / 20);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        el.textContent = current;
    }, 40);
}

// ==============================
// RENDER TABLE
// ==============================

function renderTable(applications) {
    const table = document.getElementById("applicationsTable");

    // Show only 5 most recent
    const recent = applications.slice(0, 5);

    table.innerHTML = recent.map(app => {
        const status     = app.status || "pending";
        const config     = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
        const position   = app.vacancy?.positionTitle || "—";
        const appliedOn  = formatDate(app.appliedAt);
        const appId      = app._id;

        return `
            <tr class="app-row ${config.row}">
                <td>
                    <div class="position-cell">
                        <span class="position-name">${position}</span>
                        <span class="position-id">#${appId.slice(-6).toUpperCase()}</span>
                    </div>
                </td>
                <td class="date-cell">${appliedOn}</td>
                <td>
                    <span class="status-badge ${config.badge}">${config.label}</span>
                </td>
                <td>
                    <button
                        class="btn-view-app"
                        onclick="window.location.href='application-detail.html?id=${appId}'">
                        <i class="bi bi-eye"></i> View
                    </button>
                </td>
            </tr>
        `;
    }).join("");

    // Show "View All" link if more than 5
    if (applications.length > 5) {
        table.innerHTML += `
            <tr>
                <td colspan="4" class="text-center py-3">
                    <a href="#" onclick="goApplications()" class="view-all-link">
                        View all ${applications.length} applications
                        <i class="bi bi-arrow-right ms-1"></i>
                    </a>
                </td>
            </tr>
        `;
    }
}

function renderEmptyTable(message = "No application submitted yet.") {
    const table = document.getElementById("applicationsTable");
    table.innerHTML = `
        <tr>
            <td colspan="4" class="empty-row">
                <i class="bi bi-folder-x empty-table-icon"></i>
                <span>${message}</span>
            </td>
        </tr>
    `;
}

// ==============================
// RENDER NOTIFICATIONS
// ==============================

function renderNotifications(applications) {
    const container = document.getElementById("notificationList");
    if (!container) return;

    // Generate notifications from recent status changes
    const notifs = [];

    applications.forEach(app => {
        const position = app.vacancy?.positionTitle || "a position";
        const status   = app.status || "pending";
        const date     = formatDate(app.updatedAt || app.appliedAt);

        if (status === "approved") {
            notifs.push({
                type: "success",
                icon: "bi-check-circle-fill",
                text: `Your application for <strong>${position}</strong> has been <strong>approved</strong>.`,
                date
            });
        } else if (status === "rejected") {
            notifs.push({
                type: "danger",
                icon: "bi-x-circle-fill",
                text: `Your application for <strong>${position}</strong> was not selected.`,
                date
            });
        } else if (status === "shortlisted") {
            notifs.push({
                type: "info",
                icon: "bi-star-fill",
                text: `You've been <strong>shortlisted</strong> for <strong>${position}</strong>. Check your email.`,
                date
            });
        } else if (status === "reviewed") {
            notifs.push({
                type: "primary",
                icon: "bi-eye-fill",
                text: `Your application for <strong>${position}</strong> is currently under review.`,
                date
            });
        } else {
            notifs.push({
                type: "secondary",
                icon: "bi-hourglass-split",
                text: `Application submitted for <strong>${position}</strong>. Awaiting review.`,
                date
            });
        }
    });

    if (notifs.length === 0) {
        container.innerHTML = `
            <li class="notif-empty">
                <i class="bi bi-bell-slash"></i>
                <span>No notifications yet.</span>
            </li>
        `;
        return;
    }

    container.innerHTML = notifs.slice(0, 5).map(n => `
        <li class="notif-item notif-${n.type}">
            <span class="notif-icon">
                <i class="bi ${n.icon}"></i>
            </span>
            <div class="notif-content">
                <p class="notif-text">${n.text}</p>
                <span class="notif-date">${n.date}</span>
            </div>
        </li>
    `).join("");
}