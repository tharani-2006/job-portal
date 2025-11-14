


//get all jobs
export const getjobs = async (req,res) => { 
    try{
        const jobs = await Job.find({visible:true})
        .populate({path:'companyId',select:'-password'})
        res.status(200).json({jobs})                                                                                                                                                                       
    } 
    catch(error){
        console.log(error)
        res.status(500).json({message:'Internal server error'})
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           q 
}

//get a single job by id
export const getJobById = async (req,res) => { 
    try{
        const job = await Job.findById(req.params.id)
        .populate({path:'companyId',select:'-password'})
        if(!job){
            return res.status(404).json({message:'Job not found'})
        }
        res.status(200).json({job})
    }
    catch(error){
        console.log(error)
        res.status(500).json({message:'Internal server error'})
    }  
}