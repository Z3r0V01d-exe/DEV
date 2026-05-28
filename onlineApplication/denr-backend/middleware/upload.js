const multer                = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary            = require("../config/cloudinary")

// ── Cloudinary storage config ──────────────────────────────────────────────
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {

        const applicantId = req.body.applicant || "unknown"

        const folderMap = {
            resume:            `denr-applications/${applicantId}/resumes`,
            coverLetter:       `denr-applications/${applicantId}/cover-letters`,
            endorsementLetter: `denr-applications/${applicantId}/endorsement-letters`
        }

        const folder = folderMap[file.fieldname] || `denr-applications/${applicantId}/others`

        const sanitizedName = file.originalname
            .replace(/\.pdf$/i, "")
            .replace(/[^a-z0-9]/gi, "-")
            .toLowerCase()
            .slice(0, 30)

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
            public_id:       uniqueId,
            resource_type:   "raw",       // ✅ Required for PDFs
            type:            "upload",    // ✅ Public upload (not private)
            allowed_formats: ["pdf"],
            overwrite:       false,
            invalidate:      true,
            tags:            ["denr", "application", file.fieldname]
        }
    }
})

// ── File filter: PDFs only ─────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
        console.log("✅ PDF accepted:", file.originalname)
        cb(null, true)
    } else {
        console.error("❌ Non-PDF rejected:", file.originalname, file.mimetype)
        cb(new Error("Only PDF files are allowed."), false)
    }
}

// ── Multer instance ────────────────────────────────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB
})

module.exports = upload