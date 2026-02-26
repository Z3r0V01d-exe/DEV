import React from 'react';

function DegreeOptions() {
  return (
    <>
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

      <optgroup label="Bachelor's Degrees - Arts & Humanities">
        <option value="BA Communication">Bachelor of Arts in Communication</option>
        <option value="BA Political Science">Bachelor of Arts in Political Science</option>
        <option value="BA Psychology">Bachelor of Arts in Psychology</option>
        <option value="BA English Language Studies">Bachelor of Arts in English Language Studies</option>
        <option value="BA Sociology">Bachelor of Arts in Sociology</option>
        <option value="BA Public Administration">Bachelor of Arts in Public Administration</option>
      </optgroup>

      <optgroup label="Bachelor's Degrees - Business & Management">
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

      <optgroup label="Bachelor's Degrees - Agriculture & Environment">
        <option value="BS Agriculture">Bachelor of Science in Agriculture</option>
        <option value="BS Forestry">Bachelor of Science in Forestry</option>
        <option value="BS Environmental Science">Bachelor of Science in Environmental Science</option>
        <option value="BS Fisheries">Bachelor of Science in Fisheries</option>
      </optgroup>

      <optgroup label="Bachelor's Degrees - Criminology & Public Safety">
        <option value="BS Criminology">Bachelor of Science in Criminology</option>
        <option value="BS Public Safety">Bachelor of Science in Public Safety</option>
      </optgroup>

      <optgroup label="Bachelor's Degrees - Maritime">
        <option value="BS Marine Engineering">Bachelor of Science in Marine Engineering</option>
        <option value="BS Marine Transportation">Bachelor of Science in Marine Transportation</option>
      </optgroup>

      <optgroup label="Bachelor's Degrees - Architecture & Design">
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
    </>
  );
}

export default DegreeOptions;
