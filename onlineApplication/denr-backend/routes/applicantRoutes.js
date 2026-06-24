const express = require("express")
const router  = express.Router()

const {
    getProfile,
    updateProfile,
    updateEmail,
    updatePassword
} = require("../controllers/applicantController")

router.get  ("/profile",                          getProfile)
router.patch("/profile/:applicantId",             updateProfile)
router.patch("/profile/:applicantId/email",       updateEmail)
router.patch("/profile/:applicantId/password",    updatePassword)

module.exports = router