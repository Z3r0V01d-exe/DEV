function validateFile(file, type, input, dropZone) {
    const errorContainer = dropZone.parentElement.querySelector('.file-error');
    errorContainer.textContent = "";
    dropZone.classList.remove("error", "success");

    if (!file) return false;

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    const fileName = file.name.trim();
    const lowerFileName = fileName.toLowerCase();
    const expectedType = type.toLowerCase();

    if (!lowerFileName.endsWith(".pdf")) {
        errorContainer.textContent = "Only PDF files are allowed.";
        dropZone.classList.add("error");
        input.value = "";
        return false;
    }

    if (file.size > MAX_SIZE) {
        errorContainer.textContent = "File must not exceed 5MB.";
        dropZone.classList.add("error");
        input.value = "";
        return false;
    }

    const regex = new RegExp(
        `^[a-zA-Z]+_[a-zA-Z]+_${expectedType}\\.pdf$`,
        "i"
    );

    if (!regex.test(fileName)) {
        errorContainer.textContent =
            `Invalid filename format. Required: Surname_FirstName_${type}.pdf`;
        dropZone.classList.add("error");
        input.value = "";
        return false;
    }

    dropZone.classList.add("success");
    dropZone.querySelector(".drop-text").textContent = fileName;

    return true;
}

function proceedApplication(event) {
    event.preventDefault();
    
    let isValid = true;
    
    // Clear previous errors
    document.querySelectorAll('.error, .show').forEach(el => {
        el.classList.remove('error', 'show');
    });
    
    // Validate all required text inputs
    const requiredFields = [
        'lastName',
        'firstName',
        'address',
        'birthdate',
        'age',
        'email',
        'contact',
        'resume'
    ];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && field.value.trim() === '') {
            field.classList.add('error');
            isValid = false;
        }
    });
    
    // Validate first education entry (school and degree are required)
    const firstSchoolField = document.querySelector('.school-input');
    const firstDegreeField = document.querySelector('.degree-input');
    if (firstSchoolField && firstSchoolField.value.trim() === '') {
        firstSchoolField.classList.add('error');
        isValid = false;
    }
    if (firstDegreeField && firstDegreeField.value.trim() === '') {
        firstDegreeField.classList.add('error');
        isValid = false;
    }
    
    // Validate that jobType radio button is selected
    const jobTypeElement = document.querySelector('input[name="jobType"]:checked');
    const jobTypeGroup = document.getElementById('jobTypeGroup');
    const jobTypeError = document.getElementById('jobTypeError');
    
    if (!jobTypeElement) {
        jobTypeGroup.classList.add('error');
        jobTypeError.classList.add('show');
        jobTypeError.textContent = 'Please select a Job Type';
        isValid = false;
    } else {
        jobTypeGroup.classList.remove('error');
        jobTypeError.classList.remove('show');
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
        return;
    } else {
        educationContainer.style.borderLeft = '4px solid #005F02';
    }
    
    // Collect all experience entries
    const experienceEntries = [];
    const experienceContainer = document.getElementById('experienceContainer');
    experienceContainer.querySelectorAll('.entry-item').forEach((entry, index) => {
        const entryNum = index + 1;
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
    
    const resume = document.getElementById('resume').files[0]?.name || 'No file';
    const coverLetter = document.getElementById('coverLetter').files[0]?.name || 'No file';
    const endorsementLetter = document.getElementById('endorsementLetter').files[0]?.name || 'No file';

    // Validate resume before proceeding
    const resumeInput = document.getElementById('resume');
    const resumeZone = resumeInput.closest('.drop-zone');
    const resumeFile = resumeInput.files[0];

    if (!resumeFile || !validateFile(resumeFile, "Resume", resumeInput, resumeZone)) {
        alert("Resume is required and must follow the correct format.");
        return;
    }

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
    
    document.getElementById('reviewResume').textContent = resume;
    document.getElementById('reviewCoverLetter').textContent = coverLetter;
    document.getElementById('reviewEndorsementLetter').textContent = endorsementLetter;

    // Hide application form and show review form
    document.getElementById('applicationForm').classList.add('d-none');
    document.getElementById('review').classList.remove('d-none');
}

function backApplication() {
    // Hide review form and show application form
    document.getElementById('review').classList.add('d-none');
    document.getElementById('applicationForm').classList.remove('d-none');
}

function submitApplication() {
    // Hide review form and show confirmation form
    document.getElementById('review').classList.add('d-none');
    document.getElementById('introContent').classList.add('d-none');   
    document.getElementById('confirmation').classList.remove('d-none');
}

function returnHome() {
    // Reset form and hide confirmation, show application form
    document.getElementById('confirmation').classList.add('d-none');
    document.getElementById('IntroContent').classList.remove('d-none');
    document.getElementById('applicationForm').reset();
    
    // Reset the application form
    document.getElementById('applicationForm').reset();
    
    // Clear all error states
    document.querySelectorAll('.error').forEach(el => {
        el.classList.remove('error');
    });
    document.querySelectorAll('.error-message').forEach(el => {
        el.classList.remove('show');
    });
}

// Add real-time validation to remove error state when user types
document.addEventListener('DOMContentLoaded', function() {
    const requiredFields = [
        'lastName',
        'firstName',
        'address',
        'birthdate',
        'age',
        'email',
        'contact',
        'school',
        'degree',
        'resume'
    ];
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                if (this.value.trim() !== '') {
                    this.classList.remove('error');
                }
            });
            field.addEventListener('change', function() {
                if (this.value.trim() !== '') {
                    this.classList.remove('error');
                }
            });
        }
    });
    
    // Add real-time validation for radio buttons
    const jobTypeRadios = document.querySelectorAll('input[name="jobType"]');
    jobTypeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const jobTypeGroup = document.getElementById('jobTypeGroup');
            const jobTypeError = document.getElementById('jobTypeError');
            jobTypeGroup.classList.remove('error');
            jobTypeError.classList.remove('show');
        });
    });

    const popoverTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="popover"]')
    );

    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB

    document.querySelectorAll(".drop-zone").forEach(zone => {
        const input = zone.querySelector("input");
        const type = zone.dataset.type;

        zone.addEventListener("click", () => input.click());

        input.addEventListener("change", () => {
            if (input.files.length > 0) {
                validateFile(input.files[0], type, input, zone);
            }
        });

        zone.addEventListener("dragover", e => {
            e.preventDefault();
            zone.classList.add("dragover");
        });

        zone.addEventListener("dragleave", () => {
            zone.classList.remove("dragover");
        });

        zone.addEventListener("drop", e => {
            e.preventDefault();
            zone.classList.remove("dragover");

            const file = e.dataTransfer.files[0];
            input.files = e.dataTransfer.files;

            validateFile(file, type, input, zone);
        });
    });
});

// Function to add a new education entry
function addEducationEntry() {
    const container = document.getElementById('educationContainer');
    const entries = container.querySelectorAll('.entry-item');
    const newIndex = entries.length + 1;
    
    // Create new entry HTML with Bootstrap classes
    const newEntry = document.createElement('div');
    newEntry.className = 'card entry-item mb-3';
    newEntry.setAttribute('data-entry', 'education');
    newEntry.setAttribute('data-index', newIndex);
    newEntry.innerHTML = `
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0 entry-number">School ${newIndex}</h5>
            <button type="button" class="btn btn-sm btn-danger delete-btn" onclick="deleteEntry(this, 'education')" title="Delete this entry">
                <span>✕ Delete</span>
            </button>
        </div>
        <div class="card-body">
            <div class="mb-3">
                <label for="school_${newIndex}" class="form-label"><span class="text-danger">*</span> School</label>
                <input type="text" id="school_${newIndex}" name="school" class="form-control school-input" required>
            </div>

            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="schoolFrom_${newIndex}" class="form-label">From</label>
                    <input type="date" id="schoolFrom_${newIndex}" name="schoolFrom" class="form-control schoolFrom-input">
                </div>
                <div class="col-md-6">
                    <label for="schoolTo_${newIndex}" class="form-label">To</label>
                    <input type="date" id="schoolTo_${newIndex}" name="schoolTo" class="form-control schoolTo-input">
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-md-6">
                    <label class="form-label"><span class="text-danger">*</span> Graduated?</label>
                    <div class="form-check">
                        <input type="radio" name="graduated_${newIndex}" value="Yes" class="form-check-input graduated-input" id="graduated_${newIndex}_yes">
                        <label class="form-check-label" for="graduated_${newIndex}_yes">Yes</label>
                    </div>
                    <div class="form-check">
                        <input type="radio" name="graduated_${newIndex}" value="No" class="form-check-input graduated-input" id="graduated_${newIndex}_no">
                        <label class="form-check-label" for="graduated_${newIndex}_no">No</label>
                    </div>
                </div>
                <div class="col-md-6">
                    <label for="degree_${newIndex}" class="form-label"><span class="text-danger">*</span> Degree Program</label>
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
    `;
    
    container.appendChild(newEntry);
    updateDeleteButtons('education');
}

// Function to add a new experience entry
function addExperienceEntry() {
    const container = document.getElementById('experienceContainer');
    const entries = container.querySelectorAll('.entry-item');
    const newIndex = entries.length + 1;
    
    const newEntry = document.createElement('div');
    newEntry.className = 'card entry-item mb-3';
    newEntry.setAttribute('data-entry', 'experience');
    newEntry.setAttribute('data-index', newIndex);
    newEntry.innerHTML = `
        <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
            <h5 class="mb-0 entry-number">Company ${newIndex}</h5>
            <button type="button" class="btn btn-sm btn-danger delete-btn" onclick="deleteEntry(this, 'experience')" title="Delete this entry">
                <span>✕ Delete</span>
            </button>
        </div>
        <div class="card-body">
            <div class="mb-3">
                <label for="company_${newIndex}" class="form-label">Previous Company</label>
                <input type="text" id="company_${newIndex}" name="company" class="form-control company-input">
            </div>

            <div class="row mb-3">
                <div class="col-md-6">
                    <label for="companyFrom_${newIndex}" class="form-label">From</label>
                    <input type="date" id="companyFrom_${newIndex}" name="companyFrom" class="form-control companyFrom-input">
                </div>
                <div class="col-md-6">
                    <label for="companyTo_${newIndex}" class="form-label">To</label>
                    <input type="date" id="companyTo_${newIndex}" name="companyTo" class="form-control companyTo-input">
                </div>
            </div>

            <div class="mb-3">
                <label for="position_${newIndex}" class="form-label">Position</label>
                <input type="text" id="position_${newIndex}" name="position" class="form-control position-input">
            </div>

            <div class="mb-3">
                <label for="reason_${newIndex}" class="form-label">Reason for Leaving</label>
                <input type="text" id="reason_${newIndex}" name="reason" class="form-control reason-input">
            </div>
        </div>
    `;
    
    container.appendChild(newEntry);
    updateDeleteButtons('experience');
}

// Function to delete an entry
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

// Function to update education entry numbers
function updateEducationNumbers() {
    const container = document.getElementById('educationContainer');
    const entries = container.querySelectorAll('.entry-item');
    entries.forEach((entry, index) => {
        const number = index + 1;
        entry.setAttribute('data-index', number);
        entry.querySelector('.entry-number').textContent = `School ${number}`;
        
        // Update all IDs and names in this entry
        entry.querySelector('.school-input').id = `school_${number}`;
        entry.querySelector('.schoolFrom-input').id = `schoolFrom_${number}`;
        entry.querySelector('.schoolTo-input').id = `schoolTo_${number}`;
        entry.querySelector('.degree-input').id = `degree_${number}`;
        
        // Update labels
        entry.querySelector('label[for^="school_"]').setAttribute('for', `school_${number}`);
        entry.querySelector('label[for^="schoolFrom_"]').setAttribute('for', `schoolFrom_${number}`);
        entry.querySelector('label[for^="schoolTo_"]').setAttribute('for', `schoolTo_${number}`);
        entry.querySelector('label[for^="degree_"]').setAttribute('for', `degree_${number}`);
        
        // Update radio button names
        const graduatedRadios = entry.querySelectorAll(`input[type="radio"][name^="graduated_"]`);
        graduatedRadios.forEach(radio => {
            radio.setAttribute('name', `graduated_${number}`);
        });
    });
}

// Function to update experience entry numbers
function updateExperienceNumbers() {
    const container = document.getElementById('experienceContainer');
    const entries = container.querySelectorAll('.entry-item');
    entries.forEach((entry, index) => {
        const number = index + 1;
        entry.setAttribute('data-index', number);
        entry.querySelector('.entry-number').textContent = `Company ${number}`;
        
        // Update all IDs
        entry.querySelector('.company-input').id = `company_${number}`;
        entry.querySelector('.companyFrom-input').id = `companyFrom_${number}`;
        entry.querySelector('.companyTo-input').id = `companyTo_${number}`;
        entry.querySelector('.position-input').id = `position_${number}`;
        entry.querySelector('.reason-input').id = `reason_${number}`;
        
        // Update labels
        entry.querySelector('label[for^="company_"]').setAttribute('for', `company_${number}`);
        entry.querySelector('label[for^="companyFrom_"]').setAttribute('for', `companyFrom_${number}`);
        entry.querySelector('label[for^="companyTo_"]').setAttribute('for', `companyTo_${number}`);
        entry.querySelector('label[for^="position_"]').setAttribute('for', `position_${number}`);
        entry.querySelector('label[for^="reason_"]').setAttribute('for', `reason_${number}`);
    });
}

// Function to update delete button visibility
function updateDeleteButtons(entryType) {
    const containerId = entryType === 'education' ? 'educationContainer' : 'experienceContainer';
    const container = document.getElementById(containerId);
    const entries = container.querySelectorAll('.entry-item');
    
    entries.forEach(entry => {
        const deleteBtn = entry.querySelector('.delete-btn');
        // Always show delete button
        deleteBtn.style.display = 'block';
    });
}

window.addEventListener("scroll", function () {
    const navbar = document.getElementById("mainNavbar");

    if (window.scrollY > 20) {
        navbar.classList.add("scrolled");
    } else {
        navbar.classList.remove("scrolled");
    }
});

function renderNavbar() {
    const menu = document.getElementById("userMenu");
    const user = localStorage.getItem("userRole");

    if (!user) {
        menu.innerHTML = `
            <li><a class="dropdown-item" href="#" onclick="login('applicant')">Login as Applicant</a></li>
            <li><a class="dropdown-item" href="#" onclick="login('admin')">Login as Admin</a></li>
        `;
    } 
    else if (user === "applicant") {
        menu.innerHTML = `
            <li><a class="dropdown-item" href="#">My Application</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" onclick="logout()">Logout</a></li>
        `;
    } 
    else if (user === "admin") {
        menu.innerHTML = `
            <li><a class="dropdown-item" href="#">Admin Dashboard</a></li>
            <li><a class="dropdown-item" href="#">Manage Applications</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="#" onclick="logout()">Logout</a></li>
        `;
    }
}

function login(role) {
    localStorage.setItem("userRole", role);
    renderNavbar();
}

function logout() {
    localStorage.removeItem("userRole");
    renderNavbar();
}

document.addEventListener("DOMContentLoaded", renderNavbar);