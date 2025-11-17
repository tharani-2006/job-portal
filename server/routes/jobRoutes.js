import express from 'express'
import upload from '../config/multer.js'
import {
  getJobs,
  getJobById,
  applyToJob,
  getUserApplications,
  updateUserResume,
} from '../controllers/jobController.js'
import { protectUser } from '../middleware/authMiddleware.js'

const router = express.Router()

//get all jobs
router.get('/', getJobs)

//get authenticated user applications
router.get('/user/applications', protectUser, getUserApplications)

//update resume
router.put(
  '/user/resume',
  protectUser,
  upload.single('resume'),
  updateUserResume
)

//apply to a job
router.post(
  '/:id/apply',
  protectUser,
  upload.single('resume'),
  applyToJob
)

//get a single job by id
router.get('/:id', getJobById)

export default router