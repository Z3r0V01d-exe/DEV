// ==================================
// VACANCY CONTROLLER
// ==================================

exports.getVacancies = async (req,res)=>{
    try{

        res.json({
            success:true,
            message:"Vacancies list (template)"
        })

    }catch(err){

        res.status(500).json({
            message:err.message
        })

    }
}

exports.createVacancy = async (req,res)=>{
    try{

        res.json({
            success:true,
            message:"Vacancy created (template)"
        })

    }catch(err){

        res.status(500).json({
            message:err.message
        })

    }
}

exports.deleteVacancy = async (req,res)=>{
    try{

        res.json({
            success:true,
            message:"Vacancy deleted (template)"
        })

    }catch(err){

        res.status(500).json({
            message:err.message
        })

    }
}