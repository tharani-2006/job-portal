import React from 'react'
import { Outlet,useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'

const Dashboard = () => {

  const navigate = useNavigate()

  return (
    <div className='min-h-screen'>

      {/* Navbar for Recruiter Panel */}
      <div className='shadow py-4'>
        <div className='flex px-5 justify-between items-center'>
          <img className='max-sm:w-32 cursor-pointer' src={assets.logo} alt="" />
          <div className='flex items-center gap-3'>
            <p className='max-sm:hidden'>Welcome! Dude</p>
            <div className='relative group'>
              <img className='w-8 border border-gray-300 rounded-full' src={assets.company_icon} alt="" />
              <div className='absolute hidden group-hover:block top-0 right-0 z-10 text-black rounded pt-12'>
                <ul className='list-none m-0 p-2 bg-white rounded-md  border text-sm'>
                  <li className='py-1 px-2 cursor-pointer pr-10'>Logout</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div> 
    </div>
  )
}

export default Dashboard
