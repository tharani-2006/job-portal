import React, { useState, useEffect } from 'react'
import { assets } from '../assets/assets'

const ViewApplications = () => {
  const [applications, setApplications] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    const token = localStorage.getItem('companyToken')
    if (!token) {
      setError('Please login first')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/company/applicants', {
        headers: {
          'token': token
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch applications')
      }

      setApplications(data.applications || [])
    } catch (err) {
      setError(err.message || 'Failed to load applications')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStatusChange = async (applicationId, status) => {
    const token = localStorage.getItem('companyToken')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/company/change-status', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          applicationId,
          status
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update status')
      }

      // Update local state
      setApplications(applications.map(app => 
        app._id === applicationId ? { ...app, status } : app
      ))
    } catch (err) {
      setError(err.message || 'Failed to update status')
    }
  }

  if (isLoading) {
    return <div className='container mx-auto p-4'>Loading applications...</div>
  }

  return (
    <div className='container mx-auto p-4'>
      {error && <p className='text-red-600 mb-4'>{error}</p>}
      <div>
        <table className='w-full max-w-4xl bg-white border border-gray-200 max-sm:text-sm'>
          <thead>
            <tr className='border-b'>
              <th className='py-2 px-4 text-left'>#</th>
              <th className='py-2 px-4 text-left'>User Name</th>
              <th className='py-2 px-4 text-left max-sm:hidden'>Job Title</th>
              <th className='py-2 px-4 text-left max-sm:hidden'>Location</th>
              <th className='py-2 px-4 text-left'>Resume</th>
              <th className='py-2 px-4 text-left'>Status</th>
              <th className='py-2 px-4 text-left'>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={7} className='py-4 text-center text-gray-500'>No applications found</td>
              </tr>
            ) : (
              applications.map((application, index) => (
                <tr key={application._id} className='text-gray-700'>
                  <td className='py-2 px-4 border-b text-center'>{index + 1}</td>
                  <td className='py-2 px-4 border-b'>
                    <div className='flex items-center'>
                      <img className='w-10 h-10 rounded-full mr-3 max-sm:hidden object-cover' src={application.applicantId?.image || assets.company_icon} alt="" />
                      <span>{application.applicantId?.name || application.applicantName}</span>
                    </div>
                  </td>
                  <td className='py-2 px-4 border-b max-sm:hidden'>{application.jobId?.title}</td>
                  <td className='py-2 px-4 border-b max-sm:hidden'>{application.jobId?.location}</td>
                  <td className='py-2 px-4 border-b'>
                    {application.resume ? (
                      <a href={application.resume} target="_blank" rel="noopener noreferrer" className='bg-blue-50 text-blue-500 px-3 py-1 rounded inline-flex gap-2 items-center'>
                        Resume <img src={assets.resume_download_icon} alt="" />
                      </a>
                    ) : (
                      <span className='text-gray-400'>No resume</span>
                    )}
                  </td>
                  <td className='py-2 px-4 border-b'>
                    <span className={`px-2 py-1 rounded text-xs ${
                      application.status === 'accepted' ? 'bg-green-100 text-green-700' :
                      application.status === 'rejected' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {application.status || 'pending'}
                    </span>
                  </td>
                  <td className='py-2 px-4 border-b relative'>
                    <div className='relative inline-block text-left group'>
                      <button className='text-gray-500 action-button'>...</button>
                      <div className='z-10 hidden absolute right-0 md:left-0 top-0 mt-2 w-32 bg-white border border-gray-200 rounded shadow group-hover:block'>
                        <button 
                          onClick={() => handleStatusChange(application._id, 'accepted')}
                          className='block w-full text-left px-4 py-2 text-blue-500 hover:bg-gray-100'
                          disabled={application.status === 'accepted'}
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleStatusChange(application._id, 'rejected')}
                          className='block w-full text-left px-4 py-2 text-red-500 hover:bg-gray-100'
                          disabled={application.status === 'rejected'}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ViewApplications
