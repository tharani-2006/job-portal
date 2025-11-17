import fs from "fs/promises"
import bcrypt from "bcrypt"
import { v2 as cloudinary } from "cloudinary"
import Company from "../models/Company.js"
import Job from "../models/Job.js"
import Application from "../models/Application.js"
import generateToken from "../utils/generateToken.js"

const buildCompanyResponse = (companyDoc) => ({
  _id: companyDoc._id,
  name: companyDoc.name,
  email: companyDoc.email,
  image: companyDoc.image,
  location: companyDoc.location,
  website: companyDoc.website,
  about: companyDoc.about,
})

const uploadLogo = async (filePath) => {
  if (!filePath) return null
  const result = await cloudinary.uploader.upload(filePath, {
    folder: "job-portal/company-logos",
    resource_type: "image",
  })
  await fs.unlink(filePath).catch(() => {})
  return result.secure_url
}

export const registerCompany = async (req, res) => {
  try {
    const { name, email, password, location = "", website = "", about = "" } =
      req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const existingCompany = await Company.findOne({ email })
    if (existingCompany) {
      return res.status(400).json({ message: "Company already exists" })
    }

    let image = req.body.image || ""
    if (req.file) {
      image = await uploadLogo(req.file.path)
    }

    if (!image) {
      return res
        .status(400)
        .json({ message: "Company logo is required. Please upload an image." })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const company = await Company.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      image,
      location,
      website,
      about,
    })

    res.status(201).json({
      company: buildCompanyResponse(company),
      token: generateToken(company._id),
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: "Missing credentials" })
    }

    const company = await Company.findOne({ email })
      .select("+password")
      .exec()

    if (!company) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    const isValidPassword = await bcrypt.compare(password, company.password)
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" })
    }

    res.json({
      company: buildCompanyResponse(company),
      token: generateToken(company._id),
    })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const getCompanyData = async (req, res) => {
  res.json({ company: buildCompanyResponse(req.company) })
}

export const postJob = async (req, res) => {
  try {
    const { title, description, location, category, level, salary, visible } =
      req.body

    if (!title || !description || !location || !category || !level || !salary) {
      return res.status(400).json({ message: "Missing required fields" })
    }

    const job = await Job.create({
      title,
      description,
      location,
      category,
      level,
      salary: Number(salary),
      visible: visible ?? true,
      companyId: req.company._id,
    })

    res.status(201).json({ job })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const getCompanyJobApplicants = async (req, res) => {
  try {
    const applications = await Application.find({
      companyId: req.company._id,
    })
      .populate("jobId", "title location level salary")
      .populate("applicantId", "name email image resume")
      .sort({ createdAt: -1 })

    res.json({ applications })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const getCompanyPostedJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ companyId: req.company._id })
      .sort({ createdAt: -1 })
      .lean()
    const jobIds = jobs.map((job) => job._id)

    const applicantCounts = await Application.aggregate([
      { $match: { companyId: req.company._id, jobId: { $in: jobIds } } },
      { $group: { _id: "$jobId", total: { $sum: 1 } } },
    ])

    const countsMap = new Map(
      applicantCounts.map((entry) => [String(entry._id), entry.total])
    )

    const enrichedJobs = jobs.map((job) => ({
      ...job,
      applicants: countsMap.get(String(job._id)) || 0,
    }))

    res.json({ jobs: enrichedJobs })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const changeJobApplicationStatus = async (req, res) => {
  try {
    const { applicationId, status } = req.body
    const allowedStatuses = ["pending", "accepted", "rejected"]

    if (!applicationId || !allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid payload" })
    }

    const application = await Application.findOneAndUpdate(
      { _id: applicationId, companyId: req.company._id },
      { status },
      { new: true }
    )

    if (!application) {
      return res.status(404).json({ message: "Application not found" })
    }

    res.json({ application })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
}

export const changeVisibility = async (req, res) => {
  try {
    const { jobId, visible } = req.body

    if (typeof visible !== "boolean" || !jobId) {
      return res.status(400).json({ message: "Invalid payload" })
    }

    const job = await Job.findOneAndUpdate(
      { _id: jobId, companyId: req.company._id },
      { visible },
      { new: true }
    )

    if (!job) {
      return res.status(404).json({ message: "Job not found" })
    }

    res.json({ job })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Internal server error" })
  }
}

