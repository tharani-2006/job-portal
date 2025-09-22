import React, { useContext, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import Navbar from '../components/Navbar'
import kconvert from 'k-convert'

const ApplyJob = () => {
  const { id } = useParams()
  const [JobData, setJobData] = useState(null)
  const { jobs } = useContext(AppContext)

  const fetchJob = () => {
    const data = jobs.filter(job => job._id === id)
    if (data.length !== 0) {
      setJobData(data[0])
      console.log(data[0])
    }
  }

  useEffect(() => {
    if (jobs.length > 0) {
      fetchJob()
    }
  }, [id, jobs])

  return JobData ? (

    <>
      <Navbar />
      <div>
        <div>
          <div>
            <div>
              <img src={JobData.companyId.image} alt="" />
              <div>
                <h1>{JobData.title}</h1>
                <div>
                  <span>
                    <img src={assets.suitcase_icon} alt="" />
                    {JobData.companyId.name}
                  </span>
                  <span>
                    <img src={assets.location_icon} alt="" />
                    {JobData.location}
                  </span>
                  <span>
                    <img src={assets.person_icon} alt="" />
                    {JobData.level}
                  </span>
                  <span>
                    <img src={assets.money_icon} alt="" />
                    CTC: {kconvert.convertTo(JobData.salary)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <button>Apply Now!</button>
              <p>Posted 25 mins ago</p>
            </div>

          </div>
        </div>
      </div>
    </>

  ) : (

    <Loading />

  )
}

export default ApplyJob
