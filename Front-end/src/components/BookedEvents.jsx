import React, { useState, useEffect } from "react";
import { succesPay } from "../api/api";
import { useLocation } from "react-router-dom";

const BookedEvents = () => {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const session_id = params.get("session_id");
  console.log(session_id);
  const [eventData, setEventData] = useState([]);

  useEffect(() => {
    succesPay(session_id)
      .then((res) => {
        console.log(res);
        setEventData(res.data.data.booking || []); // set default value to empty array
        console.log(eventData);
      })
      .catch((err) => {
        console.log("error", err);
      });
  }, [session_id]);

  useEffect(() => {
    console.log('eventData updated:', eventData);
  }, [eventData]);

  return (
    <>
      <div className="w-full py-2 px-4 h-screen">
        <div className="flex flex-wrap justify-center gap-4 w-full h-full py-12 px-8">
          {Array.isArray(eventData) && eventData.map((event, index) => {
            return (
               <h1 className="text-white w-full text-2xl" key={index}>{event.paymentStatus}</h1>
            )
          })}
        </div>
      </div>
    </>
  );
};

export default BookedEvents;

