import React, { useEffect, useState } from "react";
import { getBookedEvents, getEventById } from "../api/api";
import { CheckCircle, Calendar, Clock, MapPin, Users } from "lucide-react";

const AllBookedEvents = () => {
  const [eventData, setEventData] = useState([]);
  const [fullEventData, setFullEventData] = useState([]);

  useEffect(() => {
    getBookedEvents()
      .then((res) => {
        setEventData(res.data.data || []);
      })
      .catch((err) => {
        console.log("error", err);
      });
  }, []);

  useEffect(() => {
    // Fetch full event details for each booking
    const fetchFullEvents = async () => {
      const results = await Promise.all(
        eventData.map(async (booking) => {
          try {
            const res = await getEventById(booking.eventId);
            return { ...booking, event: res.data.data }; 
          } catch (err) {
            console.log(err)
            return { ...booking, event: null };
          }
        })
      );
      setFullEventData(results);
    };

    if (eventData.length > 0) {
      fetchFullEvents();
    }
  }, [eventData]);

  return (
    <>
      <div className="w-full min-h-screen py-2 px-4">
        <div className="grid grid-cols-3 gap-8 w-full h-full py-12 px-8">
          {fullEventData.map((item, index) => {
            const event = item.event || {};
            return (
              <div
                className="w-[25rem] min-h-full bg-gray-900 border border-gray-800 rounded-sm shadow-lg overflow-hidden hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 mt-12"
                key={index}
              >
                <div className="relative">
                  <img
                    src={event.coverImage}
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="bg-violet-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {event.category}
                    </span>
                  </div>
                  {item.paymentStatus === "paid" && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Paid
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-3">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-300 text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-violet-400" />
                      <span>
                        {event.date
                          ? new Date(event.date).toLocaleDateString()
                          : ""}
                      </span>
                    </div>

                    <div className="flex items-center text-gray-300 text-sm">
                      <Clock className="w-4 h-4 mr-2 text-violet-400" />
                      <span>{event.time}</span>
                    </div>

                    <div className="flex items-center text-gray-300 text-sm">
                      <MapPin className="w-4 h-4 mr-2 text-violet-400" />
                      <span>{event.location}</span>
                    </div>

                    <div className="flex items-center text-gray-300 text-sm">
                      <Users className="w-4 h-4 mr-2 text-violet-400" />
                      <span>
                        {item.numberOfTickets}{" "}
                        {item.numberOfTickets === 1 ? "Ticket" : "Tickets"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">Total Price</p>
                      <p className="text-2xl font-bold text-white">
                        ${item.totalPrice}
                      </p>
                    </div>
                  </div>

                  <button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-sm transition-colors duration-200 flex items-center justify-center gap-2"
                    disabled={item.paymentStatus === "paid"}
                  >
                    <CheckCircle className="w-5 h-5" />
                    {item.paymentStatus === "paid"
                      ? "Payment Completed"
                      : "Book Now"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default AllBookedEvents;