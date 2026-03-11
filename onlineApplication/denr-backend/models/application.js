const mongoose = require("mongoose")

const ApplicationSchema = new mongoose.Schema({

    applicant:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Applicant"
    },

    vacancy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Vacancy"
    },

    resumeURL:String,
    torURL:String,
    certificateURL:String,

    status:{
        type:String,
        default:"pending"
    },

    appliedAt:{
        type:Date,
        default:Date.now
    }

})

module.exports = mongoose.model("application", ApplicationSchema)