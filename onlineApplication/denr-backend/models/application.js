const mongoose = require("mongoose")

// ── Education sub-schema ───────────────────────────────────────────────────
const EducationSchema = new mongoose.Schema({
    school:    { type: String, required: true },
    from:      String,
    to:        String,
    graduated: String,
    degree:    String
}, { _id: false })

// ── Experience sub-schema ──────────────────────────────────────────────────
const ExperienceSchema = new mongoose.Schema({
    company:  String,
    from:     String,
    to:       String,
    position: String,
    reason:   String
}, { _id: false })

// ── Main Application schema ────────────────────────────────────────────────
const ApplicationSchema = new mongoose.Schema({

    // ── Relations ─────────────────────────────────────────────────────────
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref:  "Applicant",
        required: true
    },
    vacancy: {
        type: mongoose.Schema.Types.ObjectId,
        ref:  "Vacancy",
        required: false  // ← Allow null if vacancy is deleted
    },

    // ── Vacancy Details (Backup) ──────────────────────────────────────────
    // Stored here so applications remain visible even if vacancy is deleted
    vacancySnapshot: {
        positionTitle: String,
        department:    String,
        office:        String,
        salary:        String,
        requirements:  String
    },

    // ── Personal Information ───────────────────────────────────────────────
    lastName:   { type: String, required: true },
    firstName:  { type: String, required: true },
    middleName: String,
    address:    { type: String, required: true },
    birthdate:  { type: String, required: true },
    age:        { type: Number, required: true },
    jobType:    { type: String, enum: ["Full-Time", "Part-Time", "Trainee"], required: true },
    email:      { type: String, required: true },
    contact:    { type: String, required: true },

    // ── Education & Experience ─────────────────────────────────────────────
    education:  { type: [EducationSchema],  default: [] },
    experience: { type: [ExperienceSchema], default: [] },

    // ── Uploaded Documents (Cloudinary) ───────────────────────────────────
    // Each document stores:
    //   url       → direct link to access/download the file
    //   public_id → Cloudinary ID used to delete the file later if needed
    resume: {
        url:       String,
        public_id: String
    },
    coverLetter: {
        url:       String,
        public_id: String
    },
    endorsementLetter: {
        url:       String,
        public_id: String
    },

    // ── Status ────────────────────────────────────────────────────────────
    status: {
        type:    String,
        enum:    ["pending", "reviewed", "shortlisted", "rejected", "approved"],
        default: "pending"
    },

    appliedAt: {
        type:    Date,
        default: Date.now
    }

})

// ── Database-level unique constraint ──────────────────────────────────────
// Prevents duplicate applications even if frontend/backend checks are bypassed.
// One applicant can only have ONE application per vacancy.
ApplicationSchema.index({ applicant: 1, vacancy: 1 }, { unique: true })

module.exports = mongoose.model("Application", ApplicationSchema)