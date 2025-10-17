import React from "react";
import { Button } from "./ui/button";
import { Link } from "react-router-dom";

const hostLandingPage = () => {
  return (
    <>
      <div className="w-full py-12 satoshi-mdedium flex flex-col items-center justify-center">
        <div className="max-w-4xl w-full flex flex-col items-center">
          <h1 className="text-2xl md:text-3xl lg:text-5xl satoshi-bold mt-8 text-shadow-[var(--shadow-t)]">
            Host events that inspire
          </h1>
          <p className="text-center satoshi-regular text-md md:text-lg my-6">
            Turn your ideas into real experiences share your events with the
            world, connect with attendees, and grow your community
          </p>
          <Button className="px-4 md:px-6 py-2 bg-black hover:bg-black text-white shadow-[var(--shadow-s)] text-sm md:text-md font-semibold rounded-xl cursor-pointer">
            <Link to="/events">Become Host</Link>
          </Button>
        </div>
      </div>
    </>
  );
};

export default hostLandingPage;
