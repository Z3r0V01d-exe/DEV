const express = require("express")
const router = express.Router()

const {
createVacancy,
getVacancies,
deleteVacancy,
updateVacancy,
updateStatus
} = require("../controllers/vacancyController")


router.post("/", createVacancy)
router.get("/", getVacancies)
router.delete("/:id", deleteVacancy)
router.put("/:id", updateVacancy);
router.put("/:id/status", updateStatus);

module.exports = router