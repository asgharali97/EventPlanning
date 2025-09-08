import React, { useEffect, useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  DollarSign,
  Users,
  Ticket,
  CreditCard,
  Minus,
  Plus,
  X,
} from "lucide-react";
import { getAllEvents, paymentApi } from "../api/api";
import { useAuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface EventData {
  category: string;
  coverImage: string;
  description: string;
  location: string;
  price: Number;
  seats: Number;
  time: string;
  title: string;
  date:string;
  seatsAvailable:number;
  _id: string;
}

const Event = () => {
  const { user } = useAuthContext();
  const [eventData, setEventData] = useState<EventData[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [tacketsQuntity, setTacketsQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const openPopup = (eventId: string) => {
    setSelectedEventId(eventId);
    setIsPopupOpen(true);
    console.log(isPopupOpen);
    setTacketsQuantity(1);
  };

  const closePopup = () => {
    setSelectedEventId("");
    setIsPopupOpen(false);
    setTacketsQuantity(1);
  };

  const incrementTickets = () => {
    if (tacketsQuntity < 10) {
      setTacketsQuantity(tacketsQuntity + 1);
    }
  };

  const decrementTickets = () => {
    if (tacketsQuntity > 1) {
      setTacketsQuantity(tacketsQuntity - 1);
    }
  };

  const handlePayment = async (eventId: string, numberOfTickets: number) => {
    if (!user) navigate("/signin");
    try {
      const response = await paymentApi(eventId, numberOfTickets);
      window.location.href = response.data.data.customer;
    } catch (error) {
      throw new Error("Payment failed. Please try again later.", error);
    }
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data } = await getAllEvents();
        setEventData(data.data);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {}, [eventData]);

  const selectedEvent = selectedEventId && eventData.find((event) => event._id === selectedEventId);

  const totalPrice = selectedEvent ? selectedEvent.price * tacketsQuntity : 0;
  return (
    <>
      <div className="w-full py-2 px-4 min-h-screen">
        <div className="grid grid-cols-3 gap-8 w-full h-full py-12 px-8">
          {eventData?.map((event, index) => {
            const allSeatsBooked = event.seats === 0;
            const date = new Date(`${event.date}`).toDateString();
            return (
              <div
                className="w-[25rem] bg-gray-900 border border-gray-800 rounded-sm shadow-lg overflow-hidden hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 my-4"
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
                  {allSeatsBooked && (
                    <div className="absolute top-3 right-3">
                      <span className="bg-violet-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                        Seats Booked
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-white mb-2 line-clamp-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                    {event.description}
                  </p>
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-4 h-4 text-violet-400" />
                      <span className="text-sm font-medium">{date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Clock className="w-4 h-4 text-violet-400" />
                      <span className="text-sm font-medium">{event.time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-gray-300">
                    <MapPin className="w-4 h-4 text-violet-400 flex-shrink-0" />
                    <span className="text-sm font-medium truncate">
                      {event.location}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-400">
                        ${event.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        {allSeatsBooked
                          ? "All Seats Booked"
                          : `${event.seats} seats left`}
                      </span>
                    </div>
                  </div>
                  <button
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 cursor-pointer disabled:bg-violet-400 disabled:text-[#dedede] disabled:cursor-not-allowed"
                    onClick={() => openPopup(event._id)}
                    disabled={allSeatsBooked}
                  >
                    Book Now
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        {isPopupOpen && selectedEvent && (
          <div className=" fixed inset-0 backdrop-blur-md bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="popup bg-gray-900 border border-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Book Tickets</h2>
                <button
                  onClick={closePopup}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="relative">
                <img
                  src={selectedEvent.coverImage}
                  alt={selectedEvent.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-violet-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {selectedEvent.category}
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {selectedEvent.title}
                </h3>

                <p className="text-gray-400 text-sm mb-4">
                  {selectedEvent.description}
                </p>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium">
                      {selectedEvent.date}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Clock className="w-4 h-4 text-violet-400" />
                    <span className="text-sm font-medium">
                      {selectedEvent.time}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-4 text-gray-300">
                  <MapPin className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {selectedEvent.location}
                  </span>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-4 h-4 text-violet-400" />
                      <span className="text-white font-medium">Tickets</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">
                        {selectedEvent.seatsAvailable} available
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={decrementTickets}
                        disabled={tacketsQuntity <= 1}
                        className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4 text-white" />
                      </button>
                      <span className="text-white font-semibold text-lg w-8 text-center">
                        {tacketsQuntity}
                      </span>
                      <button
                        onClick={incrementTickets}
                        disabled={tacketsQuntity >= 10}
                        className="w-8 h-8 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4 text-green-400" />
                        <span className="text-lg font-bold text-green-400">
                          {selectedEvent.price.toFixed(2)}
                        </span>
                        <span className="text-gray-400 text-sm">each</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-4 mb-4 space-y-2">
                  <div className="flex justify-between text-gray-300">
                    <span>Tickets ({tacketsQuntity}x)</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-700 pt-2 flex justify-between text-white font-bold">
                    <span>Total</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-2"
                  onClick={() => {
                    setIsLoading(true);
                    handlePayment(selectedEvent._id, tacketsQuntity).finally(
                      () => {
                        setIsLoading(false);
                      }
                    );
                  }}
                >
                  {isLoading ? (
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  ) : (
                    <CreditCard className="w-4 h-4" />
                  )}
                  Pay Now - ${totalPrice.toFixed(2)}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Event;
