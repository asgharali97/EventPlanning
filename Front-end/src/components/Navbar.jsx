import React from 'react'
import { useUser } from '@clerk/clerk-react'
import {SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/react-router'
import { Link } from 'react-router-dom'
import { Input } from './ui/input'
const Navbar = () => {
    const { user } = useUser();
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

  if (user?.emailAddresses[0].emailAddress !== adminEmail) {
    return (
    <div className="py-4 px-6 w-full bg-[#3d4045] ">
      <div className="flex justify-between items-center">
         <div className="font-bold text-xl md:text-2xl cursor-pointer">
           <Link to="/" className='cursor-pointer'> EventSphare </Link>
         </div>
         <SignedOut>
          <SignInButton  className="border border-[#aaaeb5] py-1 px-4 rounded-md"/>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
      </div>
  )
}else{
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
        <SignedIn>
          <UserButton className="mx-4"/>
        </SignedIn>
         </div>
      </div>
      </div>
    )
  }


}

export default Navbar
