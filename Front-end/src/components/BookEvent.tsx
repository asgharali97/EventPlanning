import React, { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, MapPin, Minus, Plus, CreditCard } from "lucide-react";
import { format, set } from "date-fns";
import { paymentApi } from "@/api/api";
import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import SignIn from "./SignIn";
import Container from "./Container";
interface BookingDialogProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    _id: string;
    title: string;
    coverImage: string;
    price: number;
    date: Date;
    time: string;
    location: string;
    eventType: "physical" | "online";
    seats: number;
  } | null;
}

const BookEvent: React.FC<BookingDialogProps> = ({
  isOpen,
  onClose,
  event,
}) => {
  const [ticketCount, setTicketCount] = useState(1);
  const [couponCode, setCouponCode] = useState("");
  const { user } = useAuthStore();
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const navigate = useNavigate();
  if (!event) return null;

  const totalPrice = event.price * ticketCount;

  const incrementTickets = () => {
    if (ticketCount < event.seats) {
      setTicketCount(ticketCount + 1);
    }
  };

  const decrementTickets = () => {
    if (ticketCount > 1) {
      setTicketCount(ticketCount - 1);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponCode(couponCode);
  };

  const handleBooking = async () => {
    if (!user) {
      setIsSignInOpen(true);
      return;
    }
    const bookingData = {
      eventId: event._id,
      numberOfTickets: ticketCount,
      couponCode,
    };
    const res = await paymentApi(event._id, ticketCount, couponCode);
    const data = res.data.data;
    if (data) {
      window.location.href = data.checkoutUrl;
    }

    setTicketCount(1);
    setCouponCode("");
    onClose();
  };
  const isFormValid = ticketCount > 0;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto satoshi-regular p-0 w-xs sm:w-sm md:w-lg">
          <div className="relative h-48 w-full">
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-6 right-6">
              <h2 className="text-2xl font-bold text-white satoshi-bold line-clamp-2">
                {event.title}
              </h2>
            </div>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 pb-6 border-b border-[var(--border)]">
              <div className="flex items-start gap-3">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Date</p>
                  <p className="text-xs md:text-sm font-medium satoshi-medium text-[var(--foreground)]">
                    {format(new Date(event.date), "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 md:w-5 md:h-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">Time</p>
                  <p className="text-xs md:text-sm font-medium satoshi-medium text-[var(--foreground)]">
                    {event.time}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 col-span-2">
                <MapPin className="w-4 h-4 md:w-5 md:h-5 text-[var(--muted-foreground)] mt-0.5" />
                <div>
                  <p className="text-xs text-[var(--muted-foreground)]">
                    Location
                  </p>
                  <p className="text-xs md:text-sm font-medium satoshi-medium text-[var(--foreground)]">
                    {event.location}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-3 pb-6 border-b border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm md:text-md font-semibold text-[var(--foreground)] satoshi-medium">
                    Number of Tickets
                  </h3>
                  <p className="text-xs md:text-sm text-[var(--muted-foreground)]">
                    {event.seats} seats available
                  </p>
                </div>

                <div className="flex items-center gap-2 md:gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-6 w-6 md:h-10 md:w-10 rounded-full cursor-pointer"
                    onClick={decrementTickets}
                    disabled={ticketCount <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>

                  <span className="text-lg md:text-xl font-bold satoshi-bold min-w-[2rem] text-center">
                    {ticketCount}
                  </span>

                  <Button
                    variant="outline"
                    size="icon"
                    onClick={incrementTickets}
                    disabled={ticketCount >= event.seats}
                    className="h-10 w-10 rounded-full cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between pt-2">
                <p className="text-sm text-[var(--muted-foreground)]">
                  Price per ticket
                </p>
                <p className="text-lg font-bold satoshi-bold text-[var(--foreground)]">
                  ${event.price}
                </p>
              </div>
            </div>
            <div className="space-y-3 pb-6 border-b border-[var(--border)]">
              <h3 className="text-sm md:text-md font-semibold text-[var(--foreground)] satoshi-medium">
                Have a Coupon Code?
              </h3>

              <div className="flex flex-wrap gap-2">
                <Input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 border-[var(--border)] satoshi-regular uppercase"
                />
                <Button
                  variant="outline"
                  onClick={handleApplyCoupon}
                  className="satoshi-medium cursor-pointe"
                >
                  Apply
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm md:text-md font-semibold text-[var(--foreground)] satoshi-medium">
                Payment Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--muted-foreground)]">
                    Tickets ({ticketCount}x)
                  </span>
                  <span className="text-[var(--foreground)] satoshi-medium">
                    ${event.price * ticketCount}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-[var(--border)]">
                  <span className="text-sm md:text-md font-semibold text-[var(--foreground)] satoshi-medium">
                    Total
                  </span>
                  <div className="text-right">
                    <span className="text-xl md:text-2xl font-bold satoshi-bold text-[var(--foreground)]">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button
                onClick={onClose}
                className="flex-1 satoshi-medium cursor-pointer text-[var(--popover)] bg-[var(--foreground)] hover:bg-[var(--muted-foreground)] hover:text-[var(--primary-foreground)]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleBooking}
                disabled={!isFormValid}
                className="flex-1 satoshi-medium cursor-pointer"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Confirm Booking
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <GoogleOAuthProvider clientId={clientId}>
        <SignIn isOpen={isSignInOpen} onClose={() => setIsSignInOpen(false)} />
      </GoogleOAuthProvider>
    </>
  );
};

export default BookEvent;
