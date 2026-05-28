document.addEventListener("DOMContentLoaded", async function () {

    const emptyState   = document.getElementById("noApplicationState");
    const panel        = document.getElementById("applicationsPanel");
    const grid         = document.getElementById("applicationsGrid");
    const noResults    = document.getElementById("noResultsState");
    const appCountChip = document.getElementById("appCountChip");
    const searchInput  = document.getElementById("appSearchInput");
    const sortSelect   = document.getElementById("appSortSelect");
    const filterPills  = document.querySelectorAll(".myapp-filter-pill");

    let allApplications = [];
    let activeFilter    = "all";

    // ── Status config ─────────────────────────────────────────────────────
    const STATUS = {
        pending:     { label: "Pending Review", icon: "bi-hourglass-split",   barCls: "tbar-pending",     iconCls: "sic-pending",     pillCls: "spill-pending"     },
        reviewed:    { label: "Reviewed",       icon: "bi-eye",               barCls: "tbar-reviewed",    iconCls: "sic-reviewed",    pillCls: "spill-reviewed"    },
        shortlisted: { label: "Shortlisted",    icon: "bi-star-fill",         barCls: "tbar-shortlisted", iconCls: "sic-shortlisted", pillCls: "spill-shortlisted" },
        approved:    { label: "Approved",       icon: "bi-check-circle-fill", barCls: "tbar-approved",    iconCls: "sic-approved",    pillCls: "spill-approved"    },
        rejected:    { label: "Rejected",       icon: "bi-x-circle-fill",     barCls: "tbar-rejected",    iconCls: "sic-rejected",    pillCls: "spill-rejected"    }
    };

    const TL_STEPS  = ["pending", "reviewed", "shortlisted", "approved"];
    const TL_LABELS = {
        pending:     "Submitted",
        reviewed:    "Reviewed",
        shortlisted: "Shortlisted",
        approved:    "Decision"
    };

    // ── Helpers ───────────────────────────────────────────────────────────

    function formatDate(dateStr) {
        if (!dateStr) return "N/A";
        return new Date(dateStr).toLocaleDateString("en-PH", {
            year: "numeric", month: "short", day: "numeric"
        });
    }

    function getStepState(stepKey, currentStatus) {
        if (currentStatus === "rejected") {
            if (stepKey === "pending")  return "done";
            if (stepKey === "approved") return "rejected";
            return "todo";
        }
        const currentIdx = TL_STEPS.indexOf(currentStatus);
        const stepIdx    = TL_STEPS.indexOf(stepKey);
        if (stepIdx < currentIdx)   return "done";
        if (stepIdx === currentIdx) return "active";
        return "todo";
    }

    function buildTimeline(status) {
        return `
            <div class="myapp-timeline">
                ${TL_STEPS.map((step, i) => {
                    const state    = getStepState(step, status);
                    const isLast   = i === TL_STEPS.length - 1;
                    const segCls   = state === "done" ? "tl-seg done" : "tl-seg";
                    let dotCls     = `tl-dot ${state}`;
                    let dotContent = "";

                    if (state === "done")     dotContent = `<i class="bi bi-check" style="font-size:8px;"></i>`;
                    if (state === "rejected") { dotCls = "tl-dot rejected"; dotContent = `<i class="bi bi-x" style="font-size:8px;"></i>`; }

                    return `
                        <div class="tl-step">
                            <div class="tl-dot-row">
                                ${i > 0   ? `<div class="${segCls}"></div>` : `<div class="tl-seg invisible"></div>`}
                                <div class="${dotCls}">${dotContent}</div>
                                ${!isLast ? `<div class="${segCls}"></div>` : `<div class="tl-seg invisible"></div>`}
                            </div>
                            <div class="tl-step-label">${TL_LABELS[step]}</div>
                        </div>
                    `;
                }).join("")}
            </div>
        `;
    }

    function buildCard(app, index) {
        const status     = app.status || "pending";
        const cfg        = STATUS[status] || STATUS.pending;
        const position   = app.vacancy?.positionTitle || app.vacancySnapshot?.positionTitle || "—";
        const office     = app.vacancy?.office || app.vacancySnapshot?.office || app.vacancy?.department || app.vacancySnapshot?.department || "DENR";
        const appliedOn  = formatDate(app.appliedAt);
        const jobType    = app.jobType || "Full-Time";
        const appId      = app._id;
        const shortId    = appId.slice(-6).toUpperCase();
        const resumeUrl  = app.resume?.url || "";

        // Clean download filename: LastName_FirstName_Resume.pdf
        const resumeName = `${app.lastName || ""}_${app.firstName || ""}_Resume.pdf`
            .replace(/\s+/g, "_");

        const isVacancyDeleted = app.vacancy?.isDeleted || (!app.vacancy && app.vacancySnapshot);

        return `
            <div class="myapp-card"
                data-status="${status}"
                data-position="${position.toLowerCase()}"
                data-office="${office.toLowerCase()}"
                style="animation-delay:${index * 55}ms;">

                <div class="myapp-card-tbar ${cfg.barCls}"></div>

                <div class="myapp-card-body">

                    <div class="myapp-card-icon ${cfg.iconCls}">
                        <i class="bi ${cfg.icon}"></i>
                    </div>

                    <div class="myapp-card-info">
                        <div class="myapp-card-position">
                            ${position}
                            ${isVacancyDeleted ? `<span style="font-size:10px;margin-left:6px;padding:2px 6px;background:#f3f4f6;color:#6b7280;border-radius:3px;"><i class="bi bi-archive me-1" style="font-size:9px;"></i>Archived</span>` : ""}
                        </div>
                        <div class="myapp-card-office">
                            <i class="bi bi-building me-1"></i>${office}
                        </div>
                        <div class="myapp-card-meta">
                            <span><i class="bi bi-calendar3 me-1"></i>${appliedOn}</span>
                            <span><i class="bi bi-briefcase me-1"></i>${jobType}</span>
                            <span class="myapp-card-id"><i class="bi bi-hash me-1"></i>${shortId}</span>
                        </div>
                        ${buildTimeline(status)}
                    </div>

                    <div class="myapp-card-right">
                        <span class="myapp-status-pill ${cfg.pillCls}">${cfg.label}</span>
                        <div class="myapp-card-actions">
                            <button class="myapp-btn-view btn-view-app" data-id="${appId}">
                                <i class="bi bi-eye me-1"></i>View
                            </button>
                            ${resumeUrl ? `
                            <button class="myapp-btn-resume btn-view-resume"
                                data-url="${resumeUrl}"
                                data-name="${resumeName}">
                                <i class="bi bi-file-earmark-text me-1"></i>Resume
                            </button>` : ""}
                        </div>
                    </div>

                </div>
            </div>
        `;
    }

    // ── Render ────────────────────────────────────────────────────────────

    function renderCards() {
        const query   = searchInput.value.trim().toLowerCase();
        const sortVal = sortSelect.value;

        let filtered = allApplications.filter(app => {
            const status   = app.status || "pending";
            const position = (app.vacancy?.positionTitle || app.vacancySnapshot?.positionTitle || "").toLowerCase();
            const office   = (app.vacancy?.office || app.vacancySnapshot?.office || app.vacancy?.department || "").toLowerCase();

            return (activeFilter === "all" || status === activeFilter) &&
                   (!query || position.includes(query) || office.includes(query));
        });

        filtered.sort((a, b) => {
            if (sortVal === "newest") return new Date(b.appliedAt) - new Date(a.appliedAt);
            if (sortVal === "oldest") return new Date(a.appliedAt) - new Date(b.appliedAt);
            if (sortVal === "az") {
                const pa = (a.vacancy?.positionTitle || a.vacancySnapshot?.positionTitle || "").toLowerCase();
                const pb = (b.vacancy?.positionTitle || b.vacancySnapshot?.positionTitle || "").toLowerCase();
                return pa.localeCompare(pb);
            }
            return 0;
        });

        grid.innerHTML = filtered.map((app, i) => buildCard(app, i)).join("");
        appCountChip.textContent = `${filtered.length} of ${allApplications.length}`;
        noResults.classList.toggle("d-none", filtered.length > 0);
    }

    // ── Filter / search / sort ────────────────────────────────────────────

    filterPills.forEach(pill => {
        pill.addEventListener("click", function () {
            filterPills.forEach(p => p.classList.remove("active"));
            this.classList.add("active");
            activeFilter = this.dataset.filter;
            renderCards();
        });
    });

    searchInput.addEventListener("input", renderCards);
    sortSelect.addEventListener("change", renderCards);

    // ── Card click delegation ─────────────────────────────────────────────

    grid.addEventListener("click", function (e) {
        const viewBtn = e.target.closest(".btn-view-app");
        if (viewBtn) {
            window.location.href = `application-detail.html?id=${viewBtn.dataset.id}`;
            return;
        }

        const resumeBtn = e.target.closest(".btn-view-resume");
        if (resumeBtn) {
            e.preventDefault();
            openFileViewer(resumeBtn.dataset.url, resumeBtn.dataset.name);
        }
    });

    // ── Overlay backdrop + Escape ─────────────────────────────────────────

    document.getElementById("fileViewerOverlay").addEventListener("click", function (e) {
        if (e.target === this) closeFileViewer();
    });

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeFileViewer();
    });

    // ── Download button ───────────────────────────────────────────────────
    // Uses fetch + blob so the browser saves the file with the correct
    // .pdf filename instead of "cloudinary-file" with no extension.

    document.getElementById("fileViewerDownload").addEventListener("click", async function () {
        const url      = this.dataset.url;
        const fileName = this.dataset.name || "document.pdf";

        if (!url) return;

        // Ensure filename ends with .pdf
        const cleanName = fileName.endsWith(".pdf") ? fileName : fileName + ".pdf";

        console.log("📥 Downloading:", cleanName, "from:", url);

        try {
            // Fetch the file as a blob so we control the filename
            const response = await fetch(url);

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const blob      = await response.blob();
            const objectUrl = URL.createObjectURL(
                new Blob([blob], { type: "application/pdf" })
            );

            const a    = document.createElement("a");
            a.href     = objectUrl;
            a.download = cleanName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            // Free memory
            setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);

        } catch (err) {
            console.error("❌ Download failed, falling back to direct link:", err);
            // Fallback: open in new tab
            window.open(url, "_blank");
        }
    });

    // ── Fetch applications ────────────────────────────────────────────────

    const applicantId = localStorage.getItem("userId");

    if (!applicantId) {
        emptyState.style.display = "block";
        return;
    }

    try {
        const res = await fetch(
            `http://localhost:5000/api/applications/my?applicantId=${applicantId}`
        );

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const result    = await res.json();
        allApplications = result.data || [];

        console.log("📱 Applications loaded:", allApplications.map(app => ({
            id:        app._id,
            position:  app.vacancy?.positionTitle || app.vacancySnapshot?.positionTitle,
            resumeUrl: app.resume?.url || "NO RESUME"
        })));

        if (allApplications.length === 0) {
            emptyState.style.display = "block";
            return;
        }

        emptyState.style.display = "none";
        panel.classList.remove("d-none");
        renderCards();

    } catch (err) {
        console.error("Failed to load applications:", err);
        emptyState.style.display = "block";
        document.querySelector(".empty-state h4").textContent = "Failed to load applications.";
        document.querySelector(".empty-state p").textContent  = "Please try again or contact support.";
    }

});

// ==============================
// FILE VIEWER OVERLAY
// ==============================

function openFileViewer(rawUrl, fileName) {
    const overlay   = document.getElementById("fileViewerOverlay");
    const frame     = document.getElementById("fileViewerFrame");
    const nameEl    = document.getElementById("fileViewerName");
    const dlBtn     = document.getElementById("fileViewerDownload");
    const loading   = document.getElementById("fileViewerLoading");
    const frameWrap = document.querySelector(".fv-frame-wrap");

    // ── Reset ─────────────────────────────────────────────────────────────
    frame.src               = "";
    frame.onload            = null;
    frame.onerror           = null;
    loading.style.display   = "flex";
    frameWrap.style.display = "block";

    const prevErr = document.getElementById("fvErrorMsg");
    if (prevErr) prevErr.remove();

    // ── Ensure URL ends with .pdf ─────────────────────────────────────────
    // Cloudinary raw files MUST have .pdf in the URL for the browser to
    // serve them as application/pdf. Without it you get "cloudinary-file"
    // with no type, which breaks both iframe rendering and downloads.
    const pdfUrl   = rawUrl.endsWith(".pdf") ? rawUrl : rawUrl + ".pdf";
    const cleanName = (fileName || "Resume.pdf").endsWith(".pdf")
        ? (fileName || "Resume.pdf")
        : (fileName || "Resume") + ".pdf";

    console.log("📄 Opening viewer:", { pdfUrl, cleanName });

    // ── Populate header ───────────────────────────────────────────────────
    nameEl.textContent = cleanName;
    dlBtn.dataset.url  = pdfUrl;
    dlBtn.dataset.name = cleanName;

    // ── Build viewer URL ──────────────────────────────────────────────────
    //
    // Strategy:
    // • Local URLs (localhost) → load directly in iframe.
    //   Works if Express sends Content-Type: application/pdf.
    //
    // • Cloudinary raw URLs → use Google Docs Viewer.
    //   Even with .pdf appended, Cloudinary sends Content-Disposition: attachment
    //   for raw files, which prevents iframe rendering.
    //   Google Docs Viewer fetches the file server-side and renders it as
    //   HTML — completely bypassing the Content-Disposition issue.
    //   The .pdf extension is still needed so Google Docs knows the file type.

    const isLocal = pdfUrl.includes("localhost") ||
                    pdfUrl.includes("127.0.0.1") ||
                    pdfUrl.startsWith("/");

    const viewerUrl = isLocal
        ? pdfUrl
        : `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`;

    console.log("🔗 Viewer URL:", viewerUrl);

    // ── Timeout fallback ──────────────────────────────────────────────────
    // Google Docs Viewer can take 10–20s on first render for large files.
    let loaded = false;

    const errorTimer = setTimeout(() => {
        if (!loaded) {
            console.warn("⏱️ Viewer timeout — showing fallback");
            showViewerFallback(pdfUrl, cleanName);
        }
    }, 20000);

    frame.onload = () => {
        loaded = true;
        clearTimeout(errorTimer);
        loading.style.display = "none";
        console.log("✅ Viewer loaded");
    };

    frame.onerror = () => {
        loaded = true;
        clearTimeout(errorTimer);
        console.error("❌ Viewer error");
        showViewerFallback(pdfUrl, cleanName);
    };

    setTimeout(() => { frame.src = viewerUrl; }, 80);

    overlay.classList.add("fv-visible");
    document.body.style.overflow = "hidden";
}

function closeFileViewer() {
    const overlay = document.getElementById("fileViewerOverlay");
    const frame   = document.getElementById("fileViewerFrame");

    overlay.classList.remove("fv-visible");
    document.body.style.overflow = "";

    setTimeout(() => {
        frame.src     = "";
        frame.onload  = null;
        frame.onerror = null;
    }, 280);
}

function showViewerFallback(url, fileName) {
    const loading   = document.getElementById("fileViewerLoading");
    const frameWrap = document.querySelector(".fv-frame-wrap");

    loading.style.display   = "none";
    frameWrap.style.display = "none";

    const prevErr = document.getElementById("fvErrorMsg");
    if (prevErr) prevErr.remove();

    const errMsg = document.createElement("div");
    errMsg.id    = "fvErrorMsg";
    errMsg.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px 32px;
        gap: 14px;
        text-align: center;
    `;
    errMsg.innerHTML = `
        <i class="bi bi-exclamation-circle" style="font-size:44px; color:#d97706;"></i>
        <div style="font-size:15px; font-weight:700; color:#1a2e1a;">Unable to preview this file</div>
        <div style="font-size:13px; color:#6b7280; max-width:300px; line-height:1.7;">
            The PDF viewer could not load this document inline.
            You can download it to view it on your device.
        </div>
        <a href="${url}" target="_blank"
           style="display:inline-flex; align-items:center; gap:8px; margin-top:6px;
                  padding:11px 24px; border-radius:10px;
                  background:linear-gradient(135deg,#427A43,#2e7d32);
                  color:#fff; font-size:13.5px; font-weight:600;
                  text-decoration:none; box-shadow:0 4px 14px rgba(66,122,67,0.35);">
            <i class="bi bi-download"></i> Download File
        </a>
    `;

    document.querySelector(".fv-dialog").appendChild(errMsg);
}