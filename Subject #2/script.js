function proceedApplication(event) {
    event.preventDefault();
    
    // Validate that jobType is selected
    const jobTypeElement = document.querySelector('input[name="jobType"]:checked');
    if (!jobTypeElement) {
        alert('Please select a Job Type');
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
    const school = document.getElementById('school').value;
    const schoolFrom = document.getElementById('schoolFrom').value;
    const schoolTo = document.getElementById('schoolTo').value;
    const graduated = document.querySelector('input[name="graduated"]:checked')?.value || 'Not specified';
    const degree = document.getElementById('degree').value;
    const company = document.getElementById('company').value;
    const companyFrom = document.getElementById('companyFrom').value;
    const companyTo = document.getElementById('companyTo').value;
    const position = document.getElementById('position').value;
    const reason = document.getElementById('reason').value;
    const resume = document.getElementById('resume').files[0]?.name || 'No file';
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
    document.getElementById('reviewSchool').textContent = school;
    document.getElementById('reviewSchoolFrom').textContent = schoolFrom;
    document.getElementById('reviewSchoolTo').textContent = schoolTo;
    document.getElementById('reviewGraduated').textContent = graduated;
    document.getElementById('reviewDegree').textContent = degree;
    document.getElementById('reviewCompany').textContent = company;
    document.getElementById('reviewCompanyFrom').textContent = companyFrom;
    document.getElementById('reviewCompanyTo').textContent = companyTo;
    document.getElementById('reviewPosition').textContent = position;
    document.getElementById('reviewReason').textContent = reason;
    document.getElementById('reviewResume').textContent = resume;
    document.getElementById('reviewCoverLetter').textContent = coverLetter;
    document.getElementById('reviewEndorsementLetter').textContent = endorsementLetter;

    // Hide application form and show review form
    document.getElementById('applicationForm').style.display = 'none';
    document.getElementById('review').style.display = 'block';
}

function backApplication() {
    // Hide review form and show application form
    document.getElementById('review').style.display = 'none';
    document.getElementById('applicationForm').style.display = 'block';
}

function submitApplication() {
    // Hide review form and show confirmation form
    document.getElementById('review').style.display = 'none';
    document.getElementById('confirmation').style.display = 'block';
}

function returnHome() {
    // Reset form and hide confirmation, show application form
    document.getElementById('confirmation').style.display = 'none';
    document.getElementById('review').style.display = 'none';
    document.getElementById('applicationForm').style.display = 'block';
    
    // Reset the application form
    document.getElementById('applicationForm').reset();
}