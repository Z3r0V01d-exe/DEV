# React.js Conversion - QUICKSTART GUIDE

## ✅ Conversion Complete!

Your DENR Online Applicant Registration Form has been successfully converted to React.js with Vite!

## 📁 What Was Created

```
src/
├── App.jsx                      - Main component (state management)
├── App.css                      - Component styles
├── main.jsx                     - React entry point
├── index.css                    - Global styles (from original)
└── components/
    ├── ApplicationForm.jsx      - Main form (Section 1-4)
    ├── ReviewForm.jsx           - Review step
    ├── ConfirmationForm.jsx     - Final confirmation
    └── DegreeOptions.jsx        - All degree options

package.json                     - Dependencies & scripts
vite.config.js                  - Vite configuration
public/index.html               - HTML template
```

## 🚀 Quick Start (3 Steps)

### Step 1: Open Terminal
In VS Code terminal, navigate to this folder:
```bash
cd "c:\Users\ADMIN\Desktop\OJT\DEV\Subject #2"
```

### Step 2: Start Development Server
```bash
npm run dev
```

### Step 3: Open in Browser
Click the link shown in terminal, usually: `http://localhost:3000`

## 🎯 Key Features

✅ **Same Functionality** - All original features work exactly the same
✅ **Multi-entry Support** - Add/delete education and experience entries
✅ **Form Validation** - Real-time error checking and requirements
✅ **Same Design** - Preserved all original CSS and styling
✅ **State Management** - React hooks handle all form data
✅ **Three-Step Flow** - Application → Review → Confirmation

## 📝 What Changed From Original

| Aspect | Original | React Version |
|--------|----------|---------------|
| Framework | Vanilla HTML/CSS/JS | React 18 + Vite |
| State Management | DOM queries | React hooks (useState) |
| Styling | CSS files | Preserved CSS + modules |
| File Structure | Single folder | Organized components |
| Build Tool | None | Vite (fast build) |
| Development | Live reload refresh | Fast refresh (HMR) |

## 🔧 Build for Production

When ready to deploy:
```bash
npm run build
```

This creates an optimized `dist/` folder with your app.

## 📝 Original Files

Your original vanilla JS files are still in the folder:
- `index.html` (original)
- `script.js` (original)
- `style.css` (original)

These are preserved in case you need to reference them.

## 🎓 React Component Structure

```
App (Main State Management)
├── ApplicationForm
│   ├── Form Inputs
│   ├── Education Entries
│   ├── Experience Entries
│   └── File Upload
├── ReviewForm
│   └── Data Display
└── ConfirmationForm
    └── Success Message
```

All state flows from App → Components via props
All updates flow back via callback functions

## 🛠️ Common Commands

```bash
# Start development
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Install new packages (if needed)
npm install <package-name>
```

## 📋 Form Sections

1. **Personal Information** - Name, address, birthdate, job type, email, contact
2. **Education** - School, dates, graduation status, degree (multi-entry with add/delete)
3. **Work Experience** - Company, dates, position, reason (multi-entry with add/delete)
4. **Document Upload** - Resume, cover letter, endorsement letter

## ✨ Validation

- ⚠️ Red asterisk (*) shows required fields
- 🔴 Red border appears on incomplete fields
- ✅ Errors clear automatically as user corrects input
- 📚 At least 1 education entry required
- 📄 Resume upload is mandatory

## 💡 Tips

1. **Live Reload**: Vite will auto-update when you save files
2. **Error Messages**: Check terminal and browser console for helpful errors
3. **State**: Form data is preserved during navigation between steps
4. **Validation**: Happens automatically on "PROCEED" button
5. **Files**: File inputs are stored in component state (ready for backend)

## 🚨 Troubleshooting

### Port 3000 is already in use
```bash
# Change port in vite.config.js or use:
npm run dev -- --port 3001
```

### npm install fails
```bash
# Clear cache and retry
npm cache clean --force
npm install
```

### Module not found errors
```bash
# Reinstall dependencies
rm -r node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. ✅ Run `npm run dev` to see the form in action
2. Test all features (add entries, delete entries, fill form, validate)
3. When satisfied, run `npm run build` for production
4. Deploy the `dist/` folder to your server

## 🎉 You're Ready!

Your React.js form is ready to use. Start with:
```bash
npm run dev
```

Enjoy your new React application! 🚀
