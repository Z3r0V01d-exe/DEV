const express = require("express")
const router = express.Router()

const {
createVacancy,
getVacancies,
deleteVacancy
} = require("../controllers/vacancyController")

router.post("/", createVacancy)
router.get("/", getVacancies)
router.delete("/:id", deleteVacancy)

module.exports = router