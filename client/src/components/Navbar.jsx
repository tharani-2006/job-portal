import React, { useContext } from "react";
import { assets } from "../assets/assets";
import { useClerk, useUser, UserButton } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const { openSignIn } = useClerk();
  const { user } = useUser();

  const navigate = useNavigate()

  const {setShowRecruiterLogin, company} = useContext(AppContext)

  return (
    <div className="shadow py-4">
      <div className="container px-4 2xl:px-20 mx-auto flex justify-between items-center">
        <img onClick={() => navigate('/')} className="cursor-pointer" src={assets.logo} alt="Logo" />

        <div className="flex gap-4 max-sm:text-xs items-center">
          {company ? (
            <div className="flex items-center gap-3">
              <Link to={'/dashboard'}>Dashboard</Link>
              <p>|</p>
              <p className="max-sm:hidden">Hi, {company.name}</p>
              <img className="w-8 h-8 rounded-full border border-gray-300" src={company.image} alt={company.name} />
            </div>
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link to={'/applications'}>Applied Jobs</Link>
              <p>|</p>
              <p className="max-sm:hidden">Hi , {user.firstName+ " " + user.lastName}</p>
              <UserButton  /> 
            </div>
          ) : (
            // When not signed in, show Recruiter Login + Login buttons
            <div className="flex gap-4">
              <button onClick={e => setShowRecruiterLogin(true)} className="text-gray-600">Recruiter Login</button>
              <button onClick={openSignIn} className="bg-blue-600 text-white px-6 sm:px-9 py-2 rounded-full" > Login </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
