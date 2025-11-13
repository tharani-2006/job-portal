import express from 'express'
import { registerCompany } from '../controllers/companyController.js'
import { loginCompany } from '../controllers/companyController.js'
import { getCompanyData } from '../controllers/companyController.js'
import { postJob } from '../controllers/companyController.js'
import { getCompanyJobApplicants } from '../controllers/companyController.js'
import { getCompanyPostedJobs } from '../controllers/companyController.js'
import { changeJobApplicationStatus } from '../controllers/companyController.js'
import { changeVisibility } from '../controllers/companyController.js'

const router = express.Router()

//register a new company
router.post('/register',upload.single('image'), registerCompany)

//company login
router.post('/login', loginCompany)

//get company data
router.get('/company-data', protectCompany, getCompanyData)

//post a new job
router.post('/post-job', postJob)

//get applicants Data of company   
router.get('/applicants', getCompanyJobApplicants)

//get company job list
router.get('/list-jobs', getCompanyPostedJobs)

//change application status
router.put('/change-status', changeJobApplicationStatus)

//change application visibility
router.put('/change-visibility', changeVisibility)

export default router