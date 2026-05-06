const express    = require("express")
const router     = express.Router()
const upload     = require("../middleware/upload")
const controller = require("../controllers/applicationController")

const uploadDocs = upload.fields([
    { name: "resume",            maxCount: 1 },
    { name: "coverLetter",       maxCount: 1 },
    { name: "endorsementLetter", maxCount: 1 }
])

router.post(  "/apply",       uploadDocs, controller.applyVacancy)
router.get(   "/my",                      controller.getApplicantApplications)
router.patch( "/:id/status",              controller.updateApplicationStatus)
router.delete("/:id",                     controller.deleteApplication)

module.exports = router