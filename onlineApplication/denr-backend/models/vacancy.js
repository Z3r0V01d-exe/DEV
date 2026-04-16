const mongoose = require("mongoose");

const vacancySchema = new mongoose.Schema({
    positionTitle: { type: String, required: true },
    office: { type: String, required: true },

    openingDate: { type: Date, required: true },
    closingDate: { type: Date, required: true },
    
    description: { type: String },

    // 🔗 LINK TO ADMIN
    admin: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Admin",
        required: true 
    },

    status: { type: String, default: "Open" },
    applicants: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model("Vacancy", vacancySchema);