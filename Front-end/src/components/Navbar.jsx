import React from 'react'
import { useUser } from '@clerk/clerk-react'
import {SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/react-router'
const Navbar = () => {
    const { user } = useUser();
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;

  if (user?.emailAddresses[0].emailAddress !== adminEmail) {
    return (
    <div className="py-4 px-6 w-full">
         <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
  )}else{
    return (
      <div className="font-bold text-xl text-center py-4 px-6 w-full">
        AddEvent
      <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    )
  }


}

export default Navbar
