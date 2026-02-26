import React from 'react';
import DegreeOptions from './DegreeOptions';

function ApplicationForm({
  formData,
  errors,
  onFormChange,
  onEducationChange,
  onExperienceChange,
  onAddEducationEntry,
  onAddExperienceEntry,
  onDeleteEducationEntry,
  onDeleteExperienceEntry,
  onProceed
}) {
  return (
    <div className="app-form">
      <h1>Online Applicant Registration</h1>

      <p className="intro-text">
        By proceeding with this online application, you certify that all information you provide to the 
        <strong> Department of Environment and Natural Resources (DENR) </strong> 
        is true, accurate, and complete to the best of your knowledge. 
        Submission of false or incomplete information may result in disqualification.

        <br /><br />
        You agree to upload only authentic documents for verification. 
        You also consent to the collection and processing of your personal data 
        in accordance with the Data Privacy Act of 2012.

        <br /><br />
        By clicking <strong>PROCEED</strong>, you confirm that you have read and agreed to these terms.
      </p>

      <hr />

      <form onSubmit={onProceed}>
        {/* SECTION 1: PERSONAL INFORMATION */}
        <h3>Section 1: Personal Information</h3>

        <div className="form-group-3">
          <div>
            <label htmlFor="lastName" className="required">Last Name</label>
            <input
              type="text"
              id="lastName"
              value={formData.lastName}
              onChange={(e) => onFormChange('lastName', e.target.value)}
              className={errors.lastName ? 'error' : ''}
            />
            {errors.lastName && <div className="form-error">{errors.lastName}</div>}
          </div>
          <div>
            <label htmlFor="firstName" className="required">First Name</label>
            <input
              type="text"
              id="firstName"
              value={formData.firstName}
              onChange={(e) => onFormChange('firstName', e.target.value)}
              className={errors.firstName ? 'error' : ''}
            />
            {errors.firstName && <div className="form-error">{errors.firstName}</div>}
          </div>
          <div>
            <label htmlFor="middleName">Middle Name</label>
            <input
              type="text"
              id="middleName"
              value={formData.middleName}
              onChange={(e) => onFormChange('middleName', e.target.value)}
            />
          </div>
        </div>

        <label htmlFor="address" className="required">Address</label>
        <input
          type="text"
          id="address"
          value={formData.address}
          onChange={(e) => onFormChange('address', e.target.value)}
          className={errors.address ? 'error' : ''}
        />
        {errors.address && <div className="form-error">{errors.address}</div>}

        <br />

        <div className="form-group-2">
          <div>
            <label htmlFor="birthdate" className="required">Birthdate</label>
            <input
              type="date"
              id="birthdate"
              value={formData.birthdate}
              onChange={(e) => onFormChange('birthdate', e.target.value)}
              className={errors.birthdate ? 'error' : ''}
            />
            {errors.birthdate && <div className="form-error">{errors.birthdate}</div>}
          </div>
          <div>
            <label htmlFor="age" className="required">Age</label>
            <input
              type="number"
              id="age"
              value={formData.age}
              onChange={(e) => onFormChange('age', e.target.value)}
              min="18"
              className={errors.age ? 'error' : ''}
            />
            {errors.age && <div className="form-error">{errors.age}</div>}
          </div>
        </div>

        <br />

        <label className="required">Job Type</label>
        {errors.jobType && <div className="form-error">{errors.jobType}</div>}
        <div className={`radio-group ${errors.jobType ? 'error' : ''}`}>
          <label>
            <input
              type="radio"
              name="jobType"
              value="Full-Time"
              checked={formData.jobType === 'Full-Time'}
              onChange={(e) => onFormChange('jobType', e.target.value)}
            />
            Full-Time
          </label>
          <label>
            <input
              type="radio"
              name="jobType"
              value="Part-Time"
              checked={formData.jobType === 'Part-Time'}
              onChange={(e) => onFormChange('jobType', e.target.value)}
            />
            Part-Time
          </label>
          <label>
            <input
              type="radio"
              name="jobType"
              value="Trainee"
              checked={formData.jobType === 'Trainee'}
              onChange={(e) => onFormChange('jobType', e.target.value)}
            />
            Trainee
          </label>
        </div>

        <br />

        <div className="form-group-2">
          <div>
            <label htmlFor="email" className="required">Email Address</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => onFormChange('email', e.target.value)}
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>
          <div>
            <label htmlFor="contact" className="required">Contact Number</label>
            <input
              type="tel"
              id="contact"
              value={formData.contact}
              onChange={(e) => onFormChange('contact', e.target.value)}
              className={errors.contact ? 'error' : ''}
            />
            {errors.contact && <div className="form-error">{errors.contact}</div>}
          </div>
        </div>

        <hr />

        {/* SECTION 2: EDUCATION */}
        <h3>Section 2: Education</h3>

        {errors.education && <div className="education-error">{errors.education}</div>}

        <div id="educationContainer">
          {formData.educationEntries.map((entry, index) => (
            <div key={index} className={`entry-item ${errors.education ? 'error' : ''}`}>
              <div className="entry-header">
                <h4 className="entry-number">School {index + 1}</h4>
                {formData.educationEntries.length > 0 && (
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => onDeleteEducationEntry(index)}
                    title="Delete this entry"
                  >
                    <span>✕</span>
                  </button>
                )}
              </div>

              <label htmlFor={`school_${index}`} className="required">School</label>
              <input
                type="text"
                id={`school_${index}`}
                name="school"
                className="school-input"
                value={entry.school}
                onChange={(e) => onEducationChange(index, 'school', e.target.value)}
              />

              <br />

              <div className="form-group-2">
                <div>
                  <label htmlFor={`schoolFrom_${index}`}>From</label>
                  <input
                    type="date"
                    id={`schoolFrom_${index}`}
                    name="schoolFrom"
                    className="schoolFrom-input"
                    value={entry.from}
                    onChange={(e) => onEducationChange(index, 'from', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`schoolTo_${index}`}>To</label>
                  <input
                    type="date"
                    id={`schoolTo_${index}`}
                    name="schoolTo"
                    className="schoolTo-input"
                    value={entry.to}
                    onChange={(e) => onEducationChange(index, 'to', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group-2">
                <div>
                  <label className="required">Graduated?</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        name={`graduated_${index}`}
                        value="Yes"
                        className="graduated-input"
                        checked={entry.graduated === 'Yes'}
                        onChange={(e) => onEducationChange(index, 'graduated', e.target.value)}
                      />
                      Yes
                    </label>
                    <label>
                      <input
                        type="radio"
                        name={`graduated_${index}`}
                        value="No"
                        className="graduated-input"
                        checked={entry.graduated === 'No'}
                        onChange={(e) => onEducationChange(index, 'graduated', e.target.value)}
                      />
                      No
                    </label>
                  </div>
                </div>
                <div>
                  <label htmlFor={`degree_${index}`} className="required">Degree Program</label>
                  <select
                    id={`degree_${index}`}
                    name="degree"
                    className="degree-input"
                    value={entry.degree}
                    onChange={(e) => onEducationChange(index, 'degree', e.target.value)}
                  >
                    <DegreeOptions />
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <button type="button" className="add-more-btn" onClick={onAddEducationEntry}>
          + Add More Education
        </button>

        <hr />

        {/* SECTION 3: WORK EXPERIENCE */}
        <h3>Section 3: Work Experience</h3>

        <div id="experienceContainer">
          {formData.experienceEntries.map((entry, index) => (
            <div key={index} className="entry-item">
              <div className="entry-header">
                <h4 className="entry-number">Company {index + 1}</h4>
                {formData.experienceEntries.length > 0 && (
                  <button
                    type="button"
                    className="delete-btn"
                    onClick={() => onDeleteExperienceEntry(index)}
                    title="Delete this entry"
                  >
                    <span>✕</span>
                  </button>
                )}
              </div>

              <label htmlFor={`company_${index}`}>Previous Company</label>
              <input
                type="text"
                id={`company_${index}`}
                name="company"
                className="company-input"
                value={entry.company}
                onChange={(e) => onExperienceChange(index, 'company', e.target.value)}
              />

              <br />

              <div className="form-group-2">
                <div>
                  <label htmlFor={`companyFrom_${index}`}>From</label>
                  <input
                    type="date"
                    id={`companyFrom_${index}`}
                    name="companyFrom"
                    className="companyFrom-input"
                    value={entry.from}
                    onChange={(e) => onExperienceChange(index, 'from', e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor={`companyTo_${index}`}>To</label>
                  <input
                    type="date"
                    id={`companyTo_${index}`}
                    name="companyTo"
                    className="companyTo-input"
                    value={entry.to}
                    onChange={(e) => onExperienceChange(index, 'to', e.target.value)}
                  />
                </div>
              </div>

              <br />

              <label htmlFor={`position_${index}`}>Position</label>
              <input
                type="text"
                id={`position_${index}`}
                name="position"
                className="position-input"
                value={entry.position}
                onChange={(e) => onExperienceChange(index, 'position', e.target.value)}
              />

              <br />

              <label htmlFor={`reason_${index}`}>Reason for Leaving</label>
              <input
                type="text"
                id={`reason_${index}`}
                name="reason"
                className="reason-input"
                value={entry.reason}
                onChange={(e) => onExperienceChange(index, 'reason', e.target.value)}
              />
            </div>
          ))}
        </div>

        <button type="button" className="add-more-btn" onClick={onAddExperienceEntry}>
          + Add More Experience
        </button>

        <hr />

        {/* SECTION 4: DOCUMENT UPLOAD */}
        <h3>Section 4: Document Upload</h3>

        <label htmlFor="resume" className="required">Resume/CV</label>
        <input
          type="file"
          id="resume"
          name="resume"
          accept=".pdf,.doc,.docx"
          onChange={(e) => onFormChange('resume', e.target.files[0])}
          className={errors.resume ? 'error' : ''}
        />
        {errors.resume && <div className="form-error">{errors.resume}</div>}

        <br /><br />

        <label htmlFor="coverLetter">Cover Letter</label>
        <input
          type="file"
          id="coverLetter"
          name="coverLetter"
          accept=".pdf,.doc,.docx"
          onChange={(e) => onFormChange('coverLetter', e.target.files[0])}
        />

        <br /><br />

        <label htmlFor="endorsementLetter">Endorsement Letter</label>
        <input
          type="file"
          id="endorsementLetter"
          name="endorsementLetter"
          accept=".pdf,.doc,.docx"
          onChange={(e) => onFormChange('endorsementLetter', e.target.files[0])}
        />

        <br /><br />

        <button type="submit">proceed</button>
      </form>
    </div>
  );
}

export default ApplicationForm;
