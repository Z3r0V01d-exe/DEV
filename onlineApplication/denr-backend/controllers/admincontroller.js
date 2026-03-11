// ================================
// ADMIN CONTROLLER
// ================================

exports.createVacancy = async (req,res)=>{
    try{

        res.json({
            success:true,
            message:"Vacancy created (template)"
        })

    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}


exports.getApplicants = async (req,res)=>{
    try{

        res.json({
            success:true,
            message:"Applicant list (template)"
        })

    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}


exports.updateApplicationStatus = async (req,res)=>{
    try{

        res.json({
            success:true,
            message:"Application status updated"
        })

    }
    catch(err){
        res.status(500).json({message:err.message})
    }
}