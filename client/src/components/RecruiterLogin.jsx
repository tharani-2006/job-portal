import React, { useContext, useEffect, useState } from 'react'
import { assets } from '../assets/assets'
import {AppContext} from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const RecruiterLogin = () => {

    const [state, setState] = useState('Login')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')

    const [image, setImage] = useState(false)

    const [isTextDataSubmitted, setIsTextDataSubmitted] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const {setShowRecruiterLogin, setCompany} = useContext(AppContext)
    const navigate = useNavigate()

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setError('')

        // Handle Sign Up - First step (Next button)
        if (state === 'Sign Up' && !isTextDataSubmitted) {
            setIsTextDataSubmitted(true)
            return
        }

        // Handle Sign Up - Final step (Create Account button)
        if (state === 'Sign Up' && isTextDataSubmitted) {
            if (!image) {
                setError('Please upload a company logo')
                return
            }

            setIsLoading(true)
            try {
                const formData = new FormData()
                formData.append('name', name)
                formData.append('email', email)
                formData.append('password', password)
                formData.append('image', image)

                const response = await fetch('http://localhost:5000/api/company/register', {
                    method: 'POST',
                    body: formData
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message || 'Registration failed')
                }

                // Store company token and data
                if (data.token && data.company) {
                    localStorage.setItem('companyToken', data.token)
                    localStorage.setItem('company', JSON.stringify(data.company))
                    setCompany(data.company)
                }

                // Success - close modal, reset form, and redirect to dashboard
                setShowRecruiterLogin(false)
                setName('')
                setEmail('')
                setPassword('')
                setImage(false)
                setIsTextDataSubmitted(false)
                navigate('/dashboard')
            } catch (err) {
                setError(err.message || 'Registration failed. Please try again.')
            } finally {
                setIsLoading(false)
            }
            return
        }

        // Handle Login
        if (state === 'Login') {
            if (!email || !password) {
                setError('Please enter email and password')
                return
            }

            setIsLoading(true)
            try {
                const response = await fetch('http://localhost:5000/api/company/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                })

                const data = await response.json()

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed')
                }

                // Store company token and data
                if (data.token && data.company) {
                    localStorage.setItem('companyToken', data.token)
                    localStorage.setItem('company', JSON.stringify(data.company))
                    setCompany(data.company)
                }

                // Success - close modal, reset form, and redirect to dashboard
                setShowRecruiterLogin(false)
                setEmail('')
                setPassword('')
                navigate('/dashboard')
            } catch (err) {
                setError(err.message || 'Login failed. Please try again.')
            } finally {
                setIsLoading(false)
            }
        }
    }

    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    },[])

    return (
        <div className='absolute top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center'>
            <form onSubmit={onSubmitHandler} className='relative bg-white p-10 rounded-xl text-slate-500'>
                <h1 className='text-center text-2xl text-neutral-700 font-medium'>Recruiter {state}</h1>
                <p className='text-sm'>Welcome back! Please sign in to continue</p>
                {state === "Sign Up" && isTextDataSubmitted
                    ? <>

                        <div className='flex items-center gap-4 my-10'>
                            <label htmlFor="image">
                                <img className='w-16 rounded-full' src={image ? URL.createObjectURL(image) : assets.upload_area} alt="" />
                                <input onChange={e => {
                                    setImage(e.target.files[0])
                                    setError('')
                                }} type="file" id='image' hidden />
                            </label>
                            <p>Upload Company <br /> Logo</p>
                        </div>

                    </>
                    : <>
                        {state !== 'Login' && (
                            <div className='border px-4 py-2 border-gray-300 flex items-center gap-2 rounded-full mt-5'>
                                <img src={assets.person_icon} alt="" />
                                <input className='outline-none text-sm' onChange={e => setName(e.target.value)} value={name} type="text" placeholder='Company Name' required />
                            </div>
                        )}

                        <div className='border px-4 border-gray-300 py-2 flex items-center gap-2 rounded-full mt-5'>
                            <img src={assets.email_icon} alt="" />
                            <input className='outline-none text-sm' onChange={e => setEmail(e.target.value)} value={email} type="email" placeholder='Email Id' required />
                        </div>
                        <div className='border px-4 border-gray-300 py-2 flex items-center gap-2 rounded-full mt-5'>
                            <img src={assets.lock_icon} alt="" />
                            <input className='outline-none text-sm' onChange={e => setPassword(e.target.value)} value={password} type="password" placeholder='password' required />
                        </div>

                    </>
                }

                {state === "Login" && <p className='text-sm text-blue-600 mt-4 cursor-pointer'>Forgot Password?</p>}

                {error && <p className='text-sm text-red-600 mt-4'>{error}</p>}

                <button 
                    type='submit' 
                    disabled={isLoading}
                    className={`bg-blue-600 w-full rounded-full py-2 text-white mt-4 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isLoading 
                        ? 'Processing...' 
                        : state === 'Login' 
                            ? 'Login' 
                            : isTextDataSubmitted 
                                ? 'Create Account' 
                                : 'Next'
                    }
                </button>

                {
                    state === 'Login'
                        ? <p className=' mt-5 text-center'>Don't have an account? <span className='cursor-pointer text-blue-600' onClick={() => {
                            setState("Sign Up")
                            setError('')
                            setIsTextDataSubmitted(false)
                            setImage(false)
                        }}>Sign Up</span></p>
                        : <p className=' mt-5 text-center'>Already have an account? <span className='cursor-pointer text-blue-600' onClick={() => {
                            setState("Login")
                            setError('')
                            setIsTextDataSubmitted(false)
                            setImage(false)
                            setName('')
                        }}>Login</span></p>
                }

                <img onClick={e => setShowRecruiterLogin(false)} className='absolute top-5 right-5 cursor-pointer' src={assets.cross_icon} alt="" />

            </form>
        </div>
    )
}

export default RecruiterLogin
