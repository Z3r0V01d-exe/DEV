require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req,res)=>{
    res.send("DENR Backend Running")
})

mongoose.connect(process.env.MONGO_URI)
.then(()=>{
    console.log("MongoDB Connected")
})
.catch(err=>{
    console.log(err)
})

const authRoutes = require("./routes/authRoutes")
const adminRoutes = require("./routes/adminRoutes")
const vacancyRoutes = require("./routes/vacancyRoutes")
const applicationRoutes = require("./routes/applicationRoutes")

app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/vacancies", vacancyRoutes)
app.use("/api/applications", applicationRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, ()=>{
    console.log(`Server running on port ${PORT}`)
})