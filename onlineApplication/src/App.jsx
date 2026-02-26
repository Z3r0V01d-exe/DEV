import React, { useState } from 'react';
import ApplicationForm from './components/ApplicationForm';
import ReviewForm from './components/ReviewForm';
import ConfirmationForm from './components/ConfirmationForm';
import './App.css';

function App() {
  const [currentStep, setCurrentStep] = useState('application'); // 'application', 'review', 'confirmation'
  const [formData, setFormData] = useState({
    // Personal Information
    lastName: '',
    firstName: '',
    middleName: '',
    address: '',
    birthdate: '',
    age: '',
    jobType: '',
    email: '',
    contact: '',
    
    // Education entries
    educationEntries: [
      {
        school: '',
        from: '',
        to: '',
        graduated: '',
        degree: ''
      }
    ],
    
    // Experience entries
    experienceEntries: [
      {
        company: '',
        from: '',
        to: '',
        position: '',
        reason: ''
      }
    ],
    
    // Document uploads
    resume: null,
    coverLetter: null,
    endorsementLetter: null
  });
  
  const [errors, setErrors] = useState({});

  const handleFormChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleEducationChange = (index, field, value) => {
    const newEducationEntries = [...formData.educationEntries];
    newEducationEntries[index][field] = value;
    setFormData(prev => ({
      ...prev,
      educationEntries: newEducationEntries
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    const newExperienceEntries = [...formData.experienceEntries];
    newExperienceEntries[index][field] = value;
    setFormData(prev => ({
      ...prev,
      experienceEntries: newExperienceEntries
    }));
  };

  const addEducationEntry = () => {
    setFormData(prev => ({
      ...prev,
      educationEntries: [
        ...prev.educationEntries,
        {
          school: '',
          from: '',
          to: '',
          graduated: '',
          degree: ''
        }
      ]
    }));
  };

  const addExperienceEntry = () => {
    setFormData(prev => ({
      ...prev,
      experienceEntries: [
        ...prev.experienceEntries,
        {
          company: '',
          from: '',
          to: '',
          position: '',
          reason: ''
        }
      ]
    }));
  };

  const deleteEducationEntry = (index) => {
    setFormData(prev => ({
      ...prev,
      educationEntries: prev.educationEntries.filter((_, i) => i !== index)
    }));
  };

  const deleteExperienceEntry = (index) => {
    setFormData(prev => ({
      ...prev,
      experienceEntries: prev.experienceEntries.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Required personal fields
    if (!formData.lastName.trim()) newErrors.lastName = 'Last Name is required';
    if (!formData.firstName.trim()) newErrors.firstName = 'First Name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.birthdate) newErrors.birthdate = 'Birthdate is required';
    if (!formData.age) newErrors.age = 'Age is required';
    if (!formData.jobType) newErrors.jobType = 'Job Type is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.contact.trim()) newErrors.contact = 'Contact Number is required';
    if (!formData.resume) newErrors.resume = 'Resume/CV is required';
    
    // At least one education entry with school and degree
    const hasValidEducation = formData.educationEntries.some(
      entry => entry.school.trim() && entry.degree
    );
    if (!hasValidEducation) {
      newErrors.education = 'Please add at least one education entry with School and Degree Program';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProceedApplication = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setCurrentStep('review');
    }
  };

  const handleBackApplication = () => {
    setCurrentStep('application');
  };

  const handleSubmitApplication = () => {
    setCurrentStep('confirmation');
  };

  const handleReturnHome = () => {
    setCurrentStep('application');
    setFormData({
      lastName: '',
      firstName: '',
      middleName: '',
      address: '',
      birthdate: '',
      age: '',
      jobType: '',
      email: '',
      contact: '',
      educationEntries: [
        {
          school: '',
          from: '',
          to: '',
          graduated: '',
          degree: ''
        }
      ],
      experienceEntries: [
        {
          company: '',
          from: '',
          to: '',
          position: '',
          reason: ''
        }
      ],
      resume: null,
      coverLetter: null,
      endorsementLetter: null
    });
    setErrors({});
  };

  return (
    <div className="register">
      {currentStep === 'application' && (
        <ApplicationForm
          formData={formData}
          errors={errors}
          onFormChange={handleFormChange}
          onEducationChange={handleEducationChange}
          onExperienceChange={handleExperienceChange}
          onAddEducationEntry={addEducationEntry}
          onAddExperienceEntry={addExperienceEntry}
          onDeleteEducationEntry={deleteEducationEntry}
          onDeleteExperienceEntry={deleteExperienceEntry}
          onProceed={handleProceedApplication}
        />
      )}
      
      {currentStep === 'review' && (
        <ReviewForm
          formData={formData}
          onBack={handleBackApplication}
          onSubmit={handleSubmitApplication}
        />
      )}
      
      {currentStep === 'confirmation' && (
        <ConfirmationForm onReturnHome={handleReturnHome} />
      )}
    </div>
  );
}

export default App;
