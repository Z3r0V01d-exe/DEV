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
                message:"Incorrect password"
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