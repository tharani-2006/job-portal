import React, { useState } from 'react'
import { assets } from '../assets/assets'

const RecruiterLogin = () => {

    const [state, setState] = useState('Login')
    const [name, setName] = useState('')
    const [password, setPassword] = useState('')
    const [email, setEmail] = useState('')

    const [image, setImage] = useState(false)

    const [isTextDataSubmitted, setIsTextDataSubmitted] = useState(false)

    return (
        <div className='absolute top-0 left-0 right-0 bottom-0 z-10 backdrop-blur-sm bg-black/30 flex justify-center items-center'>
            <form className='relative bg-white p-10 rounded-xl text-slate-500'>
                <h1 className='text-center text-2xl text-neutral-700 font-medium'>Recruiter {state}</h1>
                <p className='text-sm'>Welcome back! Please sign in to continue</p>
                {state === "Sign Up" && isTextDataSubmitted
                    ? <></>
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

                        <p className='text-sm text-blue-600 my-4 cursor-pointer'>Forgot Password?</p>
                    </>
                }


                <button className='bg-blue-600 w-full rounded-full py-2 text-white'>
                    {state === 'Login' ? 'login' : 'create account'}
                </button>

                {
                    state === 'Login'
                        ? <p className=' mt-5 text-center'>Don't have an account? <span className='cursor-pointer text-blue-600' onClick={() => setState("Sign Up")}>Sign Up</span></p>
                        : <p className=' mt-5 text-center'>Already have an account? <span className='cursor-pointer text-blue-600' onClick={() => setState("Login")}>Login</span></p>
                }



            </form>
        </div>
    )
}

export default RecruiterLogin
