const bcrypt = require("bcrypt");
const Applicant = require("../models/applicant");
const Admin = require("../models/admin");

// ==============================
// REGISTER APPLICANT
// ==============================
exports.registerApplicant = async (req, res) => {
    try {

        const { firstName, lastName, email, password, contact } = req.body;

        // Validate input
        if (!firstName || !lastName || !email || !password || !contact) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if email exists
        const existing = await Applicant.findOne({ email });

        if (existing) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create applicant
        const newApplicant = new Applicant({
            firstName,
            lastName,
            email,
            contact,
            password: hashedPassword
        });

        await newApplicant.save();

        res.json({
            success: true,
            message: "Registration successful"
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



// ==============================
// LOGIN (ADMIN OR APPLICANT)
// ==============================
exports.login = async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password required"
            });
        }

        let user = await Admin.findOne({ email });
        let role = "admin";

        // If not admin, check applicant
        if (!user) {
            user = await Applicant.findOne({ email });
            role = "applicant";
        }

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "Email not found"
            });
        }

        // Check password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({
                success: false,
                message: "Incorrect password"
            });
        }

        // Send clean response (no password)
        res.json({
            success: true,
            message: "Login successful",
            role: role,
            userId: user._id,
            name: user.firstName
        });

    } catch (err) {

        console.error(err);

        res.status(500).json({
            success: false,
            message: "Server error"
        });

    }

};