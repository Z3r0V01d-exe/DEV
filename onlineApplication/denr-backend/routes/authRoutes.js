const express = require("express")
const router = express.Router()

const {
    registerApplicant,
    loginApplicant
} = require("../controllers/authcontroller")

router.post("/register", registerApplicant)
router.post("/login", loginApplicant)

module.exports = router