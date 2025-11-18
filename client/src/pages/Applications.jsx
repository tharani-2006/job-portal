import React, { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import { assets } from '../assets/assets'
import moment from 'moment'
import Footer from '../components/Footer'
import { useUser, useAuth } from '@clerk/clerk-react'

const Applications = () => {

  const { user } = useUser()
  const { getToken } = useAuth()
  const [isEdit, setIsEdit] = useState(false)
  const [resume, setResume] = useState(null)
  const [resumeUrl, setResumeUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState('')
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchApplications()
    }
  }, [user])

  const fetchApplications = async () => {
    try {
      const token = await getToken()
      if (!token) {
        setIsLoading(false)
        return
      }

      const response = await fetch('http://localhost:5000/api/job/user/applications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      const data = await response.json()
      if (response.ok) {
        setApplications(data.applications || [])
        // Get resume URL from first application or user data
        if (data.applications && data.applications.length > 0 && data.applications[0].resume) {
          setResumeUrl(data.applications[0].resume)
        }
      } else if (response.status === 401) {
        console.error('Unauthorized - user may not exist in database yet')
      }
    } catch (err) {
      console.error('Failed to fetch applications:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResumeUpload = async () => {
    if (!resume) {
      setError('Please select a resume file')
      return
    }

    if (!user) {
      setError('Please login first')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      // Check if user is loaded
      if (!user.id) {
        throw new Error('User session not loaded. Please refresh the page and try again.')
      }

      const token = await getToken()
      if (!token) {
        throw new Error('Failed to get authentication token. Please try logging out and logging in again.')
      }

      console.log('Uploading resume with token length:', token.length)

      const formData = new FormData()
      formData.append('resume', resume)

      const response = await fetch('http://localhost:5000/api/job/user/resume', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Resume upload failed:', data)
        if (response.status === 401) {
          throw new Error(data.message || 'Authentication failed. Please try logging out and logging in again.')
        }
        throw new Error(data.message || 'Failed to upload resume')
      }

      setResumeUrl(data.user.resume)
      setResume(null)
      setIsEdit(false)
      // Refresh applications to get updated resume
      fetchApplications()
    } catch (err) {
      console.error('Resume upload error:', err)
      setError(err.message || 'Failed to upload resume. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className='container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10'>
          <p className='text-center text-gray-500'>Please login to view your applications</p>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className='container px-4 min-h-[65vh] 2xl:px-20 mx-auto my-10'>
        <h2 className='text-xl font-semibold'>Your Resume</h2>
        {error && <p className='text-red-600 text-sm mt-2'>{error}</p>}
        <div className='flex gap-2 mb-6 mt-3'>
          {
            isEdit
              ? <>
                <label className='flex items-center' htmlFor="resumeUpload">
                  <p className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg mr-2 cursor-pointer'>
                    {resume ? resume.name : 'Select Resume'}
                  </p>
                  <input id='resumeUpload' onChange={e => {
                    setResume(e.target.files[0])
                    setError('')
                  }} accept='application/pdf' type="file" hidden />
                  <img src={assets.profile_upload_icon} alt="" />
                </label>
                <button 
                  onClick={handleResumeUpload} 
                  disabled={isUploading || !resume}
                  className={`bg-green-100 border border-green-400 rounded-lg px-4 py-2 ${isUploading || !resume ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isUploading ? 'Uploading...' : 'Save'}
                </button>
                <button 
                  onClick={() => {
                    setIsEdit(false)
                    setResume(null)
                    setError('')
                  }} 
                  className='bg-gray-100 border border-gray-400 rounded-lg px-4 py-2'
                >
                  Cancel
                </button>
              </>
              : <div className='flex gap-2'>
                {resumeUrl ? (
                  <a 
                    href={resumeUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className='bg-blue-100 text-blue-600 px-4 py-2 rounded-lg'
                  >
                    View Resume
                  </a>
                ) : (
                  <span className='bg-gray-100 text-gray-600 px-4 py-2 rounded-lg'>No Resume Uploaded</span>
                )}
                <button onClick={() => setIsEdit(true)} className='text-gray-500 border border-gray-300 rounded-lg px-4 py-2'>
                  {resumeUrl ? 'Edit' : 'Upload'}
                </button>
              </div>
          }
        </div>

        <h2 className='text-xl font-semibold  mb-4'>Jobs Applied</h2>
        {isLoading ? (
          <p className='text-center text-gray-500'>Loading applications...</p>
        ) : (
          <table className='min-w-full bg-white border border-gray-200 rounded-lg'>
            <thead>
              <tr>
                <th className='py-3 px-4 border-b border-gray-200 text-left'>Company</th>
                <th className='py-3 px-4 border-b border-gray-200 text-left'>Job Title</th>
                <th className='py-3 px-4 border-b border-gray-200 text-left max-sm:hidden'>Location</th>
                <th className='py-3 px-4 border-b border-gray-200 text-left max-sm:hidden'>Date</th>
                <th className='py-3 px-4 border-b border-gray-200 text-left'>Status</th>
              </tr>
            </thead>
            <tbody>
              {applications.length === 0 ? (
                <tr>
                  <td colSpan={5} className='py-4 text-center text-gray-500'>No applications found</td>
                </tr>
              ) : (
                applications.map((application, index) => (
                  <tr key={application._id}>
                    <td className='py-3 px-4 flex border-gray-200 items-center gap-2 border-b'>
                      <img className='w-8 h-8 rounded-full object-cover' src={application.companyId?.image || assets.company_icon} alt="" />
                      {application.companyId?.name || 'Unknown Company'}
                    </td>
                    <td className='py-2 border-gray-200 px-4 border-b'>{application.jobId?.title || 'N/A'}</td>
                    <td className='py-2 border-gray-200 px-4 border-b max-sm:hidden'>{application.jobId?.location || 'N/A'}</td>
                    <td className='py-2 border-gray-200 px-4 border-b max-sm:hidden'>{moment(application.createdAt).format('ll')}</td>
                    <td className='py-2 border-gray-200 px-4 border-b'>
                      <span className={`px-5 py-1.5 rounded ${
                        application.status === 'accepted' ? 'bg-green-100 text-green-700' : 
                        application.status === 'rejected' ? 'bg-red-100 text-red-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {application.status ? application.status.charAt(0).toUpperCase() + application.status.slice(1) : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

      </div>

      <Footer/>
    </>
  )
}

export default Applications
