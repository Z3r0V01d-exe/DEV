require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const authRoutes = require("./routes/authRoutes")
const adminRoutes = require("./routes/adminRoutes")
const vacancyRoutes = require("./routes/vacancyRoutes")
const applicationRoutes = require("./routes/applicationRoutes")

const createDefaultAdmin = require("./utils/createDefaultAdmin")

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Test route
app.get("/", (req, res) => {
    res.send("DENR Backend Running")
})


// Routes
app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes)
app.use("/api/vacancies", vacancyRoutes)
app.use("/api/applications", applicationRoutes)


// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
.then(async () => {

    console.log("✅ MongoDB Connected")

    // Create default admin if not existing
    await createDefaultAdmin()

})
.catch(err => {
    console.error("❌ MongoDB Connection Error:", err)
})


// Start Server
const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
})