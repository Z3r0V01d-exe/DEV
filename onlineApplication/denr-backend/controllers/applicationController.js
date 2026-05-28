const Application = require("../models/application")
const cloudinary  = require("../config/cloudinary")

// ── Build correct public URL for a Cloudinary raw PDF ─────────────────────
//
// Cloudinary raw resources MUST have .pdf appended to the URL.
// Without it, the browser gets no file extension hint and treats it as
// "cloudinary-file" (unknown type), causing both the blank iframe and
// the broken download filename you see in the browser.
//
// Correct format:
//   https://res.cloudinary.com/{cloud_name}/raw/upload/{public_id}.pdf
//
// The .pdf suffix tells Cloudinary to serve the file with:
//   Content-Type: application/pdf
//   Content-Disposition: inline; filename="yourfile.pdf"
// Both of which are required for iframe rendering AND clean downloads.

function buildCloudinaryUrl(publicId) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME

    if (!cloudName) {
        console.error("❌ CLOUDINARY_CLOUD_NAME not set in .env")
        return null
    }

    // ✅ Append .pdf — this is the critical fix
    // Cloudinary uses the extension to determine Content-Type for raw files
    const url = `https://res.cloudinary.com/${cloudName}/raw/upload/${publicId}.pdf`

    console.log("🔗 Built Cloudinary URL:", url)
    return url
}

function getFileData(file) {
    if (!file) return undefined

    console.log("📁 Processing uploaded file:", {
        fieldname:    file.fieldname,
        filename:     file.filename,  // public_id with folder path
        originalname: file.originalname,
        mimetype:     file.mimetype
    })

    const publicId = file.filename
    const url      = buildCloudinaryUrl(publicId)

    if (!url) {
        console.error("❌ Failed to build URL for:", publicId)
        return undefined
    }

    console.log("✅ File data prepared:", { publicId, url })

    return { url, public_id: publicId }
}

// ── POST /api/applications/apply ──────────────────────────────────────────
exports.applyVacancy = async (req, res) => {
    try {
        const {
            applicant, vacancy,
            positionTitle, department, office,
            lastName, firstName, middleName,
            address, birthdate, age, jobType, email, contact,
            education, experience
        } = req.body

        console.log("📋 Apply request received:", {
            applicant,
            vacancy,
            filesReceived: {
                resume:            !!req.files?.resume,
                coverLetter:       !!req.files?.coverLetter,
                endorsementLetter: !!req.files?.endorsementLetter
            }
        })

        let parsedEducation  = []
        let parsedExperience = []

        try {
            if (education)  parsedEducation  = JSON.parse(education)
            if (experience) parsedExperience = JSON.parse(experience)
        } catch {
            return res.status(400).json({ message: "Invalid education or experience data format." })
        }

        // Duplicate check
        if (applicant && vacancy) {
            const existing = await Application.findOne({ applicant, vacancy })
            if (existing) {
                console.warn("⚠️ Duplicate application:", { applicant, vacancy })
                return res.status(409).json({
                    success: false,
                    message: "You already applied for this position."
                })
            }
        }

        const resumeData      = getFileData(req.files?.resume?.[0])
        const coverLetterData = getFileData(req.files?.coverLetter?.[0])
        const endorsementData = getFileData(req.files?.endorsementLetter?.[0])

        console.log("📂 Final file URLs:", {
            resume:      resumeData?.url      || "✗ none",
            coverLetter: coverLetterData?.url || "✗ none",
            endorsement: endorsementData?.url || "✗ none"
        })

        const newApplication = new Application({
            applicant,
            vacancy: vacancy || null,
            vacancySnapshot: { positionTitle, department, office },
            lastName, firstName, middleName,
            address, birthdate,
            age:        parseInt(age, 10),
            jobType, email, contact,
            education:  parsedEducation,
            experience: parsedExperience,
            resume:            resumeData,
            coverLetter:       coverLetterData,
            endorsementLetter: endorsementData
        })

        const savedApp = await newApplication.save()
        console.log("✅ Application saved:", savedApp._id)

        res.status(201).json({
            success: true,
            message: "Application submitted successfully.",
            data:    savedApp
        })

    } catch (err) {
        console.error("❌ applyVacancy error:", err.message, err.stack)
        res.status(500).json({ message: err.message })
    }
}

// ── GET /api/applications/my?applicantId=<userId> ─────────────────────────
exports.getApplicantApplications = async (req, res) => {
    try {
        const applicantId = req.query.applicantId

        if (!applicantId) {
            return res.status(400).json({ success: false, message: "applicantId is required." })
        }

        const applications = await Application
            .find({ applicant: applicantId })
            .populate("vacancy", "positionTitle department office")
            .sort({ appliedAt: -1 })

        const transformedApps = applications.map(app => {
            const appObj = app.toObject()

            // If vacancy was deleted, fall back to snapshot
            if (!appObj.vacancy && appObj.vacancySnapshot) {
                appObj.vacancy = {
                    _id:           null,
                    positionTitle: appObj.vacancySnapshot.positionTitle,
                    department:    appObj.vacancySnapshot.department,
                    office:        appObj.vacancySnapshot.office,
                    isDeleted:     true
                }
            }

            // ✅ Fix any existing stored URLs that are missing .pdf extension
            // This handles applications saved before this fix was applied
            const fixUrl = (fileObj) => {
                if (!fileObj?.url) return fileObj
                if (!fileObj.url.endsWith(".pdf")) {
                    return { ...fileObj, url: fileObj.url + ".pdf" }
                }
                return fileObj
            }

            appObj.resume            = fixUrl(appObj.resume)
            appObj.coverLetter       = fixUrl(appObj.coverLetter)
            appObj.endorsementLetter = fixUrl(appObj.endorsementLetter)

            return appObj
        })

        console.log("📋 Applications retrieved:", transformedApps.map(app => ({
            id:           app._id,
            position:     app.vacancy?.positionTitle || "Unknown",
            resumeUrl:    app.resume?.url || "✗ none"
        })))

        res.json({ success: true, data: transformedApps })

    } catch (err) {
        console.error("❌ getApplicantApplications error:", err)
        res.status(500).json({ message: err.message })
    }
}

// ── PATCH /api/applications/:id/status ────────────────────────────────────
exports.updateApplicationStatus = async (req, res) => {
    try {
        const { status }    = req.body
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

        res.json({ success: true, message: "Application status updated.", data: application })

    } catch (err) {
        console.error("updateApplicationStatus error:", err)
        res.status(500).json({ message: err.message })
    }
}

// ── DELETE /api/applications/:id ──────────────────────────────────────────
exports.deleteApplication = async (req, res) => {
    try {
        const application = await Application.findById(req.params.id)

        if (!application) {
            return res.status(404).json({ message: "Application not found." })
        }

        const filesToDelete = [
            application.resume?.public_id,
            application.coverLetter?.public_id,
            application.endorsementLetter?.public_id
        ].filter(Boolean)

        for (const public_id of filesToDelete) {
            try {
                await cloudinary.uploader.destroy(public_id, { resource_type: "raw" })
                console.log("🗑️ Deleted from Cloudinary:", public_id)
            } catch (e) {
                console.warn("⚠️ Could not delete:", public_id, e.message)
            }
        }

        await application.deleteOne()

        res.json({ success: true, message: "Application and files deleted." })

    } catch (err) {
        console.error("deleteApplication error:", err)
        res.status(500).json({ message: err.message })
    }
}

// ── GET /api/applications/all ──────────────────────────────────────────────
exports.getAllApplications = async (req, res) => {
    try {
        const applications = await Application
            .find()
            .populate("vacancy", "positionTitle department office")
            .populate("applicant", "firstName lastName email")
            .sort({ appliedAt: -1 })

        const fixUrl = (fileObj) => {
            if (!fileObj?.url) return fileObj
            if (!fileObj.url.endsWith(".pdf")) {
                return { ...fileObj, url: fileObj.url + ".pdf" }
            }
            return fileObj
        }

        const transformed = applications.map(app => {
            const obj = app.toObject()

            if (!obj.vacancy && obj.vacancySnapshot) {
                obj.vacancy = {
                    _id:           null,
                    positionTitle: obj.vacancySnapshot.positionTitle,
                    department:    obj.vacancySnapshot.department,
                    office:        obj.vacancySnapshot.office,
                    isDeleted:     true
                }
            }

            obj.resume            = fixUrl(obj.resume)
            obj.coverLetter       = fixUrl(obj.coverLetter)
            obj.endorsementLetter = fixUrl(obj.endorsementLetter)

            return obj
        })

        res.json({ success: true, data: transformed })

    } catch (err) {
        console.error("❌ getAllApplications error:", err)
        res.status(500).json({ message: err.message })
    }
}