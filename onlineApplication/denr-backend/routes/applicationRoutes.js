const express    = require("express")
const router     = express.Router()
const upload     = require("../middleware/upload")
const controller = require("../controllers/applicationController")

const uploadDocs = upload.fields([
    { name: "resume",            maxCount: 1 },
    { name: "coverLetter",       maxCount: 1 },
    { name: "endorsementLetter", maxCount: 1 }
])

// Error handler middleware for upload errors
const handleUploadErrors = (err, req, res, next) => {
    if (err) {
        console.error("❌ Upload middleware error:", err.message)
        return res.status(400).json({ 
            success: false,
            message: `Upload error: ${err.message}` 
        })
    }
    next()
}

router.post(  "/apply",       uploadDocs, handleUploadErrors, controller.applyVacancy)
router.get(   "/all",                                         controller.getAllApplications)
router.get(   "/my",                                          controller.getApplicantApplications)
router.patch( "/:id/status",                                  controller.updateApplicationStatus)
router.delete("/:id",                                         controller.deleteApplication)

module.exports = router