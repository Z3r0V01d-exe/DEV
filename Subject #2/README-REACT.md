# DENR Online Applicant Registration Form - React.js Version

This is a React.js conversion of the DENR Online Applicant Registration Form, built with Vite for fast development and production builds.

## Project Structure

```
src/
├── main.jsx                      # React entry point
├── App.jsx                       # Main app component managing all state
├── App.css                       # App-specific styles
├── index.css                     # Global styles
└── components/
    ├── ApplicationForm.jsx       # Main application form component
    ├── ReviewForm.jsx           # Review form component
    ├── ConfirmationForm.jsx     # Confirmation form component
    └── DegreeOptions.jsx        # Degree select options component

public/
└── index.html                    # HTML template

vite.config.js                    # Vite configuration
package.json                      # Project dependencies
```

## Features

✅ **Multi-step Form Flow**: Application → Review → Confirmation
✅ **Dynamic Multi-Entry Support**: Add/delete multiple education and work experience entries
✅ **Client-side Validation**: Real-time error checking and display
✅ **Responsive Design**: Mobile-friendly flexbox layouts
✅ **State Management**: React hooks (useState) for form state
✅ **File Upload Support**: Resume, cover letter, and endorsement letter uploads
✅ **Preserved Styling**: All original CSS styling maintained

## Installation

1. Install Node.js and npm (if not already installed)

2. Navigate to the project directory:
```bash
cd "c:\Users\ADMIN\Desktop\OJT\DEV\Subject #2"
```

3. Install dependencies:
```bash
npm install
```

## Running the Project

### Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Components Overview

### App.jsx
- Main component that manages all form state
- Handles transitions between application, review, and confirmation screens
- Contains validation logic
- Manages education and experience entries

### ApplicationForm.jsx
- Renders the main application form with 4 sections:
  1. Personal Information
  2. Education (multi-entry)
  3. Work Experience (multi-entry)
  4. Document Upload
- Handles form input changes and displays validation errors

### ReviewForm.jsx
- Displays all entered information for review
- Allows user to go back to the application form or submit

### ConfirmationForm.jsx
- Shows success message after submission
- Provides option to return home and start a new application

### DegreeOptions.jsx
- Contains all degree program options
- Used in the ApplicationForm's degree select element

## Form Sections

### Section 1: Personal Information
- Last Name, First Name, Middle Name
- Address
- Birthdate and Age
- Job Type (Full-Time, Part-Time, Trainee)
- Email and Contact Number

### Section 2: Education (Multi-entry)
- School Name
- From/To dates
- Graduated status
- Degree Program (extensive dropdown list)
- Add/Delete education entries

### Section 3: Work Experience (Multi-entry)
- Company Name
- From/To dates
- Position
- Reason for Leaving
- Add/Delete experience entries

### Section 4: Document Upload
- Resume/CV (required)
- Cover Letter (optional)
- Endorsement Letter (optional)

## Validation Rules

- **Required Fields** (marked with *):
  - All personal information fields
  - At least one education entry with School and Degree Program
  - Resume file upload

- **Optional Fields**:
  - Middle Name
  - Work experience entries
  - Cover Letter and Endorsement Letter

- **Special Validation**:
  - Must select a Job Type
  - Must have at least one education entry
  - Real-time error clearing as user corrects input

## Styling

All styles are maintained from the original CSS:
- Blue primary color: #2c5aa0
- Red error color: #d32f2f
- Green accent color: #4caf50
- Responsive flexbox layouts

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Technology Stack

- **React 18.2**: UI framework
- **Vite 5.0**: Build tool and dev server
- **CSS3**: Styling with flexbox

## Notes

- The React version maintains 100% feature parity with the original vanilla JavaScript version
- All form validation is handled on the client-side
- File uploads are stored in the component state (for production, connect to a backend API)
- The old vanilla JS files (script.js, style.css, index.html) are preserved in the directory

## Future Enhancements

- Backend integration for form submission
- Database storage for applications
- Email notifications
- Application tracking dashboard
- PDF export of applications
- Progress saving/auto-save functionality

## License

This is a government application form for DENR (Department of Environment and Natural Resources) Philippines.

## Support

For issues or questions, please contact the DENR HR Management Section.
