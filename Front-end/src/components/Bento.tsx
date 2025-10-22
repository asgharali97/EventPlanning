import React from "react";

const Bento = () => {
  return (
    <>
      <div className="my-12 w-full h-screen">
        <div className="w-6xl mx-auto py-12 px-8 flex items-center justify-center">
          <div className="w-full h-full ">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-[16rem]">
              <div className="rounded-2xl overflow-hidden bg-[var(--muted)] shadow-[0_1px_1px_rgba(0,0,0,0.05),0_4px_6px_rgba(34,42,53,0.04),0_24px_68px_rgba(47,48,55,0.05),0_2px_3px_rgba(0,0,0,0.04)] ">
              </div>

              <div className="rounded-2xl col-span-2 overflow-hidden bg-[var(--muted)]"></div>

              <div className="rounded-2xl overflow-hidden bg-[var(--muted)]"></div>

              <div className="rounded-2xl overflow-hidden bg-[var(--muted)]"></div>
              <div className="rounded-2xl overflow-hidden bg-[var(--muted)]"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Bento;
