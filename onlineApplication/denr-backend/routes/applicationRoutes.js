const express = require("express")
const router = express.Router()

const {
    applyVacancy,
    getApplicantApplications,
    updateApplicationStatus
} = require("../controllers/applicationController")

// Applicant submits application
router.post("/apply", applyVacancy)

// Applicant sees their applications
router.get("/my-applications", getApplicantApplications)

// Admin approve / decline application
router.put("/status", updateApplicationStatus)

module.exports = router