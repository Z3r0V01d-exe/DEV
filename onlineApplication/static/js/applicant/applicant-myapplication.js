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

    // Timeline steps
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

                    if (state === "done") {
                        dotContent = `<i class="bi bi-check" style="font-size:8px;"></i>`;
                    }
                    if (state === "rejected") {
                        dotCls     = "tl-dot rejected";
                        dotContent = `<i class="bi bi-x" style="font-size:8px;"></i>`;
                    }

                    return `
                        <div class="tl-step">
                            <div class="tl-dot-row">
                                ${i > 0   ? `<div class="${segCls}"></div>`          : `<div class="tl-seg invisible"></div>`}
                                <div class="${dotCls}">${dotContent}</div>
                                ${!isLast ? `<div class="${segCls}"></div>`          : `<div class="tl-seg invisible"></div>`}
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
        
        // Use vacancy data if available, fallback to vacancySnapshot for deleted vacancies
        const position   = app.vacancy?.positionTitle || app.vacancySnapshot?.positionTitle || "—";
        const office     = app.vacancy?.office || app.vacancySnapshot?.office || app.vacancy?.department || app.vacancySnapshot?.department || "DENR";
        const appliedOn  = formatDate(app.appliedAt);
        const jobType    = app.jobType || "Full-Time";
        const appId      = app._id;
        const shortId    = appId.slice(-6).toUpperCase();
        const resumeUrl  = app.resume?.url || "";
        const resumeName = `${app.lastName || ""}_${app.firstName || ""}_Resume.pdf`;
        const isVacancyDeleted = app.vacancy?.isDeleted || (!app.vacancy && app.vacancySnapshot);

        return `
            <div class="myapp-card"
                data-status="${status}"
                data-position="${position.toLowerCase()}"
                data-office="${office.toLowerCase()}"
                style="animation-delay:${index * 55}ms;"
                ${isVacancyDeleted ? 'title="Position has been archived"' : ''}>

                <!-- Colored top accent bar -->
                <div class="myapp-card-tbar ${cfg.barCls}"></div>

                <div class="myapp-card-body">

                    <!-- Status icon -->
                    <div class="myapp-card-icon ${cfg.iconCls}">
                        <i class="bi ${cfg.icon}"></i>
                    </div>

                    <!-- Main info + timeline -->
                    <div class="myapp-card-info">
                        <div class="myapp-card-position">
                            ${position}
                            ${isVacancyDeleted ? '<span style="font-size:10px; margin-left:6px; padding:2px 6px; background:#f3f4f6; color:#6b7280; border-radius:3px;"><i class="bi bi-archive me-1" style="font-size:9px;"></i>Archived</span>' : ''}
                        </div>
                        <div class="myapp-card-office">
                            <i class="bi bi-building me-1"></i>${office}
                        </div>
                        <div class="myapp-card-meta">
                            <span><i class="bi bi-calendar3 me-1"></i>${appliedOn}</span>
                            <span><i class="bi bi-briefcase me-1"></i>${jobType}</span>
                            <span class="myapp-card-id">
                                <i class="bi bi-hash me-1"></i>${shortId}
                            </span>
                        </div>

                        <!-- Mini progress timeline -->
                        ${buildTimeline(status)}
                    </div>

                    <!-- Status pill + action buttons -->
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

    // ── Render filtered + sorted cards ────────────────────────────────────

    function renderCards() {
        const query   = searchInput.value.trim().toLowerCase();
        const sortVal = sortSelect.value;

        let filtered = allApplications.filter(app => {
            const status   = app.status || "pending";
            const position = (app.vacancy?.positionTitle || "").toLowerCase();
            const office   = (app.vacancy?.office || app.vacancy?.department || "").toLowerCase();

            const matchFilter = activeFilter === "all" || status === activeFilter;
            const matchSearch = !query || position.includes(query) || office.includes(query);

            return matchFilter && matchSearch;
        });

        filtered.sort((a, b) => {
            if (sortVal === "newest") return new Date(b.appliedAt) - new Date(a.appliedAt);
            if (sortVal === "oldest") return new Date(a.appliedAt) - new Date(b.appliedAt);
            if (sortVal === "az") {
                return (a.vacancy?.positionTitle || "").toLowerCase()
                    .localeCompare((b.vacancy?.positionTitle || "").toLowerCase());
            }
            return 0;
        });

        grid.innerHTML = filtered.map((app, i) => buildCard(app, i)).join("");
        appCountChip.textContent = `${filtered.length} of ${allApplications.length}`;
        noResults.classList.toggle("d-none", filtered.length > 0);
    }

    // ── Filter pills ──────────────────────────────────────────────────────

    filterPills.forEach(pill => {
        pill.addEventListener("click", function () {
            filterPills.forEach(p => p.classList.remove("active"));
            this.classList.add("active");
            activeFilter = this.dataset.filter;
            renderCards();
        });
    });

    // ── Search & sort ─────────────────────────────────────────────────────

    searchInput.addEventListener("input", renderCards);
    sortSelect.addEventListener("change", renderCards);

    // ── Card click delegation ─────────────────────────────────────────────

    grid.addEventListener("click", function (e) {

        // View application detail page
        const viewBtn = e.target.closest(".btn-view-app");
        if (viewBtn) {
            window.location.href = `application-detail.html?id=${viewBtn.dataset.id}`;
            return;
        }

        // Open resume in overlay viewer
        const resumeBtn = e.target.closest(".btn-view-resume");
        if (resumeBtn) {
            openFileViewer(resumeBtn.dataset.url, resumeBtn.dataset.name);
        }
    });

    // ── Overlay: close on backdrop click ─────────────────────────────────

    document.getElementById("fileViewerOverlay").addEventListener("click", function (e) {
        if (e.target === this) closeFileViewer();
    });

    // ── Overlay: close on Escape key ─────────────────────────────────────

    document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeFileViewer();
    });

    // ── Fetch applications from backend ───────────────────────────────────

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

        // Log all resume URLs for debugging
        console.log("📱 All applications loaded:", allApplications.map(app => ({
            id: app._id,
            position: app.vacancy?.positionTitle,
            resumeUrl: app.resume?.url || "NO RESUME",
            hasResumeObject: !!app.resume
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
// FILE VIEWER OVERLAY FUNCTIONS
// ==============================

function openFileViewer(url, fileName) {
    const overlay  = document.getElementById("fileViewerOverlay");
    const frame    = document.getElementById("fileViewerFrame");
    const nameEl   = document.getElementById("fileViewerName");
    const dlBtn    = document.getElementById("fileViewerDownload");
    const loading  = document.getElementById("fileViewerLoading");
    const frameWrap = document.querySelector(".fv-frame-wrap");

    // Log the URL being opened
    console.log("🔍 Opening file viewer:", { url, fileName });

    // Reset UI
    frame.src             = "";
    loading.style.display = "flex";
    frameWrap.style.display = "block";

    // Remove any previous error message
    const prevErr = document.getElementById("fvErrorMsg");
    if (prevErr) prevErr.remove();

    nameEl.textContent = fileName || "Resume";
    dlBtn.href         = url;
    dlBtn.setAttribute("download", fileName || "document.pdf");
    dlBtn.target       = "_blank";

    // Normalize URL
    let normalizedUrl = url;
    if (!normalizedUrl.startsWith("http://") && !normalizedUrl.startsWith("https://") && !normalizedUrl.startsWith("/")) {
        normalizedUrl = "https://" + normalizedUrl;
    }

    console.log("✅ Normalized URL:", normalizedUrl);

    // Determine URL type
    const isLocal = url.includes("localhost") || url.includes("127.0.0.1") || url.startsWith("/");
    const isBackendProxy = url.includes("/api/cloudinary-file") || url.includes("localhost:5000");
    const isCloudinary = url.includes("cloudinary.com") || url.includes("res.cloudinary.com");

    console.log("🌐 URL type:", { isLocal, isBackendProxy, isCloudinary });

    if (isLocal || isBackendProxy) {
        // For local URLs or backend proxy: load directly
        console.log("📦 Loading from local/backend...");
        setTimeout(() => { frame.src = normalizedUrl; }, 80);
    } else if (isCloudinary) {
        // For direct Cloudinary URLs: try direct first, then fallback
        console.log("☁️ Loading from Cloudinary (direct)...");
        setTimeout(() => { frame.src = normalizedUrl; }, 80);
    } else {
        // For other remote URLs: use Google Docs Viewer
        const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(normalizedUrl)}&embedded=true`;
        console.log("🔗 Using Google Docs Viewer...");
        setTimeout(() => { frame.src = viewerUrl; }, 80);
    }

    // Error handling with fallback
    const errorHandler = () => {
        console.error("❌ Primary loading method failed");
        
        const stillLoading = document.getElementById("fileViewerLoading");
        if (!stillLoading || stillLoading.style.display === "none") return;

        // For Cloudinary URLs, try Google Docs Viewer as fallback
        if (isCloudinary && !frame.src.includes("docs.google.com")) {
            console.log("🔄 Fallback: Trying Google Docs Viewer...");
            const viewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(normalizedUrl)}&embedded=true`;
            setTimeout(() => { frame.src = viewerUrl; }, 500);
            return;
        }

        // Final fallback: show download option
        console.warn("⚠️ All loading methods failed - showing download fallback");
        stillLoading.style.display = "none";
        frameWrap.style.display    = "none";

        const errMsg = document.createElement("div");
        errMsg.id    = "fvErrorMsg";
        errMsg.style.cssText = `
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 48px 32px;
            gap: 12px;
            text-align: center;
        `;
        errMsg.innerHTML = `
            <i class="bi bi-exclamation-circle" style="font-size:40px; color:#d97706;"></i>
            <div style="font-size:15px; font-weight:700; color:#1a2e1a;">
                Unable to preview this file
            </div>
            <div style="font-size:13px; color:#6b7280; max-width:320px; line-height:1.6;">
                Your browser could not render this PDF inline.
                You can still download it to view it locally.
            </div>
            <a href="${url}" download="${fileName || 'document.pdf'}" target="_blank"
               style="display:inline-flex; align-items:center; gap:7px; margin-top:8px;
                      padding:10px 22px; border-radius:10px;
                      background:linear-gradient(135deg,#427A43,#2e7d32);
                      color:#fff; font-size:13.5px; font-weight:600;
                      text-decoration:none; box-shadow:0 4px 14px rgba(66,122,67,0.35);">
                <i class="bi bi-download"></i> Download File
            </a>
        `;

        document.querySelector(".fv-dialog").appendChild(errMsg);
    };

    // Timeout-based fallback
    const errorTimer = setTimeout(() => {
        const stillLoading = document.getElementById("fileViewerLoading");
        if (stillLoading && stillLoading.style.display !== "none") {
            errorHandler();
        }
    }, 12000);

    // Handle iframe load success
    frame.addEventListener("load", () => {
        console.log("✅ File viewer loaded successfully");
        clearTimeout(errorTimer);
    }, { once: true });
    
    // Handle iframe error
    frame.addEventListener("error", () => {
        console.error("❌ File viewer iframe error");
        clearTimeout(errorTimer);
        errorHandler();
    }, { once: true });

    overlay.classList.add("fv-visible");
    document.body.style.overflow = "hidden";
}

function closeFileViewer() {
    const overlay = document.getElementById("fileViewerOverlay");
    const frame   = document.getElementById("fileViewerFrame");

    // Hide overlay
    overlay.classList.remove("fv-visible");
    document.body.style.overflow = "";

    // Clear iframe src after fade-out so the browser stops loading
    setTimeout(() => { frame.src = ""; }, 280);
}