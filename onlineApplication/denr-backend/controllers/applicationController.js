const Application = require("../models/application")
const cloudinary  = require("../config/cloudinary")

// ==================================
// APPLICATION CONTROLLER
// ==================================

// ── Helper: extract Cloudinary info from uploaded file ────────────────────
// multer-storage-cloudinary attaches .path (the URL) and .filename (public_id)
function getFileData(file) {
    if (!file) return undefined
    return {
        url:       file.path,
        public_id: file.filename
    }
}

// ── POST /api/applications/apply ──────────────────────────────────────────
// Accepts: multipart/form-data with fields matching the application form
exports.applyVacancy = async (req, res) => {
    try {
        const {
            applicant,
            vacancy,
            lastName,
            firstName,
            middleName,
            address,
            birthdate,
            age,
            jobType,
            email,
            contact,
            education,   // sent as JSON string from frontend
            experience   // sent as JSON string from frontend
        } = req.body

        // Parse education and experience arrays (sent as JSON strings)
        let parsedEducation  = []
        let parsedExperience = []

        try {
            if (education)  parsedEducation  = JSON.parse(education)
            if (experience) parsedExperience = JSON.parse(experience)
        } catch (parseErr) {
            return res.status(400).json({ message: "Invalid education or experience data format." })
        }

        // Build the new application document
        const newApplication = new Application({
            applicant,
            vacancy,
            lastName,
            firstName,
            middleName,
            address,
            birthdate,
            age:     parseInt(age, 10),
            jobType,
            email,
            contact,
            education:  parsedEducation,
            experience: parsedExperience,

            // Files — only set if the applicant uploaded them
            // req.files is an object keyed by field name (from upload.fields())
            resume:            getFileData(req.files?.resume?.[0]),
            coverLetter:       getFileData(req.files?.coverLetter?.[0]),
            endorsementLetter: getFileData(req.files?.endorsementLetter?.[0])
        })

        await newApplication.save()

        res.status(201).json({
            success: true,
            message: "Application submitted successfully.",
            data:    newApplication
        })

    } catch (err) {
        console.error("applyVacancy error:", err)
        res.status(500).json({ message: err.message })
    }
}

// ── GET /api/applications/my ───────────────────────────────────────────────
// Returns all applications for the logged-in applicant
exports.getApplicantApplications = async (req, res) => {
    try {
        // req.user._id comes from your auth middleware (JWT)
        const applications = await Application
            .find({ applicant: req.user._id })
            .populate("vacancy", "positionTitle department")
            .sort({ appliedAt: -1 })

        res.json({
            success: true,
            data:    applications
        })

    } catch (err) {
        console.error("getApplicantApplications error:", err)
        res.status(500).json({ message: err.message })
    }
}

// ── PATCH /api/applications/:id/status ────────────────────────────────────
// Admin only: update the status of an application
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body
        const validStatuses = ["pending", "reviewed", "shortlisted", "rejected", "approved"]

        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status value." })
        }

        const application = await Application.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        )

        if (!application) {
            return res.status(404).json({ message: "Application not found." })
        }

        res.json({
            success: true,
            message: "Application status updated.",
            data:    application
        })

    } catch (err) {
        console.error("updateApplicationStatus error:", err)
        res.status(500).json({ message: err.message })
    }
}

// ── DELETE /api/applications/:id ──────────────────────────────────────────
// Deletes application AND removes uploaded files from Cloudinary
exports.deleteApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)

        if (!application) {
            return res.status(404).json({ message: "Application not found." })
        }

        // Delete files from Cloudinary using stored public_ids
        const filesToDelete = [
            application.resume?.public_id,
            application.coverLetter?.public_id,
            application.endorsementLetter?.public_id
        ].filter(Boolean) // remove undefined/null

        for (const public_id of filesToDelete) {
            await cloudinary.uploader.destroy(public_id, { resource_type: "raw" })
        }

        await application.deleteOne()

        res.json({
            success: true,
            message: "Application and associated files deleted."
        })

    } catch (err) {
        console.error("deleteApplication error:", err)
        res.status(500).json({ message: err.message })
    }
}