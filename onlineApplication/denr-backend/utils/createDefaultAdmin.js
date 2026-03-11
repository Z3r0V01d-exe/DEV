const bcrypt = require("bcrypt")
const Admin = require("../models/admin")

const createDefaultAdmin = async () => {

    try{

        const adminEmail = "admin@denr.gov"

        const existingAdmin = await Admin.findOne({ email: adminEmail })

        if(existingAdmin){
            console.log("✅ Default admin already exists")
            return
        }

        const hashedPassword = await bcrypt.hash("admin123",10)

        const admin = new Admin({

            firstName:"System",
            lastName:"Administrator",
            email: adminEmail,
            password: hashedPassword,
            role:"admin"

        })

        await admin.save()

        console.log("✅ Default admin account created")
        console.log("Email: admin@denr.gov")
        console.log("Password: admin123")

    }catch(error){

        console.error("Error creating default admin:", error)

    }

}

module.exports = createDefaultAdmin