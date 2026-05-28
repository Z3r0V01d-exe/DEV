# File Upload Diagnostics & Testing Guide

## 🔧 What I Fixed

### 1. **Backend Upload Middleware** (`denr-backend/middleware/upload.js`)
- ✅ Improved file naming (sanitized + timestamp)
- ✅ Added tags for better organization in Cloudinary
- ✅ Proper error handling
- ✅ Fixed duplicate exports issue

### 2. **Application Controller** (`denr-backend/controllers/applicationController.js`)
- ✅ Detailed logging for file uploads
- ✅ Better error messages with stack traces
- ✅ Logs file sizes and names
- ✅ Shows exact proxy URLs being generated

### 3. **Application Routes** (`denr-backend/routes/applicationRoutes.js`)
- ✅ Added error handler middleware
- ✅ Catches upload errors before controller

### 4. **Frontend Logging** (`static/js/applicant/applicant-application.js`)
- ✅ Logs file names and sizes before upload
- ✅ Shows upload progress
- ✅ Displays backend response details

---

## 🧪 How to Test File Uploads

### Step 1: Open Browser DevTools
- **Press F12** → Console tab
- Keep it open during the test

### Step 2: Try to Upload a Resume
1. Go to applicant application page
2. Upload a PDF (e.g., your CV)
3. **Watch the console** for these logs:

**Frontend Logs** (in browser console):
```
📁 Files ready for upload: {resume: "yourfile.pdf (0.50MB)", ...}
📤 Submitting application to backend...
📥 Backend response status: 201
✅ Backend response: {success: true, ...}
```

**Backend Logs** (in terminal):
```
📤 Cloudinary upload config: {folder: "denr-applications/...", public_id: "...", ...}
✅ PDF file accepted: yourfile.pdf
📋 Apply request received: {applicant: "...", filesReceived: {resume: true, ...}}
📂 Files object: {keys: ["resume"], resume: "1 file(s)", ...}
✅ File data prepared: {resume: "✓ http://localhost:5000/api/cloudinary-file?publicId=...", ...}
✅ Application saved successfully: ObjectId(...)
```

---

## 🔍 If Upload Still Fails

### Check 1: Are files reaching the backend?
- Look for **📤 Cloudinary upload config** in terminal
- If you don't see it → files not being sent from frontend

### Check 2: Is Cloudinary API working?
- Run this in terminal:
```bash
curl "http://localhost:5000/api/debug/cloudinary-files"
```
- Should return list of uploaded files

### Check 3: Are files in Cloudinary?
- Go to: https://cloudinary.com/console
- Login to your account
- Look in Media Library → Raw files
- Filter by: `denr-applications/`

### Check 4: Check .env file
```bash
cat denr-backend/.env
```
Verify these are set:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

---

## 📊 Debug Endpoints

### List all uploaded files:
```
GET http://localhost:5000/api/debug/cloudinary-files
```

### Fetch a specific file:
```
GET http://localhost:5000/api/cloudinary-file?publicId=denr-applications/...
```

### View application with file URLs:
```
GET http://localhost:5000/api/applications/my?applicantId=<userId>
```

---

## 🚀 Steps to Fix Common Issues

### Issue: "Files not uploading"
1. **Check frontend logs** - Do you see `📁 Files ready for upload`?
2. **Check network tab** (F12 → Network) - Is the request sent to `/api/applications/apply`?
3. **Check response** - What status code? (201 = success, 400 = error, 500 = server error)

### Issue: "Can't see file in Cloudinary"
1. **Check upload logs** - Did backend receive the file?
2. **Check Cloudinary credentials** - Are they correct in `.env`?
3. **Check if file upload actually happened** - Run debug endpoint

### Issue: "File won't display in browser"
1. **Try the debug endpoint** directly: `/api/cloudinary-file?publicId=...`
2. **Check browser console** for CORS errors
3. **Check if URL is accessible** - Can you open it in a new tab?

---

## ✅ Success Indicators

When upload is working correctly, you should see:

**Terminal Output:**
```
📤 Cloudinary upload config: {folder: "denr-applications/...", public_id: "resume-name_1715382...", ...}
✅ PDF file accepted: YourName_CV.pdf
📋 Apply request received: {applicant: "...", filesReceived: {resume: true, coverLetter: false, ...}}
✅ File data prepared: {resume: "✓ http://localhost:5000/api/cloudinary-file?publicId=...", ...}
✅ Application saved successfully: 66a7b8c9d0e1f2g3h4i5j6k7
```

**Browser Console:**
```
📁 Files ready for upload: {resume: "MyCV.pdf (1.25MB)", coverLetter: "none", endorsement: "none"}
📤 Submitting application to backend...
📥 Backend response status: 201
✅ Backend response: {success: true, message: "Application submitted successfully.", ...}
```

**Cloudinary Dashboard:**
- New files appear in "Raw files"
- Folder structure: `denr-applications/{userId}/resumes/`

---

## 📋 Next Steps

1. **Try uploading** a new application with a PDF
2. **Monitor both** browser console and terminal
3. **Share the logs** with exact messages if something fails
4. **Check if files** appear in Cloudinary dashboard

Let me know what logs you see! 🎯
