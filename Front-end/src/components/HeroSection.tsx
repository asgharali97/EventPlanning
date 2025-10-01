import React from 'react';

const EventSphereLanding = () => {
  return (
      <>
    <div className="min-h-screen relative overflow-hidden satoshi-mdedium "
    >
      <main className="relative z-10 flex flex-col items-center justify-center px-8 py-24">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <h2 className="clash-mdedium text-[var(--primary-foreground)] text-7xl font-bold leading-24 drop-shadow-lg text-shadow-[1px_4px_15px_#0f1419] ">
            Find, Book & Host
            <br />
            All in One Place
          </h2>
          
          <p className="text-[var(--accent)] text-xl max-w-3xl mx-auto leading-relaxed">
            Discover exciting events near you, book tickets in seconds, or host your own with ease. 
            A modern platform built for event goers and creators alike.
          </p>

          <div className="flex items-center justify-center gap-12 pt-8">
            <button className="px-6 py-2 bg-black text-white border-1 border-[var(--popover)] text-md font-semibold rounded-xl cursor-pointer shadow-[1px_-2px_20px_#0f1419]">
              Explore Events
            </button>
             <button className="px-6 py-2 bg-[var(--primary)] text-[var(--accent)] text-md font-semibold rounded-xl cursor-pointer shadow-[1px_-2px_20px_#0f1419] ">
              Host an Event
            </button>
          </div>
        </div>
      </main>
    </div>
      <div className="w-full border-b border-[var(--popover)]"></div>
      </>
  );
};

export default EventSphereLanding;