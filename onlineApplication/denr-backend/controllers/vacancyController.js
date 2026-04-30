const Vacancy = require("../models/vacancy");

// CREATE
exports.createVacancy = async (req, res) => {
    try {
        const { positionTitle, office, openingDate, closingDate, description, adminId } = req.body;

        const vacancy = new Vacancy({
            positionTitle,
            office,
            openingDate,
            closingDate,
            description,
            admin: adminId
        });

        await vacancy.save();

        res.json({ success: true, vacancy });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET
exports.getVacancies = async (req, res) => {
    try {
        const { adminId, role } = req.query;

        let query = {};

        // ✅ ADMIN → see their vacancies
        if (adminId) {
            query.admin = adminId;
        }

        // ✅ APPLICANT → ONLY OPEN vacancies
        if (role === "applicant") {
            query.status = "Open";
        }

        const vacancies = await Vacancy.find(query).sort({ createdAt: -1 });

        res.json({ success: true, vacancies });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 🔥 DELETE (THIS IS WHAT YOU'RE MISSING)
exports.deleteVacancy = async (req, res) => {
    try {
        const { id } = req.params;

        await Vacancy.findByIdAndDelete(id);

        res.json({ success: true });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateVacancy = async (req, res) => {
    try {
        const { id } = req.params;

        const updated = await Vacancy.findByIdAndUpdate(
            id,
            req.body,
            { new: true }
        );

        res.json({ success: true, vacancy: updated });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ✅ TOGGLE STATUS (OPEN / CLOSED)
exports.updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, closingDate } = req.body;

        const vacancy = await Vacancy.findById(id);

        if (!vacancy) {
            return res.status(404).json({
                success: false,
                message: "Vacancy not found"
            });
        }

        // ✅ UPDATE STATUS
        vacancy.status = status;

        // ✅ UPDATE CLOSING DATE (ONLY IF PROVIDED)
        if (closingDate) {
            const newDate = new Date(closingDate);

            if (newDate <= new Date()) {
                return res.status(400).json({
                    success: false,
                    message: "Closing date must be in the future"
                });
            }

            vacancy.closingDate = newDate;
        }

        await vacancy.save();

        res.json({ success: true, vacancy });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};