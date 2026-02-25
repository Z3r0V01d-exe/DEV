📁 ASSETS FOLDER - MEDIA STORAGE

═══════════════════════════════════════════════════════════════════════════════

This folder is designed to store all images and videos you need for developing
your DENR Online Applicant Registration system.

═══════════════════════════════════════════════════════════════════════════════

📂 FOLDER STRUCTURE:

assets/
├── images/           ← Profile photos, logos, icons, screenshots
├── videos/           ← Demo videos, tutorials, sample videos
└── media/            ← Mixed media files, other resources

═══════════════════════════════════════════════════════════════════════════════

📋 GUIDELINES:

images/
  • Use for: Photos, logos, icons, UI mockups, screenshots
  • Format: JPG, PNG, GIF, WebP
  • Naming: descriptive-name.jpg (e.g., profile-template.jpg)
  • Size: 5MB max per image recommended

videos/
  • Use for: Demo videos, tutorials, sample submissions
  • Format: MP4, WebM, MOV
  • Naming: descriptive-name.mp4 (e.g., form-walkthrough.mp4)
  • Size: 50MB max per video recommended

media/
  • Use for: Miscellaneous files, PDFs, combined media
  • Format: Any media format
  • Naming: descriptive-name.pdf or descriptive-name.zip
  • Size: 20MB max per file recommended

═══════════════════════════════════════════════════════════════════════════════

💡 USAGE EXAMPLES:

1. Profile Photos:
   assets/images/
   ├── user-profile-example.jpg
   ├── default-avatar.png
   └── profile-placeholder.jpg

2. Demo Videos:
   assets/videos/
   ├── form-tutorial.mp4
   ├── submission-demo.mp4
   └── interview-walkthrough.webm

3. UI/UX Assets:
   assets/images/
   ├── denr-logo.png
   ├── success-icon.svg
   ├── error-message-example.png
   └── form-screenshot.jpg

4. Mixed Media:
   assets/media/
   ├── sample-application.pdf
   ├── guidelines.pdf
   └── all-samples.zip

═══════════════════════════════════════════════════════════════════════════════

🚀 HOW TO USE IN YOUR PROJECT:

1. Store images/videos in the appropriate folders above

2. Reference them in HTML:
   <img src="../../assets/images/filename.jpg" alt="Description">
   <video src="../../assets/videos/filename.mp4"></video>

3. Or from the static folder:
   <img src="../assets/images/filename.jpg" alt="Description">

═══════════════════════════════════════════════════════════════════════════════

📝 BEST PRACTICES:

✓ Use descriptive filenames
✓ Organize by content type
✓ Keep file sizes optimized
✓ Use consistent file naming (lowercase, hyphens)
✓ Add alt text to images
✓ Test media loading before deployment
✓ Compress images for web (use tools like TinyPNG)
✓ Convert videos to web-friendly formats (MP4)

═══════════════════════════════════════════════════════════════════════════════

🗂️  YOUR CURRENT STRUCTURE:

Subject #2/
├── assets/
│   ├── images/        ← Put your photos & images here
│   ├── videos/        ← Put your video files here
│   └── media/         ← Put mixed media here
│
├── static/
│   ├── index.html
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── script.js
│
├── src/               ← React components
├── public/            ← Public files
└── docs/              ← Documentation

═══════════════════════════════════════════════════════════════════════════════

✨ TIPS:

• Use relative paths from static/index.html:
  ../assets/images/logo.png

• Use relative paths from src/:
  ../../assets/images/logo.png

• For web optimization:
  - Images: JPG (photos), PNG (graphics), WebP (modern)
  - Videos: MP4 (best compatibility), WebM (smaller)
  - Max width for web images: 1920px
  - Compress before adding (imagejpeg.com, handbrake.fr for videos)

═══════════════════════════════════════════════════════════════════════════════

🎯 NEXT STEPS:

1. Start adding your images and videos to the appropriate folders
2. Create organized subfolders if needed:
   assets/images/
   ├── profile-photos/
   ├── icons/
   ├── logos/
   └── mockups/

3. Update the system to reference these media files
4. Test that all paths work correctly

═══════════════════════════════════════════════════════════════════════════════

Ready to add your media files! 🎬📸

