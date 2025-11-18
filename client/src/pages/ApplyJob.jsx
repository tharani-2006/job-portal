import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import JobCard from '../components/JobCard'
import kconvert from 'k-convert'
import moment from 'moment'
import { useUser, useAuth } from '@clerk/clerk-react'

const ApplyJob = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const { getToken } = useAuth()
  const [JobData, setJobData] = useState(null)
  const [isApplying, setIsApplying] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [resumeFile, setResumeFile] = useState(null)
  const [coverLetter, setCoverLetter] = useState('')
  const { jobs } = useContext(AppContext)

  const fetchJob = async () => {
    // Try to fetch from API first
    try {
      const response = await fetch(`http://localhost:5000/api/job/${id}`)
      const data = await response.json()
      if (response.ok && data.job) {
        setJobData(data.job)
        return
      }
    } catch (err) {
      console.error('Failed to fetch job from API:', err)
    }

    // Fallback to context jobs
    const data = jobs.filter(job => job._id === id)
    if (data.length !== 0) {
      setJobData(data[0])
    }
  }

  useEffect(() => {
    if (id) {
      fetchJob()
    }
  }, [id])

  const handleApply = async () => {
    if (!user) {
      setError('Please login to apply for this job')
      return
    }

    setIsApplying(true)
    setError('')
    setSuccess('')

    try {
      const token = await getToken()
      if (!token) {
        throw new Error('Failed to get authentication token. Please try logging in again.')
      }

      const formData = new FormData()
      if (resumeFile) {
        formData.append('resume', resumeFile)
      }
      if (coverLetter) {
        formData.append('coverLetter', coverLetter)
      }

      const response = await fetch(`http://localhost:5000/api/job/${id}/apply`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please try logging in again.')
        }
        if (response.status === 409) {
          throw new Error('You have already applied for this job')
        }
        if (response.status === 400) {
          throw new Error(data.message || 'Resume is required. Please upload a resume first.')
        }
        throw new Error(data.message || 'Failed to apply for job')
      }

      setSuccess('Application submitted successfully!')
      setTimeout(() => {
        navigate('/applications')
      }, 2000)
    } catch (err) {
      console.error('Apply error:', err)
      setError(err.message || 'Failed to apply for job. Please try again.')
    } finally {
      setIsApplying(false)
    }
  }

  return JobData ? (

    <>
      <Navbar />
      <div className='min-h-screen flex flex-col py-10 container px-4 2xl:px-20 mx-auto'>
        <div className='bg-white text-black rounded-lg w-full'>
          <div className='flex justify-center md:justify-between flex-wrap gap-8 px-14 py-20 mb-6 bg-sky-50 border border-sky-400 rounded-xl'>
            <div className='flex flex-col md:flex-row items-center'>
              <img className='h-24 bg-white rounded-lg p-4 mr-4 max-md:mb-4 border' src={JobData.companyId.image} alt="" />
              <div className='text-center md:text-left text-neutral-700'>
                <h1 className='text-2xl sm:text-4xl font-medium'>{JobData.title}</h1>
                <div className='flex flex-row flex-wrap max-md:justify-center gap-y-2 gap-6 items-center text-gray-600 mt-2'>
                  <span className='flex items-center gap-1'>
                    <img src={assets.suitcase_icon} alt="" />
                    {JobData.companyId.name}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img src={assets.location_icon} alt="" />
                    {JobData.location}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img src={assets.person_icon} alt="" />
                    {JobData.level}
                  </span>
                  <span className='flex items-center gap-1'>
                    <img src={assets.money_icon} alt="" />
                    CTC: {kconvert.convertTo(JobData.salary)}
                  </span>
                </div>
              </div>
            </div>

            <div className='flex flex-col justify-center text-end text-sm max-md:mx-auto max-md:text-center'>
              <button 
                onClick={handleApply}
                disabled={isApplying}
                className={`bg-blue-600 p-2.5 px-10 text-white rounded ${isApplying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                {isApplying ? 'Applying...' : 'Apply Now!'}
              </button>
              <p className='mt-1 text-gray-600'>Posted {moment(JobData.createdAt || JobData.date).fromNow()}</p>
            </div>

          </div>

          <div className='flex flex-col lg:flex-row justify-between items-start'>
            <div className='w-full lg:w-2/3'>
              <h2 className='font-bold text-2xl mb-4'>Job description</h2>
              <div className='rich-text' dangerouslySetInnerHTML={{__html:JobData.description}}></div>
              
              {user && (
                <div className='mt-10 space-y-4'>
                  <div>
                    <label className='block text-sm font-medium mb-2'>Upload Resume (Optional - will use your profile resume if not provided)</label>
                    <input 
                      type="file" 
                      accept='application/pdf'
                      onChange={(e) => setResumeFile(e.target.files[0])}
                      className='block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100'
                    />
                  </div>
                  <div>
                    <label className='block text-sm font-medium mb-2'>Cover Letter (Optional)</label>
                    <textarea 
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      placeholder='Write a cover letter...'
                      className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                      rows={4}
                    />
                  </div>
                </div>
              )}

              {error && <p className='text-red-600 mt-4'>{error}</p>}
              {success && <p className='text-green-600 mt-4'>{success}</p>}

              <button 
                onClick={handleApply}
                disabled={isApplying}
                className={`bg-blue-600 p-2.5 px-10 text-white rounded mt-4 ${isApplying ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
              >
                {isApplying ? 'Applying...' : 'Apply Now!'}
              </button>
            </div>

            {/* Right Section for More Jobs*/}
            <div className='w-full lg:w-1/3 mt-8 lg:mt-0 lg:ml-8 space-y-5'>
              <h2>More Jobs from {JobData.companyId.name}</h2>
              {jobs.filter(job => job._id !== JobData._id && job.companyId._id === JobData.companyId._id)
              .filter(job => true).slice(0,4)
              .map((job,index)=> <JobCard key={index} job={job} />)}
            </div>
          </div>

        </div>
      </div>
      <Footer />
    </>

  ) : (

    <Loading />

  )
}

export default ApplyJob
