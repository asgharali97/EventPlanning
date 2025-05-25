import React from 'react'
import { Link } from 'react-router-dom'
const Navbar = () => {
    return (
      <div className="py-4 px-6 w-full bg-[#3d4045] ">
      <div className="flex justify-between items-center">
         <div className="font-bold text-xl md:text-2xl cursor-pointer">
           <Link to="/" className='cursor-pointer'> EventSphare </Link>
         </div>
         <div className="flex items-center gap-4">
          <Link to="/events" className='text-white px-4 py-2'>Events</Link>
          <Link to="/create-event" className='text-white px-4 py-2 '>Create Event</Link>
          <Link to="/booked-events" className='text-white px-4 py-2 rounded-md'>Your Events</Link>
         </div>
      </div>
      </div>
    )
  }


export default Navbar
