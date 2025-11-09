import React from "react";
import { Link } from "react-router-dom";
import { Button } from "./ui/button";
const EventSphereLanding = () => {
  return (
    <>
      <div className="min-h-screen relative overflow-hidden satoshi-mdedium ">
        <main className="relative z-10 flex flex-col items-center justify-center px-8 py-24">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <h2 className="clash-mdedium text-[var(--primary-foreground)] text-4xl sm:text-5xl md:text-7xl font-bold  leading-16 md:leading-24 drop-shadow-lg text-shadow-[1px_4px_15px_#0f1419] ">
              Find, Book & Host
              <br />
              All in One Place
            </h2>
            <p className="text-[var(--accent)] text-xl max-w-3xl mx-auto leading-relaxed">
              Discover exciting events near you, book tickets in seconds, or
              host your own with ease. A modern platform built for event goers
              and creators alike.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-12 pt-8">
              <Button className="px-4 md:px-6 py-2 bg-black hover:bg-black text-white shadow-[var(--shadow-m)] text-sm md:text-md font-semibold rounded-xl cursor-pointer">
                <Link to="/events">Explore Events</Link>
              </Button>
              <Button className="px-4 md:px-6 py-2  bg-[var(--primary)] text-[var(--accent)] text-sm md:text-md font-semibold rounded-xl cursor-pointer shadow-[var(--shadow-l)] ">
                <Link to="/events">Host Event</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default EventSphereLanding;
