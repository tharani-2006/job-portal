import React, { useRef, useEffect, useState } from 'react'
import Quill from 'quill'
import { JobCategories, JobLocations } from '../assets/assets'
import { useNavigate } from 'react-router-dom'

const AddJob = () => {

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('Bangalore');
  const [category, setCategory] = useState('Programming');
  const [Level, setLevel] = useState('Beginner Level');
  const [salary, setSalary] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate()

  const editorRef = useRef(null)
  const quillRef = useRef(null)

  useEffect(() => {
    //Initiate Quill only once
    if (!quillRef.current && editorRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow'
      })
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!title || !salary) {
      setError('Please fill in all required fields')
      return
    }

    const description = quillRef.current?.root.innerHTML || ''
    if (!description || description === '<p><br></p>') {
      setError('Please add a job description')
      return
    }

    const token = localStorage.getItem('companyToken')
    if (!token) {
      setError('Please login first')
      navigate('/')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('http://localhost:5000/api/company/post-job', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'token': token
        },
        body: JSON.stringify({
          title,
          description,
          location,
          category,
          level: Level,
          salary,
          visible: true
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to add job')
      }

      // Reset form
      setTitle('')
      setLocation('Bangalore')
      setCategory('Programming')
      setLevel('Beginner Level')
      setSalary(0)
      if (quillRef.current) {
        quillRef.current.root.innerHTML = ''
      }

      // Navigate to manage jobs
      navigate('/dashboard/manage-jobs')
    } catch (err) {
      setError(err.message || 'Failed to add job. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <form onSubmit={handleSubmit} className='container p-4 flex flex-col w-full items-start gap-3'>
      <div className='w-full'>
        <p className='mb-2'>Job Title</p>
        <input
          className='w-full max-w-lg px-3 py-2 border-2 border-gray-300 rounded'
          type="text" placeholder='Type here'
          onChange={e => setTitle(e.target.value)} value={title}
          required
        />
      </div>

      <div className='w-full max-w-lg'>
        <p className='my-2'>Job Description</p>
        <div ref={editorRef}></div>
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div >
          <p className='mb-2'>Job Category</p>
          <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e => setCategory(e.target.value)}>
            {JobCategories.map((category, index) => (
              <option key={index} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div>
          <p className='mb-2'>Job Location</p>
          <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e => setLocation(e.target.value)}>
            {JobLocations.map((location, index) => (
              <option key={index} value={location}>{location}</option>
            ))}
          </select>
        </div>
        <div>
          <p className='mb-2'>Job Level</p>
          <select className='w-full px-3 py-2 border-2 border-gray-300 rounded' onChange={e => setLevel(e.target.value)}>
            <option value="Beginner Level">Beginner Level</option>
            <option value="Intermediate Level">Intermediate Level</option>
            <option value="Senior Level">Senior Level</option>
          </select>
        </div>
      </div>

      <div>
        <p className='mb-2'>Job Salary</p>
        <input min={0} className='w-full px-3 py-2 border-2 border-gray-300 rounded sm:w-[120px]' onChange={e => setSalary(Number(e.target.value))} value={salary} type="Number" placeholder='2500' />
      </div>

      {error && <p className='text-red-600 text-sm mt-2'>{error}</p>}

      <button 
        type='submit'
        disabled={isLoading}
        className={`w-28 py-3 mt-4 bg-black text-white rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLoading ? 'Adding...' : 'ADD'}
      </button>
    </form>
  )
}

export default AddJob
