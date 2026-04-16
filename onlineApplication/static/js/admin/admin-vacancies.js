// ==============================
// GLOBAL STATE
// ==============================
let addVacancyModal;
let editModal;
let editingVacancyId = null;

let allVacancies = [];
let sortState = {
    field: null,
    order: "desc"
};

// ==============================
// UTILITIES
// ==============================
function showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");

    const toast = document.createElement("div");
    toast.className = `toast align-items-center text-bg-${type} border-0 show mb-2`;
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button class="btn-close btn-close-white me-2 m-auto" onclick="this.closest('.toast').remove()"></button>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => toast.remove(), 3000);
}

function confirmAction(message, callback) {
    const modalEl = document.getElementById("confirmModal");
    const modal = new bootstrap.Modal(modalEl);

    document.getElementById("confirmMessage").innerText = message;

    const yesBtn = document.getElementById("confirmYesBtn");

    // 🔥 CLONE BUTTON (removes old listeners completely)
    const newYesBtn = yesBtn.cloneNode(true);
    yesBtn.parentNode.replaceChild(newYesBtn, yesBtn);

    newYesBtn.onclick = () => {
        modal.hide();
        callback();
    };

    modal.show();
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
        month: "2-digit",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });
}

function formatForInput(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toISOString().slice(0, 16);
}

function cleanDescription(text) {
    return text
        .trim()
        .replace(/\n/g, "<br>");
}

// ==============================
// MODAL CONTROLS
// ==============================
function openAddVacancy() {
    editingVacancyId = null;
    document.getElementById("vacancyForm").reset();

    addVacancyModal = new bootstrap.Modal(document.getElementById('addVacancyModal'));
    addVacancyModal.show();
}

function closeAddVacancy() {
    if (addVacancyModal) addVacancyModal.hide();
}

function closeEditModal() {
    confirmAction("Discard changes?", () => {
        if (editModal) {
            editModal.hide();

            // 🔥 IMPORTANT: remove leftover backdrop manually (fix overlay bug)
            document.body.classList.remove("modal-open");
            document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
        }
    });
}

// ==============================
// SAVE / LOAD
// ==============================
async function saveVacancy() {
    const positionTitle = document.getElementById("positionTitle").value;
    const office = document.getElementById("denrOffice").value;
    const openingDate = document.getElementById("openingDate").value;
    const closingDate = document.getElementById("closingDate").value;
    const description = cleanDescription(document.getElementById("jobDescription").value);
    const adminId = localStorage.getItem("userId");

    if (!positionTitle || !office || !closingDate || !description) {
        showToast("Please fill all fields", "danger");
        return;
    }

    const url = editingVacancyId
        ? `http://localhost:5000/api/vacancies/${editingVacancyId}`
        : `http://localhost:5000/api/vacancies`;

    const method = editingVacancyId ? "PUT" : "POST";

    const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ positionTitle, office, openingDate, closingDate, description, adminId })
    });

    const data = await res.json();

    if (!data.success) return showToast("Save failed", "danger");

    showToast(editingVacancyId ? "Updated successfully" : "Created successfully");
    closeAddVacancy();
    loadVacancies();
}

async function loadVacancies() {
    const adminId = localStorage.getItem("userId");
    const res = await fetch(`http://localhost:5000/api/vacancies?adminId=${adminId}`);
    const data = await res.json();

    allVacancies = data.vacancies || [];

    populateOfficeFilter();
    applyFilters();
}

// ==============================
// SEARCH & FILTER
// ==============================
function populateOfficeFilter() {
    const select = document.getElementById("filterOffice");
    const offices = [...new Set(allVacancies.map(v => v.office))];

    select.innerHTML = `<option value="">All Offices</option>` +
        offices.map(o => `<option value="${o}">${o}</option>`).join("");
}

function applyFilters() {
    let filtered = [...allVacancies];

    const search = document.getElementById("searchInput").value.toLowerCase();
    const office = document.getElementById("filterOffice").value;
    const alpha = document.getElementById("sortAlpha").value;

    if (search) {
        filtered = filtered.filter(v =>
            v.positionTitle.toLowerCase().includes(search)
        );
    }

    if (office) {
        filtered = filtered.filter(v => v.office === office);
    }

    if (alpha === "asc") filtered.sort((a, b) => a.positionTitle.localeCompare(b.positionTitle));
    if (alpha === "desc") filtered.sort((a, b) => b.positionTitle.localeCompare(a.positionTitle));

    if (sortState.field) {
        filtered.sort((a, b) => {
            const aDate = new Date(a[sortState.field]);
            const bDate = new Date(b[sortState.field]);
            return sortState.order === "asc" ? aDate - bDate : bDate - aDate;
        });
    }

    renderTable(filtered);
}

// ==============================
// TABLE RENDER
// ==============================
function renderTable(data) {
    const table = document.getElementById("vacanciesTable");

    if (!data.length) {
        table.innerHTML = `<tr><td colspan="7" class="text-center">No results</td></tr>`;
        return;
    }

    table.innerHTML = data.map(v => `
        <tr onclick='viewVacancy(${JSON.stringify(v)})'>
            <td>${v.positionTitle}</td>
            <td>${v.office}</td>
            <td>${formatDateTime(v.openingDate)}</td>
            <td>${formatDateTime(v.closingDate)}</td>
            <td>${v.applicants || 0}</td>
            <td>
                <span class="badge ${v.status === 'Closed' ? 'bg-danger' : 'bg-success'}">
                    ${v.status}
                </span>
            </td>
            <td class="text-center">

                <button class="btn btn-outline-primary btn-sm"
                    onclick='event.stopPropagation(); openEditVacancy(${JSON.stringify(v)})'>
                    <i class="bi bi-pencil"></i>
                </button>

                <button class="btn btn-outline-warning btn-sm"
                    onclick="event.stopPropagation(); toggleVacancyStatus('${v._id}', '${v.status}')">
                    <i class="bi ${v.status === 'Closed' ? 'bi-lock-fill' : 'bi-unlock-fill'}"></i>
                </button>

                <button class="btn btn-outline-danger btn-sm"
                    onclick="event.stopPropagation(); deleteVacancy('${v._id}')">
                    <i class="bi bi-trash"></i>
                </button>

            </td>
        </tr>
    `).join("");
}

// ==============================
// SORT ICONS (FIXED)
// ==============================
function toggleSort(field) {
    if (sortState.field === field) {
        sortState.order = sortState.order === "asc" ? "desc" : "asc";
    } else {
        sortState.field = field;
        sortState.order = "desc";
    }

    updateSortIcons();
    applyFilters();
}

function updateSortIcons() {
    const openIcon = document.getElementById("sortOpenIcon");
    const closeIcon = document.getElementById("sortCloseIcon");

    // REMOVE ONLY ARROWS (NOT BASE CLASS)
    openIcon.classList.remove("bi-arrow-up", "bi-arrow-down");
    closeIcon.classList.remove("bi-arrow-up", "bi-arrow-down");

    // DEFAULT
    let openClass = "bi-arrow-down";
    let closeClass = "bi-arrow-down";

    if (sortState.field === "openingDate") {
        openClass = sortState.order === "asc" ? "bi-arrow-up" : "bi-arrow-down";
    }

    if (sortState.field === "closingDate") {
        closeClass = sortState.order === "asc" ? "bi-arrow-up" : "bi-arrow-down";
    }

    openIcon.classList.add(openClass);
    closeIcon.classList.add(closeClass);
}

// ==============================
// EDIT / VIEW
// ==============================
function openEditVacancy(v) {
    editingVacancyId = v._id;

    document.getElementById("editPositionTitle").value = v.positionTitle;
    document.getElementById("editDenrOffice").value = v.office;
    document.getElementById("editOpeningDate").value = formatForInput(v.openingDate);
    document.getElementById("editClosingDate").value = formatForInput(v.closingDate);
    document.getElementById("editJobDescription").value = v.description;

    // ✅ CONNECT STATUS BUTTON
    const statusBtn = document.getElementById("toggleStatusBtn");

    statusBtn.onclick = () => {
        toggleVacancyStatus(v._id, v.status);
    };

    editModal = new bootstrap.Modal(document.getElementById("editVacancyModal"));
    editModal.show();
}

function viewVacancy(v) {
    document.getElementById("viewTitle").innerText = v.positionTitle;
    document.getElementById("viewOffice").innerText = v.office;
    document.getElementById("viewDateRange").innerText =
        `${formatDateTime(v.openingDate)} - ${formatDateTime(v.closingDate)}`;
    document.getElementById("viewApplicantCount").innerText = v.applicants || 0;
    document.getElementById("viewDescription").innerHTML = v.description;

    const modal = new bootstrap.Modal(document.getElementById("viewVacancyModal"));
    modal.show();
}

// ==============================
// UPDATE / STATUS / DELETE
// ==============================
function updateVacancy() {
    confirmAction("Save changes?", async () => {

        const positionTitle = document.getElementById("editPositionTitle").value;
        const office = document.getElementById("editDenrOffice").value;
        const openingDate = document.getElementById("editOpeningDate").value;
        const closingDate = document.getElementById("editClosingDate").value;
        const description = cleanDescription(document.getElementById("editJobDescription").value);

        const res = await fetch(`http://localhost:5000/api/vacancies/${editingVacancyId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ positionTitle, office, openingDate, closingDate, description })
        });

        const data = await res.json();

        if (!data.success) return showToast("Update failed", "danger");

        showToast("Updated successfully");
        if (editModal) {
            editModal.hide();
            document.body.classList.remove("modal-open");
            document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
        }
        loadVacancies();
    });
}

function toggleVacancyStatus(id, currentStatus) {
    const newStatus = currentStatus === "Closed" ? "Open" : "Closed";

    confirmAction(`Change status to ${newStatus}?`, async () => {

        await fetch(`http://localhost:5000/api/vacancies/${id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus })
        });

        showToast(`Status changed to ${newStatus}`);
        loadVacancies();
    });
}

function deleteVacancy(id) {
    confirmAction("Delete this vacancy?", async () => {

        await fetch(`http://localhost:5000/api/vacancies/${id}`, {
            method: "DELETE"
        });

        showToast("Deleted successfully", "danger");
        loadVacancies();
    });
}

// ==============================
// INIT
// ==============================
document.addEventListener("DOMContentLoaded", () => {
    loadVacancies();
});