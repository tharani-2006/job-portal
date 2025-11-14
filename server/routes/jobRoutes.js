import express from 'express'
import { getjobs, getJobById } from '../controllers/jobController.js' 

const router = express.Router()

//get all jobs
router.get('/',getJobs)

//get a single job by id
router.get('/:id',getJobById)

export default router