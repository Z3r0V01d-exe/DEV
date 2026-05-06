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

        return {
            folder,
            resource_type: "raw",
            allowed_formats: ["pdf"],
            public_id: `${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`
        }
    }
})

// ── File filter: PDFs only ─────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        cb(null, true)
    } else {
        cb(new Error("Only PDF files are allowed."), false)
    }
}

// ── Size limit: 5MB per file ───────────────────────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
})

module.exports = upload