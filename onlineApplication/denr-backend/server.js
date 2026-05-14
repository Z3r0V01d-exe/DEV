require("dotenv").config()

const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
const https = require("https")

const authRoutes = require("./routes/authRoutes")
const adminRoutes = require("./routes/adminRoutes")
const vacancyRoutes = require("./routes/vacancyRoutes")
const applicationRoutes = require("./routes/applicationRoutes")

const createDefaultAdmin = require("./utils/createDefaultAdmin")
const cloudinary = require("./config/cloudinary")

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

// Test route
app.get("/", (req, res) => {
    res.send("DENR Backend Running")
})

// File serving route for PDF files
app.get("/api/files/:filename", (req, res) => {
    const filePath = path.join(__dirname, "uploads", req.params.filename)

    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "inline") // ← "inline" not "attachment"
    res.setHeader("Access-Control-Allow-Origin", "*") // ← allow iframe to load it

    res.sendFile(filePath)
})

// Route to fetch Cloudinary files and serve them with proper CORS headers
// Usage: /api/cloudinary-file?url=<cloudinary-url> or /api/cloudinary-file?publicId=<public-id>
app.get("/api/cloudinary-file", (req, res) => {
    const cloudinaryUrl = req.query.url;
    const publicId = req.query.publicId;

    if (!cloudinaryUrl && !publicId) {
        return res.status(400).json({ error: "url or publicId parameter required" });
    }

    let urlToFetch = cloudinaryUrl;

    // If publicId is provided, generate the URL
    if (publicId && !cloudinaryUrl) {
        urlToFetch = cloudinary.url(publicId, {
            resource_type: "raw",
            type: "upload",
            secure: true
        });
        console.log("📝 Generated Cloudinary URL from publicId:", urlToFetch);
    }

    console.log("🔗 Fetching Cloudinary file:", urlToFetch);

    // Fetch the file from Cloudinary
    https.get(urlToFetch, (cloudinaryRes) => {
        console.log("📥 Cloudinary response status:", cloudinaryRes.statusCode);

        res.setHeader("Content-Type", cloudinaryRes.headers["content-type"] || "application/pdf");
        res.setHeader("Content-Disposition", "inline");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Cache-Control", "public, max-age=86400"); // Cache for 24 hours

        cloudinaryRes.pipe(res);
    }).on("error", (err) => {
        console.error("❌ Error fetching from Cloudinary:", err);
        res.status(500).json({ error: "Failed to fetch file from Cloudinary" });
    });
})

// Debug route: List all files uploaded to Cloudinary
app.get("/api/debug/cloudinary-files", async (req, res) => {
    try {
        console.log("🔍 Fetching list of files from Cloudinary...");
        
        const result = await cloudinary.api.resources({
            type: "upload",
            resource_type: "raw",
            prefix: "denr-applications/",
            max_results: 500
        });

        console.log("📦 Found files:", result.total_count);
        
        const files = result.resources.map(r => ({
            public_id: r.public_id,
            url: r.url || r.secure_url,
            created_at: r.created_at,
            bytes: r.bytes,
            tags: r.tags || []
        }));

        res.json({
            total: result.total_count,
            files: files.slice(0, 50) // Show first 50
        });
    } catch (err) {
        console.error("❌ Error fetching Cloudinary resources:", err);
        res.status(500).json({ error: err.message });
    }
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