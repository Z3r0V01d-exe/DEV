// ==============================
// ADMIN — REPORTS PAGE
// ==============================

let reportData = []; // all applications

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CFG = {
    pending:     { label: "Pending",     color: "#f59e0b", bg: "#fef3c7", text: "#92400e" },
    reviewed:    { label: "Reviewed",    color: "#0ea5e9", bg: "#e0f2fe", text: "#075985" },
    shortlisted: { label: "Shortlisted", color: "#8b5cf6", bg: "#ede9fe", text: "#4c1d95" },
    approved:    { label: "Approved",    color: "#22c55e", bg: "#dcfce7", text: "#166534" },
    rejected:    { label: "Rejected",    color: "#ef4444", bg: "#fee2e2", text: "#991b1b" }
};

// ── Format helpers ─────────────────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-PH", {
        year: "numeric", month: "short", day: "numeric"
    });
}

function formatDateFull(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-PH", {
        year: "numeric", month: "long", day: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    // Set generated date
    const genEl = document.getElementById("rptGeneratedDate");
    if (genEl) genEl.textContent = formatDateFull(new Date().toISOString());

    loadReportData();
});

// ── Fetch data ─────────────────────────────────────────────────────────────
async function loadReportData() {
    try {
        const res = await fetch("http://localhost:5000/api/applications/all");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const result = await res.json();
        reportData   = result.data || [];

        renderAll();

    } catch (err) {
        console.error("❌ Failed to load report data:", err);
        showLoadError();
    }
}

// ── Render everything ──────────────────────────────────────────────────────
function renderAll() {
    renderSummaryStats();
    renderStatusBreakdown();
    renderPositionTable();
    renderOfficeTable();
    renderRecentActivity();
}

// ── Summary stat cards ─────────────────────────────────────────────────────
function renderSummaryStats() {
    const total       = reportData.length;
    const approved    = reportData.filter(a => a.status === "approved").length;
    const pending     = reportData.filter(a => ["pending","reviewed","shortlisted"].includes(a.status || "pending")).length;
    const rejected    = reportData.filter(a => a.status === "rejected").length;

    animateCount("reportTotalApplicants", total);
    animateCount("reportApproved",        approved);
    animateCount("reportPending",         pending);
    animateCount("reportRejected",        rejected);
}

function animateCount(id, target) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = "0";
    if (target === 0) return;

    let current = 0;
    const step  = Math.ceil(target / 25);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current;
    }, 35);
}

// ── Status breakdown bar ───────────────────────────────────────────────────
function renderStatusBreakdown() {
    const container = document.getElementById("rptBreakdownRow");
    if (!container) return;

    const total = reportData.length;

    if (total === 0) {
        container.innerHTML = `<p class="rpt-empty-note">No application data available.</p>`;
        return;
    }

    // Count per status
    const counts = {};
    reportData.forEach(a => {
        const s = a.status || "pending";
        counts[s] = (counts[s] || 0) + 1;
    });

    const statuses = ["pending", "reviewed", "shortlisted", "approved", "rejected"];

    container.innerHTML = `
        <!-- Visual bar -->
        <div class="rpt-bar-stack">
            ${statuses.map(s => {
                const count = counts[s] || 0;
                const pct   = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                const cfg   = STATUS_CFG[s];
                return count > 0
                    ? `<div class="rpt-bar-segment" style="width:${pct}%;background:${cfg.color};" title="${cfg.label}: ${count} (${pct}%)"></div>`
                    : "";
            }).join("")}
        </div>

        <!-- Legend pills -->
        <div class="rpt-breakdown-legend">
            ${statuses.map(s => {
                const count = counts[s] || 0;
                const pct   = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
                const cfg   = STATUS_CFG[s];
                return `
                    <div class="rpt-legend-item">
                        <span class="rpt-legend-dot" style="background:${cfg.color};"></span>
                        <span class="rpt-legend-label">${cfg.label}</span>
                        <span class="rpt-legend-count">${count}</span>
                        <span class="rpt-legend-pct">${pct}%</span>
                    </div>
                `;
            }).join("")}
        </div>
    `;
}

// ── Applications per Position ──────────────────────────────────────────────
function renderPositionTable() {
    const tbody   = document.getElementById("reportPositionTable");
    const chipEl  = document.getElementById("rptPositionCount");
    if (!tbody) return;

    // Group by position
    const counts = {};
    reportData.forEach(a => {
        const pos = a.vacancy?.positionTitle || a.vacancySnapshot?.positionTitle || "Unknown";
        counts[pos] = (counts[pos] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const total  = reportData.length;

    if (chipEl) chipEl.textContent = `${sorted.length} position${sorted.length !== 1 ? "s" : ""}`;

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">No data available.</td></tr>`;
        return;
    }

    tbody.innerHTML = sorted.map(([pos, count], i) => {
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
        return `
            <tr class="rpt-row" style="animation-delay:${i * 40}ms;">
                <td class="rpt-cell-pos">${pos}</td>
                <td class="text-center">
                    <span class="rpt-count-badge">${count}</span>
                </td>
                <td>
                    <div class="rpt-inline-bar-wrap">
                        <div class="rpt-inline-bar" style="width:${pct}%;"></div>
                        <span class="rpt-inline-pct">${pct}%</span>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// ── Applications per Office ────────────────────────────────────────────────
function renderOfficeTable() {
    const tbody  = document.getElementById("reportOfficeTable");
    const chipEl = document.getElementById("rptOfficeCount");
    if (!tbody) return;

    const counts = {};
    reportData.forEach(a => {
        const off = a.vacancy?.office || a.vacancySnapshot?.office || a.vacancy?.department || a.vacancySnapshot?.department || "Unknown";
        counts[off] = (counts[off] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    const total  = reportData.length;

    if (chipEl) chipEl.textContent = `${sorted.length} office${sorted.length !== 1 ? "s" : ""}`;

    if (sorted.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted py-4">No data available.</td></tr>`;
        return;
    }

    tbody.innerHTML = sorted.map(([off, count], i) => {
        const pct = total > 0 ? ((count / total) * 100).toFixed(1) : 0;
        return `
            <tr class="rpt-row" style="animation-delay:${i * 40}ms;">
                <td class="rpt-cell-off">
                    <i class="bi bi-building me-1" style="font-size:11px;color:#4b7a5a;"></i>${off}
                </td>
                <td class="text-center">
                    <span class="rpt-count-badge">${count}</span>
                </td>
                <td>
                    <div class="rpt-inline-bar-wrap">
                        <div class="rpt-inline-bar rpt-inline-bar-alt" style="width:${pct}%;"></div>
                        <span class="rpt-inline-pct">${pct}%</span>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// ── Recent activity table ──────────────────────────────────────────────────
function renderRecentActivity() {
    const tbody  = document.getElementById("recentActivityTable");
    const chipEl = document.getElementById("rptActivityCount");
    if (!tbody) return;

    const recent = [...reportData]
        .sort((a, b) => new Date(b.appliedAt) - new Date(a.appliedAt))
        .slice(0, 20);

    if (chipEl) chipEl.textContent = `${recent.length} of ${reportData.length}`;

    if (recent.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted py-4">No activity yet.</td></tr>`;
        return;
    }

    tbody.innerHTML = recent.map((app, i) => {
        const status   = app.status || "pending";
        const cfg      = STATUS_CFG[status] || STATUS_CFG.pending;
        const fullName = `${app.firstName || ""} ${app.lastName || ""}`.trim() || "—";
        const position = app.vacancy?.positionTitle || app.vacancySnapshot?.positionTitle || "—";
        const office   = app.vacancy?.office || app.vacancySnapshot?.office || app.vacancy?.department || app.vacancySnapshot?.department || "DENR";

        return `
            <tr class="rpt-row" style="animation-delay:${i * 25}ms;">
                <td class="rpt-cell-name">${fullName}</td>
                <td class="rpt-cell-pos" title="${position}">${position}</td>
                <td class="rpt-cell-off">
                    <i class="bi bi-building me-1" style="font-size:11px;color:#4b7a5a;"></i>${office}
                </td>
                <td>
                    <span class="rpt-status-badge" style="background:${cfg.bg};color:${cfg.text};">
                        ${cfg.label}
                    </span>
                </td>
                <td class="rpt-cell-date">${formatDate(app.appliedAt)}</td>
            </tr>
        `;
    }).join("");
}

// ── Error state ────────────────────────────────────────────────────────────
function showLoadError() {
    const errorHtml = `
        <tr>
            <td colspan="5" class="text-center text-danger py-4">
                <i class="bi bi-exclamation-circle fs-4 d-block mb-2"></i>
                Failed to load data. Please refresh the page.
            </td>
        </tr>
    `;
    ["reportPositionTable","reportOfficeTable","recentActivityTable"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = errorHtml;
    });

    const breakdown = document.getElementById("rptBreakdownRow");
    if (breakdown) breakdown.innerHTML = `<p class="rpt-empty-note text-danger">Failed to load breakdown data.</p>`;

    ["reportTotalApplicants","reportApproved","reportPending","reportRejected"]
        .forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = "—";
        });
}

// ══════════════════════════════════════════════════════════════════
// EXCEL EXPORT (uses SheetJS / xlsx)
// ══════════════════════════════════════════════════════════════════

async function exportReport() {
    const btn = document.getElementById("exportBtn");
    if (!btn) return;

    // Loading state
    const originalHtml = btn.innerHTML;
    btn.disabled   = true;
    btn.innerHTML  = `<span class="rpt-btn-spinner"></span> Generating...`;

    try {
        if (typeof XLSX === "undefined") {
            throw new Error("SheetJS library not loaded. Please check your internet connection.");
        }

        const wb         = XLSX.utils.book_new();
        const generatedOn = new Date().toLocaleDateString("en-PH", {
            year: "numeric", month: "long", day: "numeric",
            hour: "2-digit", minute: "2-digit"
        });

        // ── Sheet 1: Summary ─────────────────────────────────────────────
        const total       = reportData.length;
        const approved    = reportData.filter(a => a.status === "approved").length;
        const rejected    = reportData.filter(a => a.status === "rejected").length;
        const pending     = reportData.filter(a => ["pending","reviewed","shortlisted"].includes(a.status || "pending")).length;
        const shortlisted = reportData.filter(a => a.status === "shortlisted").length;
        const reviewed    = reportData.filter(a => a.status === "reviewed").length;

        const summaryData = [
            ["DENR RECRUITMENT REPORT — SUMMARY"],
            [`Generated: ${generatedOn}`],
            [],
            ["Metric", "Count", "Percentage"],
            ["Total Applications",  total,       "100%"],
            ["Approved",            approved,    total ? `${((approved/total)*100).toFixed(1)}%`    : "0%"],
            ["Pending Review",      pending,     total ? `${((pending/total)*100).toFixed(1)}%`     : "0%"],
            ["Shortlisted",         shortlisted, total ? `${((shortlisted/total)*100).toFixed(1)}%` : "0%"],
            ["Reviewed",            reviewed,    total ? `${((reviewed/total)*100).toFixed(1)}%`    : "0%"],
            ["Rejected",            rejected,    total ? `${((rejected/total)*100).toFixed(1)}%`    : "0%"],
        ];
        const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
        wsSummary["!cols"] = [{ wch: 30 }, { wch: 12 }, { wch: 14 }];
        XLSX.utils.book_append_sheet(wb, wsSummary, "Summary");

        // ── Sheet 2: All Applications ────────────────────────────────────
        const appHeaders = [
            "Application ID", "Last Name", "First Name", "Middle Name",
            "Email", "Contact", "Address", "Birthdate", "Age",
            "Job Type", "Position Applied", "Office / Department",
            "Status", "Date Applied"
        ];

        const appRows = reportData.map(a => [
            a._id?.slice(-8).toUpperCase() || "—",
            a.lastName  || "—",
            a.firstName || "—",
            a.middleName || "—",
            a.email   || "—",
            a.contact || "—",
            a.address || "—",
            formatDate(a.birthdate),
            a.age || "—",
            a.jobType || "—",
            a.vacancy?.positionTitle || a.vacancySnapshot?.positionTitle || "—",
            a.vacancy?.office || a.vacancySnapshot?.office || a.vacancy?.department || a.vacancySnapshot?.department || "—",
            (STATUS_CFG[a.status || "pending"]?.label) || "Pending",
            formatDate(a.appliedAt)
        ]);

        const wsApps = XLSX.utils.aoa_to_sheet([appHeaders, ...appRows]);
        wsApps["!cols"] = [
            {wch:14},{wch:16},{wch:16},{wch:16},
            {wch:28},{wch:16},{wch:30},{wch:14},{wch:6},
            {wch:12},{wch:34},{wch:28},{wch:14},{wch:14}
        ];
        XLSX.utils.book_append_sheet(wb, wsApps, "All Applications");

        // ── Sheet 3: By Position ─────────────────────────────────────────
        const posCounts = {};
        reportData.forEach(a => {
            const pos = a.vacancy?.positionTitle || a.vacancySnapshot?.positionTitle || "Unknown";
            posCounts[pos] = (posCounts[pos] || 0) + 1;
        });
        const posSorted = Object.entries(posCounts).sort((a,b) => b[1]-a[1]);
        const posRows   = posSorted.map(([pos, count]) => [
            pos, count, total ? `${((count/total)*100).toFixed(1)}%` : "0%"
        ]);
        const wsPos = XLSX.utils.aoa_to_sheet([
            ["APPLICATIONS PER POSITION"],
            [`Generated: ${generatedOn}`],
            [],
            ["Position Title", "Total Applications", "% of Total"],
            ...posRows
        ]);
        wsPos["!cols"] = [{wch:40},{wch:22},{wch:14}];
        XLSX.utils.book_append_sheet(wb, wsPos, "By Position");

        // ── Sheet 4: By Office ───────────────────────────────────────────
        const offCounts = {};
        reportData.forEach(a => {
            const off = a.vacancy?.office || a.vacancySnapshot?.office || a.vacancy?.department || a.vacancySnapshot?.department || "Unknown";
            offCounts[off] = (offCounts[off] || 0) + 1;
        });
        const offSorted = Object.entries(offCounts).sort((a,b) => b[1]-a[1]);
        const offRows   = offSorted.map(([off, count]) => [
            off, count, total ? `${((count/total)*100).toFixed(1)}%` : "0%"
        ]);
        const wsOff = XLSX.utils.aoa_to_sheet([
            ["APPLICATIONS PER OFFICE"],
            [`Generated: ${generatedOn}`],
            [],
            ["Office / Department", "Total Applications", "% of Total"],
            ...offRows
        ]);
        wsOff["!cols"] = [{wch:36},{wch:22},{wch:14}];
        XLSX.utils.book_append_sheet(wb, wsOff, "By Office");

        // ── Sheet 5: Education Records ────────────────────────────────────
        const eduHeaders = ["Applicant ID", "Full Name", "School", "Degree", "From", "To", "Graduated"];
        const eduRows    = [];
        reportData.forEach(a => {
            const fullName = `${a.firstName || ""} ${a.lastName || ""}`.trim();
            const appId    = a._id?.slice(-8).toUpperCase() || "—";
            (a.education || []).forEach(ed => {
                eduRows.push([
                    appId, fullName,
                    ed.school   || "—",
                    ed.degree   || "—",
                    ed.from     || "—",
                    ed.to       || "—",
                    ed.graduated || "—"
                ]);
            });
        });
        const wsEdu = XLSX.utils.aoa_to_sheet([eduHeaders, ...eduRows]);
        wsEdu["!cols"] = [{wch:14},{wch:28},{wch:36},{wch:36},{wch:12},{wch:12},{wch:12}];
        XLSX.utils.book_append_sheet(wb, wsEdu, "Education Records");

        // ── Write and download ────────────────────────────────────────────
        const today    = new Date().toISOString().slice(0, 10);
        const fileName = `DENR_Recruitment_Report_${today}.xlsx`;
        XLSX.writeFile(wb, fileName);

        // Success feedback
        btn.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i> Downloaded!`;
        btn.style.background = "#16a34a";
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.background = "";
            btn.disabled = false;
        }, 2500);

    } catch (err) {
        console.error("❌ Export error:", err);
        btn.innerHTML = `<i class="bi bi-exclamation-circle me-2"></i> Export Failed`;
        btn.style.background = "#dc2626";
        setTimeout(() => {
            btn.innerHTML = originalHtml;
            btn.style.background = "";
            btn.disabled = false;
        }, 3000);
    }
}