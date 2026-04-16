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
        const { status } = req.body;

        const updated = await Vacancy.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );

        res.json({ success: true, vacancy: updated });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};