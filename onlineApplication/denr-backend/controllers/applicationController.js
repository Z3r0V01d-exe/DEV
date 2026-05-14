const Application = require("../models/application")
const cloudinary  = require("../config/cloudinary")

function getFileData(file) {
    if (!file) return undefined
    
    // Cloudinary multer-storage-cloudinary returns these properties:
    // - file.path: HTTP URL (may require auth)
    // - file.filename: public ID (includes folder path)
    // - file.secure_url: HTTPS URL
    
    console.log("📁 File uploaded - Key properties:", {
        filename: file.filename,       // This is the public_id with folder
        path: file.path,
        fieldname: file.fieldname
    })
    
    // The file.filename contains the full public_id including folder (e.g., denr-applications/userId/resumes/filename)
    // We'll use the backend proxy to serve it, which avoids 401 auth issues
    const proxyUrl = `http://localhost:5000/api/cloudinary-file?publicId=${file.filename}`;
    
    console.log("✅ Generated proxy URL:", proxyUrl)
    
    return { url: proxyUrl, public_id: file.filename }
}

// ── POST /api/applications/apply ──────────────────────────────────────────
exports.applyVacancy = async (req, res) => {
    try {
        const {
            applicant, vacancy,
            positionTitle, department, office,  // ← Capture vacancy details from frontend
            lastName, firstName, middleName,
            address, birthdate, age, jobType, email, contact,
            education, experience
        } = req.body

        console.log("📋 Apply request received:", {
            applicant,
            vacancy,
            positionTitle,
            hasResume: !!req.files?.resume?.[0],
            hasCoverLetter: !!req.files?.coverLetter?.[0],
            hasEndorsement: !!req.files?.endorsementLetter?.[0]
        })

        let parsedEducation  = []
        let parsedExperience = []

        try {
            if (education)  parsedEducation  = JSON.parse(education)
            if (experience) parsedExperience = JSON.parse(experience)
        } catch {
            return res.status(400).json({ message: "Invalid education or experience data format." })
        }

        // Check for duplicate: only if both applicant AND vacancy exist
        if (applicant && vacancy) {
            const existing = await Application.findOne({ applicant, vacancy })
            if (existing) {
                console.warn("⚠️ Duplicate application attempt:", { applicant, vacancy })
                return res.status(409).json({
                    success: false,
                    message: "You already applied for this position."
                })
            }
        }

        const resumeData = getFileData(req.files?.resume?.[0])
        const coverLetterData = getFileData(req.files?.coverLetter?.[0])
        const endorsementData = getFileData(req.files?.endorsementLetter?.[0])

        console.log("✅ File data prepared:", {
            resume: resumeData?.url ? "✓" : "✗",
            coverLetter: coverLetterData?.url ? "✓" : "✗",
            endorsement: endorsementData?.url ? "✓" : "✗"
        })

        const newApplication = new Application({
            applicant, 
            vacancy: vacancy || null,  // ← Allow null vacancy
            vacancySnapshot: {         // ← Store vacancy details as backup
                positionTitle,
                department,
                office
            },
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
        console.log("✅ Application saved successfully:", savedApp._id)

        res.status(201).json({
            success: true,
            message: "Application submitted successfully.",
            data:    savedApp
        })

    } catch (err) {
        console.error("❌ applyVacancy error:", err.message)
        res.status(500).json({ message: err.message })
    }
}

// ── GET /api/applications/my?applicantId=<userId> ─────────────────────────
// applicantId comes from localStorage key "userId" saved at login
exports.getApplicantApplications = async (req, res) => {
    try {
        const applicantId = req.query.applicantId

        if (!applicantId) {
            return res.status(400).json({
                success: false,
                message: "applicantId is required."
            })
        }

        const applications = await Application
            .find({ applicant: applicantId })
            .populate("vacancy", "positionTitle department")
            .sort({ appliedAt: -1 })

        // Transform applications to use vacancySnapshot if vacancy was deleted
        const transformedApps = applications.map(app => {
            const appObj = app.toObject()
            
            // If vacancy still exists, use it; otherwise use vacancySnapshot
            if (!appObj.vacancy && appObj.vacancySnapshot) {
                appObj.vacancy = {
                    _id: null,
                    positionTitle: appObj.vacancySnapshot.positionTitle,
                    department: appObj.vacancySnapshot.department,
                    office: appObj.vacancySnapshot.office,
                    isDeleted: true  // ← Flag to indicate vacancy was deleted
                }
            }
            
            return appObj
        })

        // Log for debugging
        console.log("📋 Applications retrieved:", transformedApps.map(app => ({
            id: app._id,
            position: app.vacancy?.positionTitle || "Unknown",
            vacancyExists: !!app.vacancy?._id,
            resumeUrl: app.resume?.url ? "✓" : "✗"
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
            await cloudinary.uploader.destroy(public_id, { resource_type: "raw" })
        }

        await application.deleteOne()

        res.json({ success: true, message: "Application and associated files deleted." })

    } catch (err) {
        console.error("deleteApplication error:", err)
        res.status(500).json({ message: err.message })
    }
}