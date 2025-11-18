import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { useNavigate } from 'react-router-dom'

const ManageJobs = () => {

  const navigate = useNavigate()
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    const token = localStorage.getItem('companyToken')
    if (!token) {
      setError('Please login first')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/company/list-jobs', {
        headers: {
          'token': token
        }
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch jobs')
      }

      setJobs(data.jobs || [])
    } catch (err) {
      setError(err.message || 'Failed to load jobs')
    } finally {
      setIsLoading(false)
    }
  }

  const handleVisibilityChange = async (jobId, currentVisible) => {
    const token = localStorage.getItem('companyToken')
    if (!token) return

    try {
      const response = await fetch('http://localhost:5000/api/company/change-visibility', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          jobId,
          visible: !currentVisible
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update visibility')
      }

      // Update local state
      setJobs(jobs.map(job => 
        job._id === jobId ? { ...job, visible: !currentVisible } : job
      ))
    } catch (err) {
      setError(err.message || 'Failed to update visibility')
    }
  }

  if (isLoading) {
    return <div className='container p-4'>Loading jobs...</div>
  }

  return (
    <div className='container p-4 max-w-5xl'>
      {error && <p className='text-red-600 mb-4'>{error}</p>}
      <div className='overflow-x-auto'>
        <table className='min-w-full bg-white border border-gray-200 max-sm:text-sm'>
          <thead>
            <tr>
              <th className='py-2 px-4 border-b text-left max-sm:hidden'>#</th>
              <th className='py-2 px-4 border-b text-left'>Job Title</th>
              <th className='py-2 px-4 border-b text-left max-sm:hidden'>Date</th>
              <th className='py-2 px-4 border-b text-left max-sm:hidden'>Location</th>
              <th className='py-2 px-4 border-b text-left text-center'>Applicants</th>
              <th className='py-2 px-4 border-b text-left'>Visible</th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className='py-4 text-center text-gray-500'>No jobs found. Add your first job!</td>
              </tr>
            ) : (
              jobs.map((job, index) => (
                <tr key={job._id} className='text-gray-700 '>
                  <td className='py-2 px-4 border-b max-sm:hidden'>{index + 1}</td>
                  <td className='py-2 px-4 border-b'>{job.title}</td>
                  <td className='py-2 px-4 border-b max-sm:hidden'>{moment(job.createdAt).format('ll')}</td>
                  <td className='py-2 px-4 border-b max-sm:hidden'>{job.location}</td>
                  <td className='py-2 px-4 border-b text-center'>{job.applicants || 0}</td>
                  <td className='py-2 px-4 border-b'>
                    <input 
                      className='scale-125 ml-4' 
                      type="checkbox" 
                      checked={job.visible}
                      onChange={() => handleVisibilityChange(job._id, job.visible)}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className='mt-4 flex justify-end'>
        <button onClick={() => navigate('/dashboard/add-job')} className='py-2 px-4 border text-white bg-black rounded'>Add New Job</button>
      </div>
    </div>
  )
}

export default ManageJobs
