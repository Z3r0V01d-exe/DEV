const mongoose = require("mongoose")

const AdminSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },

    lastName: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        default: "admin"
    },

    office: {
        type: String,
        default: ""
    },

    lastLogin: {
        type: Date,
        default: null
    },

    activityLog: [
        {
            action: { type: String },
            date:   { type: Date, default: Date.now }
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now
    }

})

module.exports = mongoose.model("Admin", AdminSchema)