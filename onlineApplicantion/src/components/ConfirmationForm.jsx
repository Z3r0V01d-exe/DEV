import React from 'react';

function ConfirmationForm({ onReturnHome }) {
  return (
    <div id="confirmation">
      <h2>Application Successfully Submitted</h2>
      <p>
        Thank you for submitting your application to the 
        <strong> Department of Environment and Natural Resources (DENR)</strong>. 
        Your application has been received and is now under initial review by our recruitment team.
      </p>
      <p>
        Please allow <strong>7–14 working days</strong> for the evaluation process. 
        During this period, our Human Resource Management Section will carefully assess 
        your qualifications, submitted documents, and eligibility requirements.
      </p>
      <p>
        Kindly stay tuned to your registered email address for further updates. 
        You will be formally notified via email whether you are:
      </p>
      <ul>
        <li>✔ Shortlisted for interview</li>
        <li>✔ For further assessment</li>
        <li>✔ Approved for the next stage</li>
        <li>✖ Not selected for the position</li>
      </ul>
      <p>
        If shortlisted, additional instructions regarding interview schedules, 
        examination details, or required documents will be sent to you.
      </p>
      <p>
        Rest assured that all personal information and uploaded documents 
        will be handled with strict confidentiality in accordance with the 
        <strong> Data Privacy Act of 2012</strong> and applicable government regulations.
      </p>
      <p>
        We appreciate your interest in serving the public and contributing to 
        environmental protection and sustainable development.
      </p>
      <button type="button" onClick={onReturnHome}>Return Home</button>
    </div>
  );
}

export default ConfirmationForm;
