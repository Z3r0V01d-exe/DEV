// ==================
// APPLICATION - MAIN FUNCTION
// ==================

// ==============================
// TOAST NOTIFICATION SYSTEM
// ==============================

function initToastContainer() {
    if (document.getElementById('toastContainer')) return;

    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        max-width: 360px;
        width: 100%;
        pointer-events: none;
    `;
    document.body.appendChild(container);
}

/**
 * Show a toast notification.
 * @param {string} message  - The message to display
 * @param {'error'|'warning'|'success'|'info'} type - Toast type
 * @param {number} duration - Auto-dismiss in ms (default 4500)
 */
function showToast(message, type = 'error', duration = 4500) {
    initToastContainer();
    const container = document.getElementById('toastContainer');

    const styles = {
        error:   { bg: '#d32f2f', icon: 'bi-x-circle-fill',            label: 'Error'   },
        warning: { bg: '#f57c00', icon: 'bi-exclamation-triangle-fill', label: 'Warning' },
        success: { bg: '#2e7d32', icon: 'bi-check-circle-fill',         label: 'Success' },
        info:    { bg: '#0277bd', icon: 'bi-info-circle-fill',          label: 'Info'    }
    };

    const { bg, icon, label } = styles[type] || styles.error;

    const toast = document.createElement('div');
    toast.style.cssText = `
        position: relative;
        overflow: hidden;
        background: ${bg};
        color: #fff;
        border-radius: 10px;
        padding: 14px 16px;
        display: flex;
        align-items: flex-start;
        gap: 12px;
        box-shadow: 0 4px 18px rgba(0,0,0,0.22);
        pointer-events: all;
        opacity: 0;
        transform: translateX(60px);
        transition: opacity 0.28s ease, transform 0.28s ease;
        min-width: 260px;
    `;

    toast.innerHTML = `
        <i class="bi ${icon}" style="font-size:1.25rem;flex-shrink:0;margin-top:1px;"></i>
        <div style="flex:1;min-width:0;">
            <div style="font-weight:700;font-size:0.8rem;letter-spacing:0.04em;text-transform:uppercase;opacity:0.85;margin-bottom:2px;">${label}</div>
            <div style="font-size:0.92rem;line-height:1.4;">${message}</div>
        </div>
        <button style="background:none;border:none;color:#fff;opacity:0.75;cursor:pointer;font-size:1rem;padding:0;margin-left:4px;flex-shrink:0;line-height:1;" aria-label="Close">
            <i class="bi bi-x-lg"></i>
        </button>
    `;

    // Progress bar
    const progress = document.createElement('div');
    progress.style.cssText = `
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        width: 100%;
        background: rgba(255,255,255,0.45);
        border-radius: 0 0 10px 10px;
        transition: width linear ${duration}ms;
    `;
    toast.appendChild(progress);
    container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(0)';
        });
    });

    // Start progress bar shrink
    setTimeout(() => { progress.style.width = '0%'; }, 50);

    // Dismiss logic
    const dismiss = () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(60px)';
        setTimeout(() => toast.remove(), 300);
    };

    const closeBtn = toast.querySelector('button');
    const timer = setTimeout(dismiss, duration);
    closeBtn.addEventListener('click', () => { clearTimeout(timer); dismiss(); });
}
// Keyword map: data-type value -> accepted keyword(s) to look for in filename
const FILE_TYPE_KEYWORDS = {
    'Resume':           ['resume', 'cv'],
    'CoverLetter':      ['coverletter', 'applicationletter', 'appletter', 'cover', 'application'],
    'EndorsementLetter': ['endorsementletter', 'endorsement']
};

function validateFile(file, type, input, dropZone) {
    const errorContainer = dropZone.parentElement.querySelector('.file-error');
    errorContainer.textContent = "";
    dropZone.classList.remove("error", "success");

    if (!file) return false;

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    const fileName = file.name.trim();
    const lowerFileName = fileName.toLowerCase();

    // 1. Must be a PDF
    if (!lowerFileName.endsWith(".pdf")) {
        errorContainer.textContent = "Only PDF files are allowed.";
        dropZone.classList.add("error");
        input.value = "";
        return false;
    }

    // 2. Must not exceed 5MB
    if (file.size > MAX_SIZE) {
        errorContainer.textContent = "File must not exceed 5MB.";
        dropZone.classList.add("error");
        input.value = "";
        return false;
    }

    // 3. Must contain an underscore (_) before the keyword
    //    Format: anything _ keyword .pdf  (case-insensitive, spaces stripped)
    const nameWithoutExt = lowerFileName.replace(/\.pdf$/, ''); // strip .pdf
    const parts = nameWithoutExt.split('_');                    // split by underscore

    if (parts.length < 2) {
        const labels = {
            'Resume': 'e.g. Dela_Cruz_Resume.pdf or Dela_Cruz_CV.pdf',
            'CoverLetter': 'e.g. Dela_Cruz_CoverLetter.pdf or Dela_Cruz_ApplicationLetter.pdf',
            'EndorsementLetter': 'e.g. Dela_Cruz_EndorsementLetter.pdf or Dela_Cruz_Endorsement.pdf'
        };
        errorContainer.textContent = `Filename must contain an underscore (_). ${labels[type] || ''}`;
        dropZone.classList.add("error");
        input.value = "";
        return false;
    }

    // Check if any part (after the first underscore) matches an accepted keyword
    const keywords = FILE_TYPE_KEYWORDS[type] || [];
    const partsAfterFirst = parts.slice(1); // everything after the first segment
    const hasKeyword = partsAfterFirst.some(part =>
        keywords.some(kw => part.replace(/\s+/g, '') === kw)
    );

    if (!hasKeyword) {
        const keywordDisplay = {
            'Resume': '"Resume" or "CV"',
            'CoverLetter': '"CoverLetter" or "ApplicationLetter"',
            'EndorsementLetter': '"EndorsementLetter" or "Endorsement"'
        };
        errorContainer.textContent =
            `Filename must include ${keywordDisplay[type] || 'the correct document type'} after an underscore (_).`;
        dropZone.classList.add("error");
        input.value = "";
        return false;
    }

    dropZone.classList.add("success");
    dropZone.querySelector(".drop-text").textContent = fileName;

    return true;
}

function scrollToFirstError() {
    const firstError = document.querySelector('.error');

    if (firstError) {
        firstError.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        if (typeof firstError.focus === "function") {
            firstError.focus();
        }
        return true;
    }

    return false;
}

function proceedApplication(event) {
    event.preventDefault();

    let isValid = true;

    // Clear previous errors
    document.querySelectorAll('.error, .show').forEach(el => {
        el.classList.remove('error', 'show');
    });

    // Validate all required text inputs (blank check)
    const requiredFields = [
        'lastName',
        'firstName',
        'address',
        'birthdate',
        'age',
        'email',
        'contact'
    ];

    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && field.value.trim() === '') {
            field.classList.add('error');
            isValid = false;
        }
    });

    // --- Email: must be a valid email format (contains @, domain, extension) ---
    const emailField = document.getElementById('email');
    if (emailField && emailField.value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailField.value.trim())) {
            emailField.classList.add('error');
            showToast('Please enter a valid email address (e.g. juan@email.com).', 'error');
            isValid = false;
        }
    }

    // --- Contact: accept +63XXXXXXXXXX or 09XXXXXXXXX (PH format, 11 digits) ---
    const contactField = document.getElementById('contact');
    if (contactField && contactField.value.trim() !== '') {
        const rawContact = contactField.value.trim().replace(/[\s\-]/g, '');
        const contactRegex = /^(\+639\d{9}|09\d{9})$/;
        if (!contactRegex.test(rawContact)) {
            contactField.classList.add('error');
            showToast('Enter a valid PH contact number (e.g. +639123456789 or 09123456789).', 'error');
            isValid = false;
        }
    }

    // --- Birthdate & Age: must be 18+, and age must match birthdate within ±1 year ---
    const birthdateField = document.getElementById('birthdate');
    const ageField       = document.getElementById('age');

    if (birthdateField && birthdateField.value) {
        const today     = new Date();
        const birthDate = new Date(birthdateField.value);

        // Calculate actual age from birthdate
        let actualAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            actualAge--;
        }

        // Must be at least 18
        if (actualAge < 18) {
            birthdateField.classList.add('error');
            if (ageField) ageField.classList.add('error');
            showToast('Applicant must be at least 18 years old.', 'error');
            isValid = false;
        } else if (ageField && ageField.value.trim() !== '') {
            // Age field must be close to actual computed age (within ±1)
            const enteredAge = parseInt(ageField.value.trim(), 10);
            if (Math.abs(enteredAge - actualAge) > 1) {
                birthdateField.classList.add('error');
                ageField.classList.add('error');
                showToast(
                    `Age (${enteredAge}) does not match birthdate (expected ~${actualAge}). Please check both fields.`,
                    'error'
                );
                isValid = false;
            }
        }
    }

    // Validate all education entries
    const educationBlocks = document.querySelectorAll('[data-entry="education"]');

    if (educationBlocks.length === 0) {
        showToast("Please add at least one education entry.", "error");
        isValid = false;
    }

    document.querySelectorAll('.school-input').forEach(input => {
        if (!input.value || input.value.trim() === '') {
            input.classList.add('error');
            isValid = false;
        }
    });

    document.querySelectorAll('.degree-input').forEach(select => {
        if (!select.value || select.value.trim() === '') {
            select.classList.add('error');
            isValid = false;
        }
    });

    // Validate Graduated radio for each education entry
    educationBlocks.forEach((entry, index) => {
        const entryNumber = index + 1;
        const graduatedChecked = entry.querySelector(`input[name="graduated_${entryNumber}"]:checked`);
        const radioContainer = entry.querySelector('.graduated-input')?.closest('.col-md-6');

        let errorMsg = entry.querySelector('.graduated-error');

        if (!graduatedChecked) {
            isValid = false;

            if (!errorMsg) {
                errorMsg = document.createElement("div");
                errorMsg.className = "graduated-error text-danger small mt-1";
                errorMsg.textContent = "* Please select if graduated";
                radioContainer.appendChild(errorMsg);
            }
        } else {
            if (errorMsg) errorMsg.remove();
        }
    });

    // Validate that jobType radio button is selected
    const jobTypeElement = document.querySelector('input[name="jobType"]:checked');
    const jobTypeGroup = document.getElementById('jobTypeGroup');
    const jobTypeError = document.getElementById('jobTypeError');

    if (!jobTypeElement) {
        jobTypeGroup.classList.add('error');
        jobTypeError.classList.remove('d-none');
        jobTypeError.textContent = '* Please select a Job Type';
        isValid = false;

        jobTypeGroup.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    } else {
        jobTypeGroup.classList.remove('error');
        jobTypeError.classList.add('d-none');
    }

    // Validate resume before proceeding
    const resumeInput = document.getElementById('resume');
    const resumeZone = resumeInput.closest('.drop-zone');
    const resumeFile = resumeInput.files[0];

    if (!resumeFile) {
        const errorContainer = resumeZone.parentElement.querySelector('.file-error');
        errorContainer.textContent = "* Resume is required";
        resumeZone.classList.add("error");
        isValid = false;
    }

    if (!isValid) {
        showToast("Please fill in all required fields before proceeding.", "error");
        scrollToFirstError();
        return;
    }

    // Get all form values
    const lastName = document.getElementById('lastName').value;
    const firstName = document.getElementById('firstName').value;
    const middleName = document.getElementById('middleName').value;
    const address = document.getElementById('address').value;
    const birthdate = document.getElementById('birthdate').value;
    const age = document.getElementById('age').value;
    const jobType = jobTypeElement.value;
    const email = document.getElementById('email').value;
    const contact = document.getElementById('contact').value;

    // Collect all education entries
    const educationEntries = [];
    const educationContainer = document.getElementById('educationContainer');

    educationContainer.querySelectorAll('.entry-item').forEach((entry, index) => {
        const entryNum = index + 1;
        const schoolInput = entry.querySelector(`.school-input`);
        const schoolFromInput = entry.querySelector(`.schoolFrom-input`);
        const schoolToInput = entry.querySelector(`.schoolTo-input`);
        const graduatedRadios = entry.querySelectorAll(`input[type="radio"][name="graduated_${entryNum}"]:checked`);
        const degreeInput = entry.querySelector(`.degree-input`);

        if (schoolInput.value.trim() !== '' || schoolFromInput.value || schoolToInput.value || degreeInput.value) {
            educationEntries.push({
                school: schoolInput.value,
                from: schoolFromInput.value,
                to: schoolToInput.value,
                graduated: graduatedRadios.length > 0 ? graduatedRadios[0].value : 'Not specified',
                degree: degreeInput.value
            });
        }
    });

    // Validate that at least one education entry exists
    if (educationEntries.length === 0) {
        educationContainer.style.borderLeft = '4px solid #d32f2f';
        isValid = false;

        educationContainer.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        return;
    } else {
        educationContainer.style.borderLeft = '4px solid #005F02';
    }

    // Collect all experience entries
    const experienceEntries = [];
    const experienceContainer = document.getElementById('experienceContainer');
    experienceContainer.querySelectorAll('.entry-item').forEach((entry, index) => {
        const companyInput = entry.querySelector(`.company-input`);
        const companyFromInput = entry.querySelector(`.companyFrom-input`);
        const companyToInput = entry.querySelector(`.companyTo-input`);
        const positionInput = entry.querySelector(`.position-input`);
        const reasonInput = entry.querySelector(`.reason-input`);

        if (companyInput.value.trim() !== '' || positionInput.value.trim() !== '') {
            experienceEntries.push({
                company: companyInput.value,
                from: companyFromInput.value,
                to: companyToInput.value,
                position: positionInput.value,
                reason: reasonInput.value
            });
        }
    });

    const resume = resumeInput.files[0]?.name || 'No file';
    const coverLetter = document.getElementById('coverLetter').files[0]?.name || 'No file';
    const endorsementLetter = document.getElementById('endorsementLetter').files[0]?.name || 'No file';

    // Populate review form
    document.getElementById('reviewLastName').textContent = lastName;
    document.getElementById('reviewFirstName').textContent = firstName;
    document.getElementById('reviewMiddleName').textContent = middleName;
    document.getElementById('reviewAddress').textContent = address;
    document.getElementById('reviewBirthdate').textContent = birthdate;
    document.getElementById('reviewAge').textContent = age;
    document.getElementById('reviewJobType').textContent = jobType;
    document.getElementById('reviewEmail').textContent = email;
    document.getElementById('reviewContact').textContent = contact;

    // Display education entries in review
    const reviewEducationContainer = document.getElementById('reviewEducationContainer');
    reviewEducationContainer.innerHTML = "";

    educationEntries.forEach((ed, idx) => {
        reviewEducationContainer.innerHTML += `
            <div class="card mb-3">
                <div class="card-header bg-success text-white">
                    School ${idx + 1}
                </div>
                <div class="card-body">
                    <div class="row mb-2">
                        <div class="col-md-6"><strong>School:</strong> ${ed.school}</div>
                        <div class="col-md-6"><strong>Degree:</strong> ${ed.degree}</div>
                    </div>
                    <div class="row mb-2">
                        <div class="col-md-6"><strong>From:</strong> ${ed.from || '-'}</div>
                        <div class="col-md-6"><strong>To:</strong> ${ed.to || '-'}</div>
                    </div>
                    <div><strong>Graduated:</strong> ${ed.graduated}</div>
                </div>
            </div>
        `;
    });

    // Display experience entries in review
    const reviewExperienceContainer = document.getElementById('reviewExperienceContainer');
    reviewExperienceContainer.innerHTML = "";

    if (experienceEntries.length === 0) {
        reviewExperienceContainer.innerHTML = `<p class="text-muted">No work experience provided.</p>`;
    } else {
        experienceEntries.forEach((exp, idx) => {
            reviewExperienceContainer.innerHTML += `
                <div class="card mb-3">
                    <div class="card-header bg-success text-white">
                        Company ${idx + 1}
                    </div>
                    <div class="card-body">
                        <div class="row mb-2">
                            <div class="col-md-6"><strong>Company:</strong> ${exp.company}</div>
                            <div class="col-md-6"><strong>Position:</strong> ${exp.position}</div>
                        </div>
                        <div class="row mb-2">
                            <div class="col-md-6"><strong>From:</strong> ${exp.from || '-'}</div>
                            <div class="col-md-6"><strong>To:</strong> ${exp.to || '-'}</div>
                        </div>
                        <div><strong>Reason for Leaving:</strong> ${exp.reason || '-'}</div>
                    </div>
                </div>
            `;
        });
    }

    document.getElementById('reviewResume').textContent = resume;
    document.getElementById('reviewCoverLetter').textContent = coverLetter;
    document.getElementById('reviewEndorsementLetter').textContent = endorsementLetter;

    // Hide application form and show review form
    document.getElementById('applicationForm').classList.add('d-none');
    document.getElementById('review').classList.remove('d-none');

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function backApplication() {
    document.getElementById('review').classList.add('d-none');
    document.getElementById('applicationForm').classList.remove('d-none');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function submitApplication() {
    const submitBtn = document.querySelector('#review .btn-primary');
    const originalText = submitBtn ? submitBtn.innerHTML : '';

    try {
        // ── Get applicant ID from localStorage (set during login) ─────────────
        const applicantId = localStorage.getItem('userId');
        const vacancyData = JSON.parse(localStorage.getItem('selectedVacancy') || '{}');
        const vacancyId   = vacancyData?._id || vacancyData?.id || null;

        if (!applicantId) {
            showToast('Session expired. Please log in again.', 'error');
            setTimeout(() => { window.location.href = 'applicant-login.html'; }, 2000);
            return;
        }

        // ── Show loading state on submit button ───────────────────────────────
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Submitting...`;
        }

        // ── Build FormData — text fields ──────────────────────────────────────
        const formData = new FormData();

        formData.append('applicant', applicantId);
        if (vacancyId) formData.append('vacancy', vacancyId);

        formData.append('lastName',   document.getElementById('reviewLastName').textContent.trim());
        formData.append('firstName',  document.getElementById('reviewFirstName').textContent.trim());
        formData.append('middleName', document.getElementById('reviewMiddleName').textContent.trim());
        formData.append('address',    document.getElementById('reviewAddress').textContent.trim());
        formData.append('birthdate',  document.getElementById('reviewBirthdate').textContent.trim());
        formData.append('age',        document.getElementById('reviewAge').textContent.trim());
        formData.append('jobType',    document.getElementById('reviewJobType').textContent.trim());
        formData.append('email',      document.getElementById('reviewEmail').textContent.trim());
        formData.append('contact',    document.getElementById('reviewContact').textContent.trim());

        // ── Collect education & experience from review cards ──────────────────
        const educationEntries = [];
        document.querySelectorAll('#reviewEducationContainer .card').forEach(card => {
            const rows = card.querySelectorAll('.card-body .row, .card-body div');
            const getText = (label) => {
                for (const el of card.querySelectorAll('strong')) {
                    if (el.textContent.includes(label)) {
                        return el.parentElement.textContent.replace(el.textContent, '').trim();
                    }
                }
                return '';
            };
            educationEntries.push({
                school:    getText('School:'),
                degree:    getText('Degree:'),
                from:      getText('From:'),
                to:        getText('To:'),
                graduated: getText('Graduated:')
            });
        });

        const experienceEntries = [];
        document.querySelectorAll('#reviewExperienceContainer .card').forEach(card => {
            const getText = (label) => {
                for (const el of card.querySelectorAll('strong')) {
                    if (el.textContent.includes(label)) {
                        return el.parentElement.textContent.replace(el.textContent, '').trim();
                    }
                }
                return '';
            };
            experienceEntries.push({
                company:  getText('Company:'),
                position: getText('Position:'),
                from:     getText('From:'),
                to:       getText('To:'),
                reason:   getText('Reason for Leaving:')
            });
        });

        formData.append('education',  JSON.stringify(educationEntries));
        formData.append('experience', JSON.stringify(experienceEntries));

        // ── Attach actual file objects from the file inputs ───────────────────
        const resumeFile            = document.getElementById('resume').files[0];
        const coverLetterFile       = document.getElementById('coverLetter').files[0];
        const endorsementLetterFile = document.getElementById('endorsementLetter').files[0];

        if (resumeFile)            formData.append('resume',            resumeFile);
        if (coverLetterFile)       formData.append('coverLetter',       coverLetterFile);
        if (endorsementLetterFile) formData.append('endorsementLetter', endorsementLetterFile);

        // ── Send to backend ───────────────────────────────────────────────────
        const response = await fetch('http://localhost:5000/api/applications/apply', {
            method: 'POST',
            body:   formData
            // NOTE: Do NOT set Content-Type header — browser sets it automatically
            //       with the correct multipart boundary for FormData
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(result.message || 'Submission failed. Please try again.');
        }

        // ── Success — show confirmation screen ────────────────────────────────
        showToast('Application submitted successfully!', 'success');

        document.getElementById('review').classList.add('d-none');
        document.getElementById('introContent').classList.add('d-none');
        document.getElementById('confirmation').classList.remove('d-none');
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
        console.error('submitApplication error:', err);
        showToast(err.message || 'Something went wrong. Please try again.', 'error');

        // Restore submit button
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalText;
        }
    }
}

function returnHome() {
    // Redirect to My Applications page after submission
    window.location.href = 'applicant-myapplication.html';
}

// ==============================
// DROP ZONE SETUP
// ==============================
function setupDropZones() {
    document.querySelectorAll(".drop-zone").forEach(zone => {
        const input = zone.querySelector("input[type='file']");
        const type = zone.dataset.type;

        // Click anywhere on the zone triggers the file picker
        // Using mousedown to avoid conflict with input's own click
        zone.addEventListener("click", function (e) {
            // Prevent triggering twice if the click came from the input itself
            if (e.target === input) return;
            input.click();
        });

        // When user picks a file via the dialog
        input.addEventListener("change", function () {
            if (this.files.length > 0) {
                validateFile(this.files[0], type, this, zone);
            }
        });

        // Drag over — highlight zone
        zone.addEventListener("dragover", function (e) {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.add("dragover");
        });

        // Drag leave — remove highlight
        zone.addEventListener("dragleave", function (e) {
            e.stopPropagation();
            zone.classList.remove("dragover");
        });

        // Drop — assign files to the input and validate
        zone.addEventListener("drop", function (e) {
            e.preventDefault();
            e.stopPropagation();
            zone.classList.remove("dragover");

            const files = e.dataTransfer.files;
            if (!files || files.length === 0) return;

            // Assign the dropped file to the hidden input via DataTransfer
            try {
                const dt = new DataTransfer();
                dt.items.add(files[0]);
                input.files = dt.files;
            } catch (err) {
                // Fallback for older browsers
                console.warn("DataTransfer assignment not supported:", err);
            }

            validateFile(files[0], type, input, zone);
        });
    });
}

// ==============================
// DOM READY
// ==============================
document.addEventListener('DOMContentLoaded', function () {

    // Load selected vacancy from localStorage
    const vacancy = JSON.parse(localStorage.getItem("selectedVacancy"));
    if (vacancy) {
        const jobTitle = document.getElementById("jobTitle");
        const jobDesc = document.getElementById("jobDesc");
        if (jobTitle) jobTitle.innerText = vacancy.positionTitle;
        if (jobDesc) jobDesc.innerText = vacancy.description;
    }

    // Real-time validation: remove error on input for simple fields
    const simpleFields = ['lastName', 'firstName', 'address'];
    simpleFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function () {
                if (this.value.trim() !== '') this.classList.remove('error');
            });
        }
    });

    // Real-time email validation
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.addEventListener('input', function () {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (this.value.trim() === '' || emailRegex.test(this.value.trim())) {
                this.classList.remove('error');
            } else {
                this.classList.add('error');
            }
        });
    }

    // Real-time contact validation — show/hide error as user types
    const contactField = document.getElementById('contact');
    if (contactField) {
        // Set placeholder
        contactField.setAttribute('placeholder', '+63 912 345 6789 or 09123456789');
        contactField.setAttribute('type', 'text');
        contactField.addEventListener('input', function () {
            const raw = this.value.trim().replace(/[\s\-]/g, '');
            const ok  = /^(\+639\d{9}|09\d{9})$/.test(raw);
            if (this.value.trim() === '' || ok) {
                this.classList.remove('error');
            } else {
                this.classList.add('error');
            }
        });
    }

    // Real-time birthdate & age cross-validation
    function validateBirthdateAge() {
        const birthdateField = document.getElementById('birthdate');
        const ageField       = document.getElementById('age');
        if (!birthdateField || !birthdateField.value) return;

        const today     = new Date();
        const birthDate = new Date(birthdateField.value);

        let actualAge = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            actualAge--;
        }

        // Under 18 check
        if (actualAge < 18) {
            birthdateField.classList.add('error');
            if (ageField) ageField.classList.add('error');
            return;
        } else {
            birthdateField.classList.remove('error');
        }

        // Age mismatch check
        if (ageField && ageField.value.trim() !== '') {
            const enteredAge = parseInt(ageField.value.trim(), 10);
            if (Math.abs(enteredAge - actualAge) > 1) {
                birthdateField.classList.add('error');
                ageField.classList.add('error');
            } else {
                birthdateField.classList.remove('error');
                ageField.classList.remove('error');
            }
        }
    }

    const birthdateField = document.getElementById('birthdate');
    const ageField       = document.getElementById('age');
    if (birthdateField) birthdateField.addEventListener('change', validateBirthdateAge);
    if (ageField)       ageField.addEventListener('input',  validateBirthdateAge);

    // Real-time validation for job type radio buttons
    const jobTypeRadios = document.querySelectorAll('input[name="jobType"]');
    jobTypeRadios.forEach(radio => {
        radio.addEventListener('change', function () {
            const jobTypeGroup = document.getElementById('jobTypeGroup');
            const jobTypeError = document.getElementById('jobTypeError');
            jobTypeGroup.classList.remove('error');
            jobTypeError.classList.add('d-none');
        });
    });

    // Radio pill visual state sync (moved from inline script)
    document.addEventListener('change', function (e) {
        if (e.target.type === 'radio') {
            const group = e.target.closest('.radio-group');
            if (group) {
                group.querySelectorAll('.radio-pill').forEach(p => p.classList.remove('checked'));
                e.target.closest('.radio-pill')?.classList.add('checked');
            }
        }
    });

    // Initialize Bootstrap popovers
    const popoverTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="popover"]')
    );
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Initialize drop zones
    setupDropZones();
});

// ==============================
// EDUCATION ENTRIES
// ==============================
function addEducationEntry() {
    const container = document.getElementById('educationContainer');
    const entries = container.querySelectorAll('.entry-item');
    const newIndex = entries.length + 1;

    const newEntry = document.createElement('div');
    newEntry.className = 'card entry-item mb-3';
    newEntry.setAttribute('data-entry', 'education');
    newEntry.setAttribute('data-index', newIndex);
    newEntry.innerHTML = `
        <div class="card-header entry-header-custom text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0 entry-number">School ${newIndex}</h5>
            <button type="button" class="btn btn-sm btn-danger delete-btn" onclick="deleteEntry(this, 'education')" title="Delete this entry">
                <i class="bi bi-trash3"></i> Delete
            </button>
        </div>
        <div class="card-body">
            <div class="mb-3">
                <label for="school_${newIndex}" class="field-label form-label"><span class="text-danger">*</span> School</label>
                <input type="text" id="school_${newIndex}" name="school" class="form-control school-input" required>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="schoolFrom_${newIndex}" class="field-label form-label">From</label>
                    <input type="date" id="schoolFrom_${newIndex}" name="schoolFrom" class="form-control schoolFrom-input">
                </div>
                <div class="col-md-6">
                    <label for="schoolTo_${newIndex}" class="field-label form-label">To</label>
                    <input type="date" id="schoolTo_${newIndex}" name="schoolTo" class="form-control schoolTo-input">
                </div>
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="field-label form-label"><span class="text-danger">*</span> Graduated?</label>
                    <div class="radio-group mt-1">
                        <label class="radio-pill">
                            <input type="radio" name="graduated_${newIndex}" value="Yes" class="graduated-input" id="graduated_${newIndex}_yes">
                            <span class="pill-dot"></span> Yes
                        </label>
                        <label class="radio-pill">
                            <input type="radio" name="graduated_${newIndex}" value="No" class="graduated-input" id="graduated_${newIndex}_no">
                            <span class="pill-dot"></span> No
                        </label>
                    </div>
                </div>
                <div class="col-md-6">
                    <label for="degree_${newIndex}" class="field-label form-label"><span class="text-danger">*</span> Degree Program</label>
                    <select name="degree" id="degree_${newIndex}" class="form-select degree-input" required>
                        <option value="">-- Select Degree --</option>
                        <optgroup label="Certificate Programs">
                            <option value="Certificate in Computer Technology">Certificate in Computer Technology</option>
                            <option value="Certificate in Office Administration">Certificate in Office Administration</option>
                            <option value="Certificate in Hospitality Services">Certificate in Hospitality Services</option>
                            <option value="TESDA NC II">TESDA National Certificate (NC II)</option>
                        </optgroup>
                        <optgroup label="Associate Degrees">
                            <option value="Associate in Computer Technology">Associate in Computer Technology</option>
                            <option value="Associate in Hotel and Restaurant Management">Associate in Hotel and Restaurant Management</option>
                            <option value="Associate in Business Administration">Associate in Business Administration</option>
                        </optgroup>
                        <optgroup label="Bachelor's Degrees - Arts &amp; Humanities">
                            <option value="BA Communication">Bachelor of Arts in Communication</option>
                            <option value="BA Political Science">Bachelor of Arts in Political Science</option>
                            <option value="BA Psychology">Bachelor of Arts in Psychology</option>
                            <option value="BA English Language Studies">Bachelor of Arts in English Language Studies</option>
                            <option value="BA Sociology">Bachelor of Arts in Sociology</option>
                            <option value="BA Public Administration">Bachelor of Arts in Public Administration</option>
                        </optgroup>
                        <optgroup label="Bachelor's Degrees - Business &amp; Management">
                            <option value="BS Business Administration">Bachelor of Science in Business Administration</option>
                            <option value="BS Accountancy">Bachelor of Science in Accountancy</option>
                            <option value="BS Accounting Information System">Bachelor of Science in Accounting Information System</option>
                            <option value="BS Entrepreneurship">Bachelor of Science in Entrepreneurship</option>
                            <option value="BS Management Accounting">Bachelor of Science in Management Accounting</option>
                            <option value="BS Hospitality Management">Bachelor of Science in Hospitality Management</option>
                            <option value="BS Tourism Management">Bachelor of Science in Tourism Management</option>
                        </optgroup>
                        <optgroup label="Bachelor's Degrees - Information Technology">
                            <option value="BS Information Technology">Bachelor of Science in Information Technology</option>
                            <option value="BS Computer Science">Bachelor of Science in Computer Science</option>
                            <option value="BS Information Systems">Bachelor of Science in Information Systems</option>
                            <option value="BS Computer Engineering">Bachelor of Science in Computer Engineering</option>
                        </optgroup>
                        <optgroup label="Bachelor's Degrees - Engineering">
                            <option value="BS Civil Engineering">Bachelor of Science in Civil Engineering</option>
                            <option value="BS Mechanical Engineering">Bachelor of Science in Mechanical Engineering</option>
                            <option value="BS Electrical Engineering">Bachelor of Science in Electrical Engineering</option>
                            <option value="BS Electronics Engineering">Bachelor of Science in Electronics Engineering</option>
                            <option value="BS Industrial Engineering">Bachelor of Science in Industrial Engineering</option>
                            <option value="BS Environmental Engineering">Bachelor of Science in Environmental Engineering</option>
                        </optgroup>
                        <optgroup label="Bachelor's Degrees - Education">
                            <option value="BEEd">Bachelor of Elementary Education</option>
                            <option value="BSEd English">Bachelor of Secondary Education - English</option>
                            <option value="BSEd Mathematics">Bachelor of Secondary Education - Mathematics</option>
                            <option value="BSEd Science">Bachelor of Secondary Education - Science</option>
                            <option value="BSEd Social Studies">Bachelor of Secondary Education - Social Studies</option>
                            <option value="BTLEd">Bachelor of Technology and Livelihood Education</option>
                        </optgroup>
                        <optgroup label="Bachelor's Degrees - Health Sciences">
                            <option value="BS Nursing">Bachelor of Science in Nursing</option>
                            <option value="BS Medical Technology">Bachelor of Science in Medical Technology</option>
                            <option value="BS Pharmacy">Bachelor of Science in Pharmacy</option>
                            <option value="BS Physical Therapy">Bachelor of Science in Physical Therapy</option>
                            <option value="BS Radiologic Technology">Bachelor of Science in Radiologic Technology</option>
                            <option value="BS Public Health">Bachelor of Science in Public Health</option>
                        </optgroup>
                        <optgroup label="Bachelor's Degrees - Agriculture &amp; Environment">
                            <option value="BS Agriculture">Bachelor of Science in Agriculture</option>
                            <option value="BS Forestry">Bachelor of Science in Forestry</option>
                            <option value="BS Environmental Science">Bachelor of Science in Environmental Science</option>
                            <option value="BS Fisheries">Bachelor of Science in Fisheries</option>
                        </optgroup>
                        <optgroup label="Bachelor's Degrees - Criminology &amp; Public Safety">
                            <option value="BS Criminology">Bachelor of Science in Criminology</option>
                            <option value="BS Public Safety">Bachelor of Science in Public Safety</option>
                        </optgroup>
                        <optgroup label="Bachelor's Degrees - Maritime">
                            <option value="BS Marine Engineering">Bachelor of Science in Marine Engineering</option>
                            <option value="BS Marine Transportation">Bachelor of Science in Marine Transportation</option>
                        </optgroup>
                        <optgroup label="Bachelor's Degrees - Architecture &amp; Design">
                            <option value="BS Architecture">Bachelor of Science in Architecture</option>
                            <option value="BS Interior Design">Bachelor of Science in Interior Design</option>
                            <option value="BS Fine Arts">Bachelor of Science in Fine Arts</option>
                        </optgroup>
                        <optgroup label="Master's Degrees">
                            <option value="MBA">Master in Business Administration</option>
                            <option value="MPA">Master in Public Administration</option>
                            <option value="MA Education">Master of Arts in Education</option>
                            <option value="MS Environmental Science">Master of Science in Environmental Science</option>
                        </optgroup>
                        <optgroup label="Doctorate Degrees">
                            <option value="PhD">Doctor of Philosophy (PhD)</option>
                            <option value="EdD">Doctor of Education (EdD)</option>
                            <option value="DBA">Doctor in Business Administration (DBA)</option>
                        </optgroup>
                        <optgroup label="Other">
                            <option value="Others">Others (Please Specify)</option>
                        </optgroup>
                    </select>
                </div>
            </div>
        </div>
    `;

    container.appendChild(newEntry);
    updateDeleteButtons('education');
}

// ==============================
// EXPERIENCE ENTRIES
// ==============================
function addExperienceEntry() {
    const container = document.getElementById('experienceContainer');
    const entries = container.querySelectorAll('.entry-item');
    const newIndex = entries.length + 1;

    const newEntry = document.createElement('div');
    newEntry.className = 'card entry-item mb-3';
    newEntry.setAttribute('data-entry', 'experience');
    newEntry.setAttribute('data-index', newIndex);
    newEntry.innerHTML = `
        <div class="card-header entry-header-custom text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0 entry-number">Company ${newIndex}</h5>
            <button type="button" class="btn btn-sm btn-danger delete-btn" onclick="deleteEntry(this, 'experience')" title="Delete this entry">
                <i class="bi bi-trash3"></i> Delete
            </button>
        </div>
        <div class="card-body">
            <div class="mb-3">
                <label for="company_${newIndex}" class="field-label form-label">Previous Company</label>
                <input type="text" id="company_${newIndex}" name="company" class="form-control company-input">
            </div>
            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="companyFrom_${newIndex}" class="field-label form-label">From</label>
                    <input type="date" id="companyFrom_${newIndex}" name="companyFrom" class="form-control companyFrom-input">
                </div>
                <div class="col-md-6">
                    <label for="companyTo_${newIndex}" class="field-label form-label">To</label>
                    <input type="date" id="companyTo_${newIndex}" name="companyTo" class="form-control companyTo-input">
                </div>
            </div>
            <div class="mb-3">
                <label for="position_${newIndex}" class="field-label form-label">Position</label>
                <input type="text" id="position_${newIndex}" name="position" class="form-control position-input">
            </div>
            <div class="mb-3">
                <label for="reason_${newIndex}" class="field-label form-label">Reason for Leaving</label>
                <input type="text" id="reason_${newIndex}" name="reason" class="form-control reason-input">
            </div>
        </div>
    `;

    container.appendChild(newEntry);
    updateDeleteButtons('experience');
}

function deleteEntry(button, entryType) {
    const entry = button.closest('.entry-item');
    entry.remove();

    if (entryType === 'education') {
        updateEducationNumbers();
        updateDeleteButtons('education');
    } else if (entryType === 'experience') {
        updateExperienceNumbers();
        updateDeleteButtons('experience');
    }
}

function updateEducationNumbers() {
    const container = document.getElementById('educationContainer');
    const entries = container.querySelectorAll('.entry-item');
    entries.forEach((entry, index) => {
        const number = index + 1;
        entry.setAttribute('data-index', number);
        entry.querySelector('.entry-number').textContent = `School ${number}`;

        entry.querySelector('.school-input').id = `school_${number}`;
        entry.querySelector('.schoolFrom-input').id = `schoolFrom_${number}`;
        entry.querySelector('.schoolTo-input').id = `schoolTo_${number}`;
        entry.querySelector('.degree-input').id = `degree_${number}`;

        entry.querySelector('label[for^="school_"]').setAttribute('for', `school_${number}`);
        entry.querySelector('label[for^="schoolFrom_"]').setAttribute('for', `schoolFrom_${number}`);
        entry.querySelector('label[for^="schoolTo_"]').setAttribute('for', `schoolTo_${number}`);
        entry.querySelector('label[for^="degree_"]').setAttribute('for', `degree_${number}`);

        const graduatedRadios = entry.querySelectorAll(`input[type="radio"][name^="graduated_"]`);
        graduatedRadios.forEach(radio => {
            radio.setAttribute('name', `graduated_${number}`);
        });
    });
}

function updateExperienceNumbers() {
    const container = document.getElementById('experienceContainer');
    const entries = container.querySelectorAll('.entry-item');
    entries.forEach((entry, index) => {
        const number = index + 1;
        entry.setAttribute('data-index', number);
        entry.querySelector('.entry-number').textContent = `Company ${number}`;

        entry.querySelector('.company-input').id = `company_${number}`;
        entry.querySelector('.companyFrom-input').id = `companyFrom_${number}`;
        entry.querySelector('.companyTo-input').id = `companyTo_${number}`;
        entry.querySelector('.position-input').id = `position_${number}`;
        entry.querySelector('.reason-input').id = `reason_${number}`;

        entry.querySelector('label[for^="company_"]').setAttribute('for', `company_${number}`);
        entry.querySelector('label[for^="companyFrom_"]').setAttribute('for', `companyFrom_${number}`);
        entry.querySelector('label[for^="companyTo_"]').setAttribute('for', `companyTo_${number}`);
        entry.querySelector('label[for^="position_"]').setAttribute('for', `position_${number}`);
        entry.querySelector('label[for^="reason_"]').setAttribute('for', `reason_${number}`);
    });
}

function updateDeleteButtons(entryType) {
    const containerId = entryType === 'education' ? 'educationContainer' : 'experienceContainer';
    const container = document.getElementById(containerId);
    const entries = container.querySelectorAll('.entry-item');

    entries.forEach(entry => {
        const deleteBtn = entry.querySelector('.delete-btn');
        if (deleteBtn) deleteBtn.style.display = 'block';
    });
}

// ==============================
// NAVIGATION
// ==============================

/**
 * Called by the navbar/back button to go to the applicant dashboard.
 * Update the href below if your path differs (e.g. '../pages/applicant-dashboard.html').
 */
function goToDashboard() {
    window.location.href = 'applicant-dashboard.html';
}