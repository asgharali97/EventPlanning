import React, { useState, useEffect } from "react";
import { succesPay, getEventById } from "../api/api";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Calendar, Clock, MapPin, Users, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PaymentData {
  _id: string;
  bookingDate: string;
  eventId: {
    _id: string;
    title?: string;
    coverImage?: string;
    category?: string;
    location?: string;
    date?: string;
    time?: string;
  };
  numberOfTickets: number;
  paymentStatus: string;
  status: string;
  finalAmount: number;
  userId: string;
}

interface EventData {
  _id: string;
  title: string;
  category: string;
  coverImage: string;
  description: string;
  location: string;
  price: number;
  seats: number;
  date: string;
  time: string;
}

const BookedEvents = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const session_id = params.get("session_id");
  
  const [eventData, setEventData] = useState<EventData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessIcon, setShowSuccessIcon] = useState(true);
  const [iconAnimation, setIconAnimation] = useState(false);

  useEffect(() => {
    if (!session_id) {
      setError("Invalid session. Payment verification failed.");
      setIsLoading(false);
      return;
    }

    succesPay(session_id)
      .then((res) => {
        const booking = res.data.data.booking;
        setPaymentData(booking);
      })
      .catch((err) => {
        setError("Failed to verify payment. Please contact support.");
      })
      .finally(() => {
        setIsLoading(false);
      });

    const timer = setTimeout(() => setIconAnimation(true), 100);
    const hideTimer = setTimeout(() => setShowSuccessIcon(false), 3000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, [session_id]);

  useEffect(() => {
    if (paymentData?.eventId?._id) {
      console.log("Fetching event with ID:", paymentData.eventId._id);
      
      getEventById(paymentData.eventId._id)
        .then((res) => {
          const event = res.data.data;
          setEventData(event);
          console.log("Event Data:", event);
        })
        .catch((err) => {
          console.error("Event fetch error:", err);
          setEventData({
            _id: paymentData.eventId._id,
            title: paymentData.eventId.title || "Event",
            category: paymentData.eventId.category || "General",
            coverImage: paymentData.eventId.coverImage || "",
            location: paymentData.eventId.location || "TBA",
            date: paymentData.eventId.date || "",
            time: paymentData.eventId.time || "TBA",
            description: "",
            price: 0,
            seats: 0,
          });
        });
    }
  }, [paymentData]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl min-h-screen py-8 border-r border-l border-[var(--border)]">
        <Skeleton className="h-10 w-32 mb-8" />
        <Skeleton className="w-full h-64 rounded-lg mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="py-8 flex flex-col items-center justify-center min-h-[40vh]">
        <Alert className="flex justify-center border-none bg-transparent satoshi-regular">
          <AlertDescription className="text-lg md:text-xl text-center">
           {error || "Failed to load booking details"}
          </AlertDescription>
        </Alert>
        <Button
          className="mt-6 satoshi-medium shadow-sm hover:shadow-[var(--shadow-m)] cursor-pointer text-[var(--popover)] bg-[var(--foreground)] hover:bg-[var(--muted-foreground)] hover:text-[var(--primary-foreground)]"
          onClick={navigate('/event')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl min-h-screen py-8 px-6 border-r border-l border-[var(--border)] satoshi-medium text-[var(--foreground)]">

      {showSuccessIcon && (
        <div
          className={`flex flex-col items-center mb-8 transform transition-all duration-1000 ease-out ${
            iconAnimation
              ? "scale-100 opacity-100 translate-y-0"
              : "scale-50 opacity-0 translate-y-10"
          }`}
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg mb-4">
            <CheckCircle className="w-10 h-10 text-white" strokeWidth={3} />
          </div>
          <h2 className="text-2xl satoshi-bold text-[var(--foreground)] mb-2">
            Payment Successful!
          </h2>
          <p className="text-[var(--secondary)]">
            Your tickets have been confirmed
          </p>
        </div>
      )}

      <div className="border border-[var(--border)] rounded-lg overflow-hidden">
        {eventData?.coverImage && (
          <div className="relative">
            <img
              src={eventData.coverImage}
              alt={eventData.title}
              className="w-full h-64 object-cover"
            />
            <div className="absolute top-4 left-4">
              <Badge className="bg-[var(--foreground)] text-[var(--popover)]">
                {eventData.category}
              </Badge>
            </div>
            {paymentData.paymentStatus === "paid" && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-green-600 text-white flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Paid
                </Badge>
              </div>
            )}
          </div>
        )}

        <div className="p-6 border-t border-[var(--border)]">
          <h1 className="satoshi-bold text-2xl mb-6 text-[var(--foreground)]">
            {eventData?.title || "Event Booked"}
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[var(--secondary)]" />
              <div>
                <p className="text-xs text-[var(--secondary)]">Date</p>
                <p className="text-[var(--foreground)]">
                  {eventData?.date
                    ? new Date(eventData.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : "TBA"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[var(--secondary)]" />
              <div>
                <p className="text-xs text-[var(--secondary)]">Time</p>
                <p className="text-[var(--foreground)]">
                  {eventData?.time || "TBA"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-[var(--secondary)]" />
              <div>
                <p className="text-xs text-[var(--secondary)]">Location</p>
                <p className="text-[var(--foreground)]">
                  {eventData?.location || "TBA"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-[var(--secondary)]" />
              <div>
                <p className="text-xs text-[var(--secondary)]">Tickets</p>
                <p className="text-[var(--foreground)]">
                  {paymentData.numberOfTickets}{" "}
                  {paymentData.numberOfTickets === 1 ? "Ticket" : "Tickets"}
                </p>
              </div>
            </div>
          </div>
          <div className="border-t border-[var(--border)] pt-4 mb-4">
            <div className="flex items-center justify-between">
              <span className="text-[var(--secondary)]">Total Amount Paid</span>
              <span className="satoshi-bold text-2xl text-[var(--foreground)]">
                ${paymentData.finalAmount}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 py-3 bg-green-500/10 border border-green-500/20 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span className="satoshi-medium text-green-500">
              Booking Confirmed
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 p-4 bg-[var(--accent)] border border-[var(--border)] rounded-lg">
        <p className="text-sm text-[var(--secondary)] text-center">
          A confirmation email has been sent to your registered email address.
          Please keep this for your records.
        </p>
      </div>
      <div className="flex flex-wrap gap-4 mt-6">
        <Button
          onClick={() => navigate("/events")}
          variant="outline"
          className="flex-1 cursor-pointer"
        >
          Browse More Events
        </Button>
        <Button
          onClick={() => navigate("/my-bookings")}
          className="flex-1-cursor-pointer"
        >
          View All Bookings
        </Button>
      </div>
    </div>
  );
};

export default BookedEvents;