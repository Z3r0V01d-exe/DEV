const mongoose = require("mongoose")

const VacancySchema = new mongoose.Schema({

    title:String,

    office:String,

    region:String,

    description:String,

    closingDate:Date,

    status:{
        type:String,
        default:"open"
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

})

module.exports = mongoose.model("vacancy", VacancySchema)