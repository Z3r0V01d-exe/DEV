// ==============================
// ADMIN — APPLICANTS PAGE
// ==============================

let allApplications  = [];
let currentApp       = null; // application currently open in the drawer

// ── Status config ──────────────────────────────────────────────────────────
const STATUS_CONFIG = {
    pending:     { label: "Pending",     cls: "badge-pending",     drawerCls: "drawer-badge-pending"     },
    reviewed:    { label: "Reviewed",    cls: "badge-reviewed",    drawerCls: "drawer-badge-reviewed"    },
    shortlisted: { label: "Shortlisted", cls: "badge-shortlisted", drawerCls: "drawer-badge-shortlisted" },
    approved:    { label: "Approved",    cls: "badge-approved",    drawerCls: "drawer-badge-approved"    },
    rejected:    { label: "Rejected",    cls: "badge-rejected",    drawerCls: "drawer-badge-rejected"    }
};

// What buttons show for each current status
const STATUS_ACTIONS = {
    pending:     ["reviewed", "shortlisted", "approved", "rejected"],
    reviewed:    ["shortlisted", "approved", "rejected"],
    shortlisted: ["approved", "rejected"],
    approved:    ["rejected"],
    rejected:    ["approved"]
};

const ACTION_BUTTONS = {
    reviewed:    { label: "Mark as Reviewed",    icon: "bi-eye",               cls: "appl-action-reviewed"    },
    shortlisted: { label: "Shortlist",           icon: "bi-star-fill",         cls: "appl-action-shortlisted" },
    approved:    { label: "Approve",             icon: "bi-check-circle-fill", cls: "appl-action-approved"    },
    rejected:    { label: "Reject",              icon: "bi-x-circle-fill",     cls: "appl-action-rejected"    }
};

// ── Format helpers ─────────────────────────────────────────────────────────
function formatDate(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-PH", {
        year: "numeric", month: "short", day: "numeric"
    });
}

function formatDateLong(dateStr) {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-PH", {
        year: "numeric", month: "long", day: "numeric"
    });
}

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", function () {
    fetchApplicants();

    document.getElementById("searchApplicant").addEventListener("input",  renderTable);
    document.getElementById("filterPosition").addEventListener("change",  renderTable);
    document.getElementById("filterOffice").addEventListener("change",    renderTable);
    document.getElementById("filterStatus").addEventListener("change",    renderTable);
    document.getElementById("sortDate").addEventListener("change",        renderTable);

    // Close overlay on backdrop click
    document.getElementById("applicantOverlay").addEventListener("click", function (e) {
        if (e.target === this) closeApplicantOverlay();
    });

    // Close PDF viewer on backdrop click
    document.getElementById("pdfViewerOverlay").addEventListener("click", function (e) {
        if (e.target === this) closePdfViewer();
    });

    // Escape key closes whichever overlay is open
    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") {
            if (document.getElementById("pdfViewerOverlay").classList.contains("fv-visible")) {
                closePdfViewer();
            } else {
                closeApplicantOverlay();
            }
        }
    });

    // PDF download button
    document.getElementById("pdfViewerDownload").addEventListener("click", async function () {
        const url      = this.dataset.url;
        const fileName = this.dataset.name || "document.pdf";
        if (!url) return;

        try {
            const response  = await fetch(url);
            const blob      = await response.blob();
            const objectUrl = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }));
            const a         = document.createElement("a");
            a.href          = objectUrl;
            a.download      = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
        } catch {
            window.open(url, "_blank");
        }
    });
});

// ── Fetch all applications ─────────────────────────────────────────────────
async function fetchApplicants() {
    const tbody = document.getElementById("applicantsTable");

    tbody.innerHTML = `
        <tr>
            <td colspan="7" class="text-center py-5">
                <div class="appl-loading">
                    <div class="appl-spinner"></div>
                    <span>Loading applicants...</span>
                </div>
            </td>
        </tr>
    `;

    try {
        const res = await fetch("http://localhost:5000/api/applications/all");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const result    = await res.json();
        allApplications = result.data || [];

        console.log("📋 Applicants loaded:", allApplications.length);

        populateFilters();
        updateStats(allApplications);
        renderTable();

    } catch (err) {
        console.error("❌ Failed to load applicants:", err);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center text-danger py-5">
                    <i class="bi bi-exclamation-circle fs-3 d-block mb-2"></i>
                    Failed to load applicants. Please refresh the page.
                </td>
            </tr>
        `;
        updateStats([]);
    }
}

// ── Populate filter dropdowns ──────────────────────────────────────────────
function populateFilters() {
    const positions = [...new Set(
        allApplications
            .map(a => a.vacancy?.positionTitle || a.vacancySnapshot?.positionTitle)
            .filter(Boolean)
    )].sort();

    const offices = [...new Set(
        allApplications
            .map(a =>
                a.vacancy?.office ||
                a.vacancySnapshot?.office ||
                a.vacancy?.department ||
                a.vacancySnapshot?.department
            )
            .filter(Boolean)
    )].sort();

    document.getElementById("filterPosition").innerHTML =
        `<option value="">All Positions</option>` +
        positions.map(p => `<option value="${p}">${p}</option>`).join("");

    document.getElementById("filterOffice").innerHTML =
        `<option value="">All Offices</option>` +
        offices.map(o => `<option value="${o}">${o}</option>`).join("");
}

// ── Update stat cards ──────────────────────────────────────────────────────
function updateStats(apps) {
    const count = (s) => apps.filter(a => (a.status || "pending") === s).length;

    animateCount(document.getElementById("statTotal"),    apps.length);
    animateCount(document.getElementById("statPending"),  count("pending") + count("reviewed") + count("shortlisted"));
    animateCount(document.getElementById("statApproved"), count("approved"));
    animateCount(document.getElementById("statRejected"), count("rejected"));
}

function animateCount(el, target) {
    if (!el) return;
    if (target === 0) { el.textContent = "0"; return; }
    let current = 0;
    const step  = Math.ceil(target / 20);
    const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = current;
    }, 40);
}

// ── Render table ───────────────────────────────────────────────────────────
function renderTable() {
    const tbody     = document.getElementById("applicantsTable");
    const countEl   = document.getElementById("appCountChip");
    const search    = document.getElementById("searchApplicant").value.trim().toLowerCase();
    const position  = document.getElementById("filterPosition").value;
    const office    = document.getElementById("filterOffice").value;
    const status    = document.getElementById("filterStatus").value;
    const sort      = document.getElementById("sortDate").value;

    let filtered = allApplications.filter(app => {
        const lastName  = (app.lastName  || "").toLowerCase();
        const firstName = (app.firstName || "").toLowerCase();
        const fullName  = `${firstName} ${lastName}`;
        const email     = (app.email || "").toLowerCase();
        const shortId   = (app._id || "").slice(-6).toLowerCase();
        const pos       = (app.vacancy?.positionTitle || app.vacancySnapshot?.positionTitle || "").toLowerCase();
        const off       = (app.vacancy?.office || app.vacancySnapshot?.office || app.vacancy?.department || app.vacancySnapshot?.department || "").toLowerCase();
        const appStatus = app.status || "pending";

        const matchSearch   = !search   || fullName.includes(search) || lastName.includes(search) || firstName.includes(search) || email.includes(search) || shortId.includes(search) || pos.includes(search) || off.includes(search);
        const matchPosition = !position || pos === position.toLowerCase();
        const matchOffice   = !office   || off === office.toLowerCase();
        const matchStatus   = !status   || appStatus === status;

        return matchSearch && matchPosition && matchOffice && matchStatus;
    });

    filtered.sort((a, b) => {
        const da = new Date(a.appliedAt);
        const db = new Date(b.appliedAt);
        return sort === "recent" ? db - da : da - db;
    });

    if (countEl) {
        countEl.textContent = filtered.length === allApplications.length
            ? `${allApplications.length} total`
            : `${filtered.length} of ${allApplications.length}`;
    }

    if (filtered.length === 0) {
        const isFiltering = search || position || office || status;
        tbody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-5">
                    <i class="bi bi-${isFiltering ? "search" : "inbox"} fs-2 d-block mb-2" style="color:#d1d5db;"></i>
                    <span class="text-muted" style="font-size:14px;">
                        ${isFiltering ? "No applicants match your filter." : "No applicants yet."}
                    </span>
                    ${isFiltering ? `<div class="mt-3"><button class="btn btn-sm btn-outline-secondary" onclick="clearFilters()"><i class="bi bi-x-circle me-1"></i>Clear filters</button></div>` : ""}
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map((app, index) => {
        const appStatus = app.status || "pending";
        const cfg       = STATUS_CONFIG[appStatus] || STATUS_CONFIG.pending;
        const shortId   = app._id.slice(-6).toUpperCase();
        const posTitle  = app.vacancy?.positionTitle || app.vacancySnapshot?.positionTitle || "—";
        const offName   = app.vacancy?.office || app.vacancySnapshot?.office || app.vacancy?.department || app.vacancySnapshot?.department || "DENR";
        const midInit   = app.middleName ? ` ${app.middleName.charAt(0)}.` : "";

        const hl = (text) => {
            if (!search || !text) return text || "—";
            const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
            return text.replace(regex, `<mark class="appl-highlight">$1</mark>`);
        };

        return `
            <tr class="appl-row" style="animation-delay:${index * 25}ms;">
                <td><span class="appl-short-id">#${shortId}</span></td>
                <td class="appl-name-cell">${hl(app.lastName)}</td>
                <td class="appl-name-cell">${hl(app.firstName)}${midInit}</td>
                <td><div class="appl-position" title="${posTitle}">${hl(posTitle)}</div></td>
                <td><div class="appl-office" title="${offName}"><i class="bi bi-building me-1" style="font-size:11px;"></i>${hl(offName)}</div></td>
                <td class="appl-date">${formatDate(app.appliedAt)}</td>
                <td class="text-center">
                    <div class="appl-actions">
                        <span class="appl-badge ${cfg.cls}">${cfg.label}</span>
                        <button class="appl-btn-view" onclick="openApplicantOverlay('${app._id}')">
                            <i class="bi bi-eye me-1"></i>View
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

// ── Clear filters ──────────────────────────────────────────────────────────
function clearFilters() {
    document.getElementById("searchApplicant").value = "";
    document.getElementById("filterPosition").value  = "";
    document.getElementById("filterOffice").value    = "";
    document.getElementById("filterStatus").value    = "";
    document.getElementById("sortDate").value        = "recent";
    renderTable();
}

// ══════════════════════════════════════════════════════════════════
// APPLICANT DETAIL OVERLAY
// ══════════════════════════════════════════════════════════════════

function openApplicantOverlay(id) {
    const app = allApplications.find(a => a._id === id);
    if (!app) return;

    currentApp = app;

    const status    = app.status || "pending";
    const cfg       = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
    const position  = app.vacancy?.positionTitle || app.vacancySnapshot?.positionTitle || "—";
    const office    = app.vacancy?.office || app.vacancySnapshot?.office || app.vacancy?.department || app.vacancySnapshot?.department || "DENR";
    const fullName  = `${app.firstName || ""} ${app.middleName ? app.middleName + " " : ""}${app.lastName || ""}`.trim();
    const initials  = `${(app.firstName || "?").charAt(0)}${(app.lastName || "?").charAt(0)}`.toUpperCase();

    // ── Header ─────────────────────────────────────────────────────────────
    document.getElementById("drawerAvatar").textContent = initials;
    document.getElementById("drawerName").textContent   = fullName || "—";
    document.getElementById("drawerMeta").textContent   = `${position} · ${office}`;

    const badge = document.getElementById("drawerStatusBadge");
    badge.textContent = cfg.label;
    badge.className   = `appl-drawer-status-badge ${cfg.drawerCls}`;

    // ── Position section ───────────────────────────────────────────────────
    document.getElementById("dPosition").textContent  = position;
    document.getElementById("dOffice").textContent    = office;
    document.getElementById("dJobType").textContent   = app.jobType  || "—";
    document.getElementById("dAppliedOn").textContent = formatDateLong(app.appliedAt);

    // ── Personal info ──────────────────────────────────────────────────────
    document.getElementById("dLastName").textContent   = app.lastName   || "—";
    document.getElementById("dFirstName").textContent  = app.firstName  || "—";
    document.getElementById("dMiddleName").textContent = app.middleName || "N/A";
    document.getElementById("dBirthdate").textContent  = formatDateLong(app.birthdate);
    document.getElementById("dAge").textContent        = app.age        || "—";
    document.getElementById("dEmail").textContent      = app.email      || "—";
    document.getElementById("dContact").textContent    = app.contact    || "—";
    document.getElementById("dAddress").textContent    = app.address    || "—";

    // ── Education ──────────────────────────────────────────────────────────
    const eduContainer = document.getElementById("dEducation");
    const edList = app.education || [];

    if (edList.length === 0) {
        eduContainer.innerHTML = `<p class="appl-empty-note">No education records provided.</p>`;
    } else {
        eduContainer.innerHTML = edList.map(ed => `
            <div class="appl-entry-card">
                <div class="appl-entry-title">${ed.school || "—"}</div>
                <div class="appl-entry-sub">${ed.degree || "—"}</div>
                <div class="appl-entry-meta">
                    <span><i class="bi bi-calendar3 me-1"></i>${ed.from || "?"} → ${ed.to || "Present"}</span>
                    <span class="appl-entry-tag ${ed.graduated === "Yes" ? "tag-yes" : "tag-no"}">
                        ${ed.graduated === "Yes" ? "Graduated" : "Did not graduate"}
                    </span>
                </div>
            </div>
        `).join("");
    }

    // ── Work experience ────────────────────────────────────────────────────
    const expContainer = document.getElementById("dExperience");
    const expList = app.experience || [];

    if (expList.length === 0 || (expList.length === 1 && !expList[0].company)) {
        expContainer.innerHTML = `<p class="appl-empty-note">No work experience provided.</p>`;
    } else {
        expContainer.innerHTML = expList.filter(e => e.company).map(exp => `
            <div class="appl-entry-card">
                <div class="appl-entry-title">${exp.company || "—"}</div>
                <div class="appl-entry-sub">${exp.position || "—"}</div>
                <div class="appl-entry-meta">
                    <span><i class="bi bi-calendar3 me-1"></i>${exp.from || "?"} → ${exp.to || "Present"}</span>
                    ${exp.reason ? `<span class="appl-entry-reason"><i class="bi bi-chat-left-text me-1"></i>${exp.reason}</span>` : ""}
                </div>
            </div>
        `).join("");
    }

    // ── Documents ─────────────────────────────────────────────────────────
    const docsContainer = document.getElementById("dDocuments");
    const docs = [
        { label: "Resume / CV",           key: "resume",            icon: "bi-file-person-fill",          url: app.resume?.url,            name: `${app.lastName}_${app.firstName}_Resume.pdf`            },
        { label: "Application Letter",    key: "coverLetter",       icon: "bi-file-earmark-text-fill",    url: app.coverLetter?.url,       name: `${app.lastName}_${app.firstName}_CoverLetter.pdf`       },
        { label: "Endorsement Letter",    key: "endorsementLetter", icon: "bi-file-earmark-check-fill",   url: app.endorsementLetter?.url, name: `${app.lastName}_${app.firstName}_EndorsementLetter.pdf` }
    ];

    const availableDocs = docs.filter(d => d.url);

    if (availableDocs.length === 0) {
        docsContainer.innerHTML = `<p class="appl-empty-note">No documents uploaded.</p>`;
    } else {
        docsContainer.innerHTML = availableDocs.map(doc => `
            <div class="appl-doc-card" onclick="openPdfViewer('${doc.url}', '${doc.name}')">
                <div class="appl-doc-icon">
                    <i class="bi ${doc.icon}"></i>
                </div>
                <div class="appl-doc-info">
                    <div class="appl-doc-label">${doc.label}</div>
                    <div class="appl-doc-hint">Click to view</div>
                </div>
                <i class="bi bi-box-arrow-up-right appl-doc-arrow"></i>
            </div>
        `).join("");
    }

    // ── Footer action buttons ──────────────────────────────────────────────
    buildFooterActions(status);

    // ── Show overlay ───────────────────────────────────────────────────────
    document.getElementById("applicantOverlay").classList.add("appl-overlay-visible");
    document.body.style.overflow = "hidden";
}

function buildFooterActions(status) {
    const container = document.getElementById("drawerFooterActions");
    const actions   = STATUS_ACTIONS[status] || [];

    if (actions.length === 0) {
        container.innerHTML = `<span class="appl-footer-note">No further actions available.</span>`;
        return;
    }

    container.innerHTML = actions.map(action => {
        const btn = ACTION_BUTTONS[action];
        return `
            <button class="appl-action-btn ${btn.cls}" onclick="updateStatus('${action}')">
                <i class="bi ${btn.icon} me-1"></i>${btn.label}
            </button>
        `;
    }).join("");
}

function closeApplicantOverlay() {
    document.getElementById("applicantOverlay").classList.remove("appl-overlay-visible");
    document.body.style.overflow = "";
    currentApp = null;
}

// ── Update application status ──────────────────────────────────────────────
async function updateStatus(newStatus) {
    if (!currentApp) return;

    const id     = currentApp._id;
    const cfg    = STATUS_CONFIG[newStatus] || STATUS_CONFIG.pending;
    const labels = {
        reviewed:    "marked as Reviewed",
        shortlisted: "Shortlisted",
        approved:    "Approved",
        rejected:    "Rejected"
    };

    // Confirm for destructive actions
    if (newStatus === "rejected") {
        if (!confirm(`Are you sure you want to reject this application?\n\n"${currentApp.firstName} ${currentApp.lastName}" will be notified.`)) return;
    }

    // Disable all action buttons while saving
    const actionBtns = document.querySelectorAll(".appl-action-btn");
    actionBtns.forEach(b => { b.disabled = true; b.style.opacity = "0.6"; });

    try {
        const res = await fetch(`http://localhost:5000/api/applications/${id}/status`, {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ status: newStatus })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        // ── Update local state ─────────────────────────────────────────────
        const idx = allApplications.findIndex(a => a._id === id);
        if (idx !== -1) {
            allApplications[idx].status = newStatus;
            currentApp.status           = newStatus;
        }

        // ── Refresh UI ─────────────────────────────────────────────────────
        // Update badge in drawer header
        const badge = document.getElementById("drawerStatusBadge");
        badge.textContent = cfg.label;
        badge.className   = `appl-drawer-status-badge ${cfg.drawerCls}`;

        // Rebuild footer buttons for new status
        buildFooterActions(newStatus);

        // Refresh table in background
        updateStats(allApplications);
        renderTable();

        // Show success toast
        showAdminToast(`Application ${labels[newStatus] || newStatus} successfully.`, "success");

    } catch (err) {
        console.error("❌ Failed to update status:", err);
        showAdminToast("Failed to update status. Please try again.", "error");

        // Re-enable buttons on failure
        actionBtns.forEach(b => { b.disabled = false; b.style.opacity = "1"; });
    }
}

// ══════════════════════════════════════════════════════════════════
// PDF VIEWER (inline)
// ══════════════════════════════════════════════════════════════════

function openPdfViewer(rawUrl, fileName) {
    const overlay   = document.getElementById("pdfViewerOverlay");
    const frame     = document.getElementById("pdfViewerFrame");
    const nameEl    = document.getElementById("pdfViewerName");
    const dlBtn     = document.getElementById("pdfViewerDownload");
    const loading   = document.getElementById("pdfViewerLoading");
    const frameWrap = overlay.querySelector(".fv-frame-wrap");

    frame.src               = "";
    frame.onload            = null;
    frame.onerror           = null;
    loading.style.display   = "flex";
    frameWrap.style.display = "block";

    const prevErr = document.getElementById("pdfErrMsg");
    if (prevErr) prevErr.remove();

    // Ensure .pdf on URL
    const pdfUrl   = rawUrl.endsWith(".pdf") ? rawUrl : rawUrl + ".pdf";
    const cleanName = (fileName || "document.pdf").endsWith(".pdf") ? (fileName || "document.pdf") : (fileName || "document") + ".pdf";

    nameEl.textContent = cleanName;
    dlBtn.dataset.url  = pdfUrl;
    dlBtn.dataset.name = cleanName;

    const isLocal  = pdfUrl.includes("localhost") || pdfUrl.includes("127.0.0.1") || pdfUrl.startsWith("/");
    const viewerUrl = isLocal
        ? pdfUrl
        : `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

    let loaded = false;
    const errorTimer = setTimeout(() => {
        if (!loaded) showPdfFallback(pdfUrl, cleanName, overlay);
    }, 20000);

    frame.onload  = () => { loaded = true; clearTimeout(errorTimer); loading.style.display = "none"; };
    frame.onerror = () => { loaded = true; clearTimeout(errorTimer); showPdfFallback(pdfUrl, cleanName, overlay); };

    setTimeout(() => { frame.src = viewerUrl; }, 80);

    overlay.classList.add("fv-visible");
    document.body.style.overflow = "hidden";
}

function closePdfViewer() {
    const overlay = document.getElementById("pdfViewerOverlay");
    const frame   = document.getElementById("pdfViewerFrame");

    overlay.classList.remove("fv-visible");
    document.body.style.overflow = "hidden"; // keep applicant drawer scroll locked

    setTimeout(() => { frame.src = ""; frame.onload = null; frame.onerror = null; }, 280);
}

function showPdfFallback(url, fileName, overlay) {
    const loading   = overlay.querySelector(".fv-loading");
    const frameWrap = overlay.querySelector(".fv-frame-wrap");

    loading.style.display   = "none";
    frameWrap.style.display = "none";

    const errMsg = document.createElement("div");
    errMsg.id    = "pdfErrMsg";
    errMsg.style.cssText = "display:flex;flex-direction:column;align-items:center;justify-content:center;padding:48px 32px;gap:14px;text-align:center;";
    errMsg.innerHTML = `
        <i class="bi bi-exclamation-circle" style="font-size:44px;color:#d97706;"></i>
        <div style="font-size:15px;font-weight:700;color:#1a2e1a;">Unable to preview this file</div>
        <div style="font-size:13px;color:#6b7280;max-width:300px;line-height:1.7;">The PDF viewer could not load this document. You can download it instead.</div>
        <a href="${url}" target="_blank" style="display:inline-flex;align-items:center;gap:8px;margin-top:6px;padding:11px 24px;border-radius:10px;background:linear-gradient(135deg,#427A43,#2e7d32);color:#fff;font-size:13.5px;font-weight:600;text-decoration:none;">
            <i class="bi bi-download"></i> Download File
        </a>
    `;
    overlay.querySelector(".fv-dialog").appendChild(errMsg);
}

// ══════════════════════════════════════════════════════════════════
// TOAST NOTIFICATION
// ══════════════════════════════════════════════════════════════════

function showAdminToast(message, type = "success") {
    let container = document.getElementById("adminToastContainer");
    if (!container) {
        container = document.createElement("div");
        container.id = "adminToastContainer";
        container.style.cssText = "position:fixed;bottom:24px;right:24px;z-index:999999;display:flex;flex-direction:column;gap:10px;max-width:340px;";
        document.body.appendChild(container);
    }

    const colors = {
        success: "#2e7d32",
        error:   "#d32f2f",
        info:    "#0277bd"
    };

    const icons = {
        success: "bi-check-circle-fill",
        error:   "bi-x-circle-fill",
        info:    "bi-info-circle-fill"
    };

    const toast = document.createElement("div");
    toast.style.cssText = `
        background:${colors[type] || colors.success};
        color:#fff;border-radius:10px;padding:13px 16px;
        display:flex;align-items:center;gap:10px;
        box-shadow:0 4px 18px rgba(0,0,0,0.22);
        opacity:0;transform:translateY(10px);
        transition:opacity 0.25s ease,transform 0.25s ease;
        pointer-events:all;font-size:13.5px;font-weight:500;
    `;
    toast.innerHTML = `
        <i class="bi ${icons[type] || icons.success}" style="font-size:17px;flex-shrink:0;"></i>
        <span style="flex:1;">${message}</span>
    `;
    container.appendChild(toast);

    requestAnimationFrame(() => requestAnimationFrame(() => {
        toast.style.opacity   = "1";
        toast.style.transform = "translateY(0)";
    }));

    setTimeout(() => {
        toast.style.opacity   = "0";
        toast.style.transform = "translateY(10px)";
        setTimeout(() => toast.remove(), 280);
    }, 3500);
}