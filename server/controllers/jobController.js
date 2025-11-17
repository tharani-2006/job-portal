import fs from "fs/promises"
import { v2 as cloudinary } from "cloudinary"
import Job from "../models/Job.js"
import Application from "../models/Application.js"

const formatJob = (jobDoc, applicants = 0) => ({
  ...jobDoc.toObject(),
  applicants,
})

const uploadResumeFile = async (filePath) => {
  if (!filePath) return null
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "job-portal/resumes",
    resource_type: "raw",
  })
  await fs.unlink(filePath).catch(() => {})
  return result.secure_url
}

export const getJobs = async (req, res) => {
  try {
    const { category, location, search } = req.query
    const filters = { visible: true }

    if (category) filters.category = category
    if (location) filters.location = location
    if (search) filters.title = { $regex: search, $options: "i" }

    const jobs = await Job.find(filters)
      .sort({ createdAt: -1 })
      .populate("companyId", "name email image location website")

    const jobIds = jobs.map((job) => job._id)
    const applicantCounts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: "$jobId", total: { $sum: 1 } } },
    ])
    const countsMap = new Map(
      applicantCounts.map((entry) => [String(entry._id), entry.total])
    )

    res.status(200).json({
      jobs: jobs.map((job) =>
        formatJob(job, countsMap.get(String(job._id)) || 0)
      ),
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate(
      "companyId",
      "name email image location website"
    )
    if (!job || !job.visible) {
      return res.status(404).json({ message: "Job not found" })
    }

    const applicants = await Application.countDocuments({ jobId: job._id })
    res.status(200).json({ job: formatJob(job, applicants) })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const applyToJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
    if (!job || !job.visible) {
      return res.status(404).json({ message: "Job not found" })
    }

    const existingApplication = await Application.findOne({
      jobId: job._id,
      applicantId: req.user._id,
    })

    if (existingApplication) {
      return res
        .status(409)
        .json({ message: "You have already applied for this job" })
    }

    let resumeUrl = req.user.resume
    if (req.file) {
      resumeUrl = await uploadResumeFile(req.file.path)
      req.user.resume = resumeUrl
      await req.user.save()
    }

    if (!resumeUrl) {
      return res.status(400).json({
        message: "Resume is required. Upload via profile or with the request.",
      })
    }

    const application = await Application.create({
      jobId: job._id,
      companyId: job.companyId,
      applicantId: req.user._id,
      applicantEmail: req.user.email,
      applicantName: req.user.name,
      resume: resumeUrl,
      coverLetter: req.body.coverLetter || "",
    })

    res.status(201).json({ application })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const getUserApplications = async (req, res) => {
  try {
    const applications = await Application.find({
      applicantId: req.user._id,
    })
      .populate("jobId", "title location level salary companyId date")
      .populate("companyId", "name email image")
      .sort({ createdAt: -1 })

    res.json({ applications })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const updateUserResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Resume file is required" })
    }
    const resumeUrl = await uploadResumeFile(req.file.path)
    req.user.resume = resumeUrl
    await req.user.save()

    res.json({ user: req.user })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
}