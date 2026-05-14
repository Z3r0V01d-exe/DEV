const multer                  = require("multer")
const { CloudinaryStorage }   = require("multer-storage-cloudinary")
const cloudinary              = require("../config/cloudinary")

// ── Cloudinary storage config ──────────────────────────────────────────────
// Files are organized by applicant MongoDB ID:
// denr-applications/{applicantId}/resumes/
// denr-applications/{applicantId}/cover-letters/
// denr-applications/{applicantId}/endorsement-letters/

const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {

        // Get applicant ID from request body (sent in FormData)
        const applicantId = req.body.applicant || "unknown"

        const folderMap = {
            resume:            `denr-applications/${applicantId}/resumes`,
            coverLetter:       `denr-applications/${applicantId}/cover-letters`,
            endorsementLetter: `denr-applications/${applicantId}/endorsement-letters`
        }

        const folder = folderMap[file.fieldname] || `denr-applications/${applicantId}/others`

        // Create a unique but meaningful public_id
        // Format: resumeFileName_timestamp_ext
        const sanitizedName = file.originalname
            .replace(/\.pdf$/i, "")              // Remove .pdf extension
            .replace(/[^a-z0-9]/gi, "-")         // Replace non-alphanumeric with dash
            .toLowerCase()
            .slice(0, 30)                        // Limit length

        const uniqueId = `${sanitizedName}_${Date.now()}`

        console.log("📤 Cloudinary upload config:", {
            folder,
            public_id: uniqueId,
            fieldname: file.fieldname,
            originalname: file.originalname,
            applicantId
        })

        return {
            folder,
            public_id: uniqueId,
            resource_type: "raw",              // ← Store as raw (PDF)
            type: "upload",                    // ← Public resource (not signed)
            allowed_formats: ["pdf"],
            overwrite: false,                  // ← Don't overwrite
            invalidate: true,                  // ← Invalidate CDN cache
            tags: ["denr", "application", file.fieldname]  // ← Add tags for organization
        }
    }
})

// ── File filter: PDFs only ─────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        console.log("✅ PDF file accepted:", file.originalname)
        cb(null, true)
    } else {
        console.error("❌ Non-PDF file rejected:", file.originalname, file.mimetype)
        cb(new Error("Only PDF files are allowed."), false)
    }
}

// ── Size limit: 5MB per file ───────────────────────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
})

// Add error handling wrapper to upload
upload.handleErrors = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        console.error("❌ Multer error:", err.message)
        return res.status(400).json({ error: `Upload error: ${err.message}` })
    } else if (err) {
        console.error("❌ File upload error:", err.message)
        return res.status(400).json({ error: err.message })
    }
    next()
}

module.exports = upload

module.exports = upload