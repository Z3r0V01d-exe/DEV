const mongoose = require("mongoose")

const ApplicantSchema = new mongoose.Schema({

    firstName:String,
    lastName:String,
    email:{
        type:String,
        unique:true
    },
    password:String,
    contact:String,

    createdAt:{
        type:Date,
        default:Date.now
    }

})

module.exports = mongoose.model("Applicant", ApplicantSchema)