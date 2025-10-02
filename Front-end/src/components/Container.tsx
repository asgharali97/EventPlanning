import React from "react";

const Container = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="px-8">{ children }</div>
    </>
  );
};

export default Container;
