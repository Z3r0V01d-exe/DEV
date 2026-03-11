// ==================================
// APPLICATION CONTROLLER
// ==================================

exports.applyVacancy = async (req, res) => {
    try {

        res.json({
            success: true,
            message: "Application submitted (template)"
        })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

exports.getApplicantApplications = async (req, res) => {
    try {

        res.json({
            success: true,
            message: "Applicant applications list"
        })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

exports.updateApplicationStatus = async (req, res) => {
    try {

        res.json({
            success: true,
            message: "Application status updated"
        })

    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}