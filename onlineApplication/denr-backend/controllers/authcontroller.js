const Applicant = require("../models/applicant")

exports.registerApplicant = async (req,res)=>{

    try{

        const {firstName,lastName,email,password,contact} = req.body

        const existing = await Applicant.findOne({email})

        if(existing){
            return res.json({
                success:false,
                message:"Email already exists"
            })
        }

        const user = new Applicant({
            firstName,
            lastName,
            email,
            password,
            contact
        })

        await user.save()

        res.json({
            success:true,
            message:"Account created"
        })

    }
    catch(err){
        res.status(500).json({message:err.message})
    }

}

exports.loginApplicant = async (req,res)=>{

    try{

        const {email,password} = req.body

        const user = await Applicant.findOne({email})

        if(!user){
            return res.json({
                success:false,
                message:"User not found"
            })
        }

        if(user.password !== password){
            return res.json({
                success:false,
                message:"Wrong password"
            })
        }

        res.json({
            success:true,
            role:"applicant",
            name:user.firstName,
            userId:user._id
        })

    }
    catch(err){
        res.status(500).json({message:err.message})
    }

}