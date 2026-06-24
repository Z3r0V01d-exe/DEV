// ================================
// ADMIN CONTROLLER
// ================================

const Admin  = require("../models/admin")
const bcrypt = require("bcryptjs")

// ── Helper: push to activity log (max 50 entries) ─────────────────────────
async function logActivity(adminId, action) {
    await Admin.findByIdAndUpdate(adminId, {
        $push: {
            activityLog: {
                $each: [{ action, date: new Date() }],
                $slice: -50
            }
        }
    })
}

// ── GET /api/admin/profile?adminId=xxx ────────────────────────────────────
exports.getAdminProfile = async (req, res) => {
    try {
        const { adminId } = req.query

        if (!adminId) {
            return res.status(400).json({ success: false, message: "adminId is required" })
        }

        const admin = await Admin.findById(adminId).select("-password")

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" })
        }

        res.json({ success: true, admin })

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// ── PATCH /api/admin/profile/:adminId — update office ────────────────────
exports.updateAdminProfile = async (req, res) => {
    try {
        const { adminId } = req.params
        const { office }  = req.body

        if (!office) {
            return res.status(400).json({ success: false, message: "Office is required" })
        }

        const admin = await Admin.findByIdAndUpdate(
            adminId,
            { office },
            { new: true }
        ).select("-password")

        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" })
        }

        await logActivity(adminId, `Updated office to "${office}"`)

        res.json({ success: true, admin })

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// ── PATCH /api/admin/profile/:adminId/email ───────────────────────────────
exports.updateAdminEmail = async (req, res) => {
    try {
        const { adminId }                   = req.params
        const { newEmail, currentPassword } = req.body

        if (!newEmail || !currentPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        const admin = await Admin.findById(adminId)
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" })
        }

        // Verify current password
        const match = await bcrypt.compare(currentPassword, admin.password)
        if (!match) {
            return res.status(401).json({ success: false, message: "Incorrect current password" })
        }

        // Check if email already taken
        const existing = await Admin.findOne({ email: newEmail })
        if (existing) {
            return res.status(409).json({ success: false, message: "Email already in use" })
        }

        admin.email = newEmail
        await admin.save()

        await logActivity(adminId, `Changed email to "${newEmail}"`)

        res.json({ success: true, message: "Email updated successfully" })

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// ── PATCH /api/admin/profile/:adminId/password ────────────────────────────
exports.updateAdminPassword = async (req, res) => {
    try {
        const { adminId }                     = req.params
        const { currentPassword, newPassword } = req.body

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ success: false, message: "All fields are required" })
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ success: false, message: "Password must be at least 8 characters" })
        }

        const admin = await Admin.findById(adminId)
        if (!admin) {
            return res.status(404).json({ success: false, message: "Admin not found" })
        }

        // Verify current password
        const match = await bcrypt.compare(currentPassword, admin.password)
        if (!match) {
            return res.status(401).json({ success: false, message: "Incorrect current password" })
        }

        // Hash and save new password
        admin.password = await bcrypt.hash(newPassword, 10)
        await admin.save()

        await logActivity(adminId, "Changed password")

        res.json({ success: true, message: "Password updated successfully" })

    } catch (err) {
        res.status(500).json({ success: false, message: err.message })
    }
}

// ── Existing vacancy / applicant stubs (unchanged) ────────────────────────
exports.createVacancy = async (req, res) => {
    try {
        res.json({ success: true, message: "Vacancy created (template)" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

exports.getApplicants = async (req, res) => {
    try {
        res.json({ success: true, message: "Applicant list (template)" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}

exports.updateApplicationStatus = async (req, res) => {
    try {
        res.json({ success: true, message: "Application status updated" })
    } catch (err) {
        res.status(500).json({ message: err.message })
    }
}