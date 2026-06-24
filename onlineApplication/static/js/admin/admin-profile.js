// ==============================
// ADMIN PROFILE PAGE
// ==============================

const API = "http://localhost:5000/api";

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
    loadAdminProfile();

    // Password strength meter
    const newPassEl = document.getElementById("newPassword");
    if (newPassEl) {
        newPassEl.addEventListener("input", function () {
            checkPasswordStrength(this.value);
        });
    }

    // Close email modal on backdrop click
    const emailOverlay = document.getElementById("emailModalOverlay");
    if (emailOverlay) {
        emailOverlay.addEventListener("click", function (e) {
            if (e.target === this) closeEmailModal();
        });
    }

    // Close modal on Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeEmailModal();
    });
});

// ── Load admin profile ─────────────────────────────────────────────────────
async function loadAdminProfile() {
    const adminId = localStorage.getItem("userId");

    if (!adminId) {
        showToast("profileSaveToast", "Session expired. Please log in again.", "error");
        return;
    }

    try {
        const res  = await fetch(`${API}/admin/profile?adminId=${adminId}`);
        const data = await res.json();

        if (!res.ok || !data.success) throw new Error(data.message || "Failed to load profile");

        const admin = data.admin;

        // Full name
        const fullName = `${admin.firstName || ""} ${admin.lastName || ""}`.trim() || "Admin";

        // Profile card (left side)
        setEl("adminName",        fullName);
        setEl("adminEmail",       admin.email || "—");
        setEl("adminOffice",      admin.office || "—");
        setEl("adminLastLogin",   formatDateTime(admin.lastLogin) || "—");

        // Initials avatar
        const initials = `${(admin.firstName || "A").charAt(0)}${(admin.lastName || "D").charAt(0)}`.toUpperCase();
        setEl("profAvatarInitials", initials);

        // Right panel — read-only fields
        setEl("profileFullName", fullName);
        setEl("profileEmail",    admin.email || "—");

        // Pre-select office in dropdown
        const officeSelect = document.getElementById("adminOfficeEdit");
        if (officeSelect && admin.office) {
            const opt = [...officeSelect.options].find(o => o.value === admin.office);
            if (opt) opt.selected = true;
        }

        // Activity log
        renderActivityLog(admin.activityLog || []);

    } catch (err) {
        console.error("❌ loadAdminProfile error:", err);
        showToast("profileSaveToast", "Failed to load profile data.", "error");
    }
}

// ── Save profile (office only) ─────────────────────────────────────────────
async function saveProfile() {
    const adminId = localStorage.getItem("userId");
    const office  = document.getElementById("adminOfficeEdit")?.value;
    const btn     = document.getElementById("saveProfileBtn");

    if (!adminId || !office) return;

    setButtonLoading(btn, "Saving...");

    try {
        const res  = await fetch(`${API}/admin/profile/${adminId}`, {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ office })
        });
        const data = await res.json();

        if (!res.ok || !data.success) throw new Error(data.message || "Failed to save");

        // Update left card
        setEl("adminOffice", office);

        showToast("profileSaveToast", "Office updated successfully.", "success");

    } catch (err) {
        console.error("❌ saveProfile error:", err);
        showToast("profileSaveToast", err.message || "Failed to save changes.", "error");
    } finally {
        restoreButton(btn, `<i class="bi bi-check-circle me-1"></i> Save Changes`);
    }
}

// ── Open / Close email modal ───────────────────────────────────────────────
function openEmailModal() {
    document.getElementById("newEmail").value            = "";
    document.getElementById("emailConfirmPassword").value = "";
    hideToast("emailModalToast");
    document.getElementById("emailModalOverlay").style.display = "flex";
    document.body.style.overflow = "hidden";
    setTimeout(() => document.getElementById("newEmail")?.focus(), 100);
}

function closeEmailModal() {
    document.getElementById("emailModalOverlay").style.display = "none";
    document.body.style.overflow = "";
}

// ── Save email ─────────────────────────────────────────────────────────────
async function saveEmail() {
    const adminId  = localStorage.getItem("userId");
    const newEmail = document.getElementById("newEmail")?.value.trim();
    const password = document.getElementById("emailConfirmPassword")?.value;
    const btn      = document.getElementById("saveEmailBtn");

    // Validate
    if (!newEmail) {
        showToast("emailModalToast", "Please enter a new email address.", "error");
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
        showToast("emailModalToast", "Please enter a valid email address.", "error");
        return;
    }

    if (!password) {
        showToast("emailModalToast", "Please enter your current password to confirm.", "error");
        return;
    }

    setButtonLoading(btn, "Updating...");

    try {
        const res  = await fetch(`${API}/admin/profile/${adminId}/email`, {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ newEmail, currentPassword: password })
        });
        const data = await res.json();

        if (!res.ok || !data.success) throw new Error(data.message || "Failed to update email");

        // Update both display fields
        setEl("adminEmail",   newEmail);
        setEl("profileEmail", newEmail);

        closeEmailModal();
        showToast("profileSaveToast", "Email updated successfully.", "success");

    } catch (err) {
        console.error("❌ saveEmail error:", err);
        showToast("emailModalToast", err.message || "Failed to update email.", "error");
    } finally {
        restoreButton(btn, `<i class="bi bi-check-circle me-1"></i> Update Email`);
    }
}

// ── Change password ────────────────────────────────────────────────────────
async function changePassword() {
    const adminId    = localStorage.getItem("userId");
    const current    = document.getElementById("currentPassword")?.value;
    const newPass    = document.getElementById("newPassword")?.value;
    const confirm    = document.getElementById("confirmPassword")?.value;
    const btn        = document.getElementById("changePassBtn");

    // Validate
    if (!current) {
        showToast("passwordToast", "Please enter your current password.", "error");
        return;
    }

    if (!newPass || newPass.length < 8) {
        showToast("passwordToast", "New password must be at least 8 characters.", "error");
        return;
    }

    if (newPass !== confirm) {
        showToast("passwordToast", "Passwords do not match.", "error");
        return;
    }

    setButtonLoading(btn, "Updating...");

    try {
        const res  = await fetch(`${API}/admin/profile/${adminId}/password`, {
            method:  "PATCH",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ currentPassword: current, newPassword: newPass })
        });
        const data = await res.json();

        if (!res.ok || !data.success) throw new Error(data.message || "Failed to update password");

        // Clear fields
        ["currentPassword","newPassword","confirmPassword"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.value = "";
        });

        document.getElementById("strengthWrap").style.display = "none";
        showToast("passwordToast", "Password updated successfully.", "success");

    } catch (err) {
        console.error("❌ changePassword error:", err);
        showToast("passwordToast", err.message || "Failed to update password.", "error");
    } finally {
        restoreButton(btn, `<i class="bi bi-lock me-1"></i> Update Password`);
    }
}

// ── Activity log ───────────────────────────────────────────────────────────
function renderActivityLog(logs) {
    const tbody = document.getElementById("adminActivityLog");
    if (!tbody) return;

    if (!logs.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="2" class="text-center text-muted py-5">
                    <i class="bi bi-journal-x fs-3 d-block mb-2" style="color:#d1d5db;"></i>
                    No activity recorded yet.
                </td>
            </tr>
        `;
        return;
    }

    const recentLogs = [...logs].reverse().slice(0, 10);

    tbody.innerHTML = recentLogs.map((log, i) => `
        <tr class="prof-activity-row" style="animation-delay:${i * 30}ms;">
            <td>
                <div class="prof-activity-action">
                    <span class="prof-activity-dot"></span>
                    ${log.action || "—"}
                </div>
            </td>
            <td class="prof-activity-date">${formatDateTime(log.date) || "—"}</td>
        </tr>
    `).join("");
}

// ── Password strength checker ──────────────────────────────────────────────
function checkPasswordStrength(password) {
    const wrap  = document.getElementById("strengthWrap");
    const fill  = document.getElementById("strengthFill");
    const label = document.getElementById("strengthLabel");

    if (!wrap || !fill || !label) return;

    if (!password) { wrap.style.display = "none"; return; }
    wrap.style.display = "flex";

    let score = 0;
    if (password.length >= 8)                       score++;
    if (password.length >= 12)                      score++;
    if (/[A-Z]/.test(password))                     score++;
    if (/[0-9]/.test(password))                     score++;
    if (/[^A-Za-z0-9]/.test(password))              score++;

    const levels = [
        { pct: "20%",  color: "#ef4444", text: "Very Weak"  },
        { pct: "40%",  color: "#f97316", text: "Weak"       },
        { pct: "60%",  color: "#f59e0b", text: "Fair"       },
        { pct: "80%",  color: "#84cc16", text: "Strong"     },
        { pct: "100%", color: "#22c55e", text: "Very Strong" }
    ];

    const level         = levels[Math.min(score, levels.length) - 1] || levels[0];
    fill.style.width     = level.pct;
    fill.style.background = level.color;
    label.textContent    = level.text;
    label.style.color    = level.color;
}

// ── Toggle password visibility ─────────────────────────────────────────────
function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === "password") {
        input.type  = "text";
        btn.innerHTML = `<i class="bi bi-eye-slash"></i>`;
    } else {
        input.type  = "password";
        btn.innerHTML = `<i class="bi bi-eye"></i>`;
    }
}

// ── Utility: set element text ──────────────────────────────────────────────
function setEl(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

// ── Utility: format date ───────────────────────────────────────────────────
function formatDateTime(dateStr) {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-PH", {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

// ── Utility: button loading state ─────────────────────────────────────────
function setButtonLoading(btn, text) {
    if (!btn) return;
    btn.disabled   = true;
    btn.dataset.original = btn.innerHTML;
    btn.innerHTML  = `<span class="prof-btn-spinner"></span> ${text}`;
}

function restoreButton(btn, html) {
    if (!btn) return;
    btn.disabled  = false;
    btn.innerHTML = btn.dataset.original || html;
}

// ── Utility: inline toast ─────────────────────────────────────────────────
function showToast(containerId, message, type = "success") {
    const el = document.getElementById(containerId);
    if (!el) return;

    const colors = {
        success: { bg: "#dcfce7", border: "#86efac", color: "#166534", icon: "bi-check-circle-fill" },
        error:   { bg: "#fee2e2", border: "#fca5a5", color: "#991b1b", icon: "bi-x-circle-fill"     },
        info:    { bg: "#e0f2fe", border: "#7dd3fc", color: "#075985", icon: "bi-info-circle-fill"   }
    };

    const c = colors[type] || colors.info;

    el.style.cssText = `
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 11px 14px;
        background: ${c.bg};
        border: 1px solid ${c.border};
        border-radius: 10px;
        font-size: 13px;
        font-weight: 500;
        color: ${c.color};
    `;
    el.innerHTML = `<i class="bi ${c.icon}" style="flex-shrink:0;font-size:15px;"></i> ${message}`;

    clearTimeout(el._timer);
    el._timer = setTimeout(() => hideToast(containerId), 4500);
}

function hideToast(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "none";
}