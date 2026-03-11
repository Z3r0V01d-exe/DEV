const express = require("express")
const router = express.Router()

const {
    createVacancy,
    getApplicants,
    updateApplicationStatus
} = require("../controllers/admincontroller")

router.post("/create-vacancy", createVacancy)

router.get("/applicants", getApplicants)

router.put("/application-status", updateApplicationStatus)

module.exports = router