import { createContext, useEffect, useState } from "react";
import { jobsData } from "../assets/assets";

export const AppContext = createContext()

export const AppContextProvider = (props) => {

   const [searchFilter,setSearchFilter] = useState({
      title:'',
      location:''
   })

   const [isSearched,setIsSearched] = useState(false)

   const [jobs,setJobs] = useState([])

   const [showRecruiterLogin,setShowRecruiterLogin] = useState(false)
   const [company, setCompany] = useState(() => {
      const storedCompany = localStorage.getItem('company')
      return storedCompany ? JSON.parse(storedCompany) : null
   })

   //Function to fetch jobs
   const fetchJobs = async() => {
      try {
         const response = await fetch('http://localhost:5000/api/job')
         const data = await response.json()
         if (response.ok) {
            setJobs(data.jobs || [])
         } else {
            // Fallback to static data if API fails
            setJobs(jobsData)
         }
      } catch (error) {
         console.error('Failed to fetch jobs:', error)
         // Fallback to static data if API fails
         setJobs(jobsData)
      }
   }

   useEffect(() => {
      fetchJobs()
   },[])

   // Update localStorage when company changes
   useEffect(() => {
      if (company) {
         localStorage.setItem('company', JSON.stringify(company))
      } else {
         localStorage.removeItem('company')
         localStorage.removeItem('companyToken')
      }
   }, [company])

   const value = {
      setSearchFilter,searchFilter,
      isSearched,setIsSearched,
      jobs,setJobs,
      showRecruiterLogin,setShowRecruiterLogin,
      company,setCompany
   }

   return (<AppContext.Provider value={value}>
      {props.children}
   </AppContext.Provider>)
}