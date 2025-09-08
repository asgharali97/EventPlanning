import React, { useState, useEffect } from "react";
import { succesPay, getEventById } from "../api/api";
import { useLocation } from "react-router-dom";
import { CheckCircle, Calendar, Clock, MapPin, Users } from "lucide-react";

interface BookedEvent {
  _id: string;
  bookingDate: string;
  eventId: string;
  numberOfTickets: Number;
  paymentStatus: string;
  status: string;
  totalPrice: Number;
  userId: string;
  category: string,
  coverImage: string,
  description: string,
  location: string,
  price: Number,
  seats: Number,
  time: string,
  title: string,
}

const BookedEvents = () => {
  
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const session_id = params.get("session_id");
  const [eventData, setEventData] = useState<BookedEvent[]>([]);
  const [paymentData, setPaymentData] = useState([]);
  const [showSuccessIcon, setShowSuccessIcon] = useState(true);
  const [iconAnimation, setIconAnimation] = useState(false);

  useEffect(() => {
    function getBookedEvent() {
      if(session_id){
        succesPay(session_id)
        .then((res) => {
          console.log(res)
          setPaymentData(res.data.data.booking || []);
        })
        .catch((err) => {
          console.log("error", err);
        });
        console.log(paymentData)
      }else{
         throw new Error("Payment failed. due to invalid session id.");
      }
      }
    const timer = setTimeout(() => {
      setIconAnimation(true);
    }, 100);

    const hideTimer = setTimeout(() => {
      setShowSuccessIcon(false);
    }, 3000);

    getBookedEvent();
    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  useEffect(() => {
    if (paymentData.eventId) {
      getEventById(paymentData.eventId)
        .then((res) => {
          setEventData(res.data.data || {});
        })
        .catch((err) => {
          console.log("error", err);
        });
    }
  }, [paymentData.eventId]);

  return (
    <>
      <div className="w-full py-2 px-4 min-h-screen">
        <div className="flex flex-col justify-center items-center mx-auto gap-4 w-full h-full py-12 px-8">
          {showSuccessIcon && (
            <div
              className={`mb-6 transform transition-all duration-1000 ease-out ${
                iconAnimation
                  ? "scale-100 opacity-100 translate-y-0"
                  : "scale-50 opacity-0 translate-y-10"
              }`}
            >
              <div className="relative flex flex-col items-center">
    
                <div className="relative w-12 h-12 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                  <CheckCircle className="w-8 h-8 text-white" strokeWidth={3} />
                </div>

                <div className="text-center mt-3">
                  <h2 className="text-xl font-bold text-white mb-1">
                    Payment Successful!
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Your tickets have been confirmed
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="w-[25rem] min-h-full bg-gray-900 border border-gray-800 rounded-sm shadow-lg overflow-hidden hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300 mt-12">
            <div className="relative">
              <img
                src={eventData.coverImage}
                alt={eventData.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-3 left-3">
                <span className="bg-violet-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {eventData.category}
                </span>
              </div>
              {paymentData.paymentStatus === "paid" && (
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
                {eventData.title}
              </h3>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-300 text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-violet-400" />
                  <span>{new Date(eventData.date).toLocaleDateString()}</span>
                </div>

                <div className="flex items-center text-gray-300 text-sm">
                  <Clock className="w-4 h-4 mr-2 text-violet-400" />
                  <span>{eventData.time}</span>
                </div>

                <div className="flex items-center text-gray-300 text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-violet-400" />
                  <span>{eventData.location}</span>
                </div>

                <div className="flex items-center text-gray-300 text-sm">
                  <Users className="w-4 h-4 mr-2 text-violet-400" />
                  <span>
                    {paymentData.numberOfTickets}{" "}
                    {paymentData.numberOfTickets === 1 ? "Ticket" : "Tickets"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="text-right">
                  <p className="text-gray-400 text-sm">Total Price</p>
                  <p className="text-2xl font-bold text-white">
                    ${paymentData.totalPrice}
                  </p>
                </div>
              </div>

              <button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-sm transition-colors duration-200 flex items-center justify-center gap-2"
                disabled={paymentData.paymentStatus === "paid"}
              >
                <CheckCircle className="w-5 h-5" />
                {paymentData.paymentStatus === "paid"
                  ? "Payment Completed"
                  : "Book Now"}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-gray-400 text-sm max-w-md">
            <p>
              A confirmation email has been sent to your registered email
              address. Please keep this for your records.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookedEvents;
