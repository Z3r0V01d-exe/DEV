import React from 'react';

function ReviewForm({ formData, onBack, onSubmit }) {
  return (
    <div id="review">
      <h2>Review Your Information</h2>
      
      <h3>Section 1: Personal Information</h3>
      <p><strong>Last Name:</strong> <span>{formData.lastName}</span></p>
      <p><strong>First Name:</strong> <span>{formData.firstName}</span></p>
      <p><strong>Middle Name:</strong> <span>{formData.middleName || 'N/A'}</span></p>
      <p><strong>Address:</strong> <span>{formData.address}</span></p>
      <p><strong>Birthdate:</strong> <span>{formData.birthdate}</span></p>
      <p><strong>Age:</strong> <span>{formData.age}</span></p>
      <p><strong>Job Type:</strong> <span>{formData.jobType}</span></p>
      <p><strong>Email:</strong> <span>{formData.email}</span></p>
      <p><strong>Contact:</strong> <span>{formData.contact}</span></p>

      <h3>Section 2: Education</h3>
      {formData.educationEntries.length > 0 ? (
        formData.educationEntries.map((entry, index) => (
          <div key={index}>
            <p>
              <strong>School {index + 1}:</strong>
              <span>
                {entry.school} 
                {entry.from && entry.to && ` (${entry.from} to ${entry.to})`}
                {entry.graduated && `, Graduated: ${entry.graduated}`}
                {entry.degree && `, Degree: ${entry.degree}`}
              </span>
            </p>
          </div>
        ))
      ) : (
        <p><strong>Education:</strong> <span>No education entered</span></p>
      )}

      <h3>Section 3: Work Experience</h3>
      {formData.experienceEntries.some(entry => entry.company || entry.position) ? (
        formData.experienceEntries.map((entry, index) => (
          entry.company || entry.position ? (
            <div key={index}>
              <p>
                <strong>Company {index + 1}:</strong>
                <span>
                  {entry.company || 'N/A'}
                  {entry.from && entry.to && ` (${entry.from} to ${entry.to})`}
                  {entry.position && `, Position: ${entry.position}`}
                  {entry.reason && `, Reason: ${entry.reason}`}
                </span>
              </p>
            </div>
          ) : null
        ))
      ) : (
        <p><strong>Experience:</strong> <span>No experience entered</span></p>
      )}

      <h3>Section 4: Document Upload</h3>
      <p><strong>Resume/CV:</strong> <span>{formData.resume ? formData.resume.name : 'No file'}</span></p>
      <p><strong>Cover Letter:</strong> <span>{formData.coverLetter ? formData.coverLetter.name : 'No file'}</span></p>
      <p><strong>Endorsement Letter:</strong> <span>{formData.endorsementLetter ? formData.endorsementLetter.name : 'No file'}</span></p>

      <div className="button-container">
        <button type="button" onClick={onBack}>Back</button>
        <button type="button" onClick={onSubmit}>Submit</button>
      </div>
    </div>
  );
}

export default ReviewForm;
