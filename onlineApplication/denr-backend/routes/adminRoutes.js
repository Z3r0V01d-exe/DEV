const express = require("express")
const router  = express.Router()

const {
    createVacancy,
    getApplicants,
    updateApplicationStatus,
    getAdminProfile,
    updateAdminProfile,
    updateAdminEmail,
    updateAdminPassword
} = require("../controllers/admincontroller")

// ── Profile routes ─────────────────────────────────────────────────────────
router.get  ("/profile",              getAdminProfile)
router.patch("/profile/:adminId",     updateAdminProfile)
router.patch("/profile/:adminId/email",    updateAdminEmail)
router.patch("/profile/:adminId/password", updateAdminPassword)

// ── Existing routes ────────────────────────────────────────────────────────
router.post("/create-vacancy",      createVacancy)
router.get ("/applicants",          getApplicants)
router.put ("/application-status",  updateApplicationStatus)

module.exports = router