import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { ShieldCheck, CreditCard, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { becomeHost, verifyHostPayment } from '../api/api';
import { useAuthStore } from '@/store/authStore';
import { Button } from "@/components/ui/button";

const HostVerifyDialog = ({ isOpen, onClose }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await becomeHost();
      const clientSecret = response.data.data;

      if (!clientSecret) {
        throw new Error("Failed to initialize payment. Please try again.");
      }
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.name,
            email: user.email,
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
        setLoading(false);
      } else if (result.paymentIntent.status === "succeeded") {
        const verifyResponse = await verifyHostPayment({ 
          paymentIntentId: result.paymentIntent.id 
        });

        if (verifyResponse.data) {
          setSuccess(true);
          setTimeout(() => {
            onClose();
            window.location.reload();
          }, 2000);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || "An unexpected error occurred. Please try again.");
      console.error("Payment error:", err);
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md border border-[var(--border)] shadow-[0_8px_30px_rgb(0,0,0,0.12)] satoshi-mdedium">
        <DialogHeader>
          <div className="flex items-center gap-5 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-[0.3rem] bg-[var(--sidebar)] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06),0px_1px_1px_-0.5px_rgba(0,0,0,0.06),0px_3px_3px_-1.5px_rgba(0,0,0,0.06),_0px_6px_6px_-3px_rgba(0,0,0,0.06),0px_12px_12px_-6px_rgba(0,0,0,0.06),0px_24px_24px_-12px_rgba(0,0,0,0.06)]">
              <ShieldCheck className="h-5 w-5 text-[var(--foreground)]" />
            </div>
            <div>
              <DialogTitle className="text-xl satoshi-bold">Verify Your Host Profile</DialogTitle>
              <DialogDescription className="text-sm mt-0.5">
                One-time verification fee
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-5 mt-4">
          <Alert className="border-[var(--foreground)]">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="text-[var(--foreground)] text-sm font-medium statoshi-regular">
              Refundable Verification
            </AlertTitle>
            <AlertDescription className="text-[var(--secondary)] text-xs leading-relaxed satoshi-regular">
              This $1 verification fee will be fully refunded after your first successful event with a positive review.
            </AlertDescription>
          </Alert>
          <div className="space-y-4 mt-12">
            <label className="flex items-center gap-2 text-sm font-medium text-[var(--foreground)]">
              <CreditCard className="h-4 w-4" />
              Payment Details
            </label>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 shadow-sm transition-all focus-within:border-[var(--foreground)] focus-within:shadow-md">
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: "16px",
                      color: "var(--foreground)",
                      backgroundColor:"var(--input)",
                      "::placeholder": {
                        color: "#9ca3af",
                      },
                      iconColor: "var(--foreground)",
                    },

                    invalid: {
                      color: "#ef4444",
                      iconColor: "#ef4444",
                    },
                  },
                }}
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2 duration-300">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle className="text-sm font-medium">Payment Failed</AlertTitle>
              <AlertDescription className="text-xs">{error}</AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="border-[var(--foreground)] animate-in fade-in slide-in-from-top-2 duration-300">
              <CheckCircle2 className="h-5 w-5" />
              <AlertTitle className="text-[var(--foreground)] text-sm font-medium">
                Verification Successful!
              </AlertTitle>
              <AlertDescription className="text-[var(--secondary)] text-xs">
                You are now a verified host. Redirecting...
              </AlertDescription>
            </Alert>
          )}
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 satoshi-medium cursor-pointer text-[var(--foreground)] bg-[var(--card)] hover:bg-[var(--card)] hover:text-[var(--foreground)] shadow-[0_2px_8px_rgb(0,0,0,0.2)] border border-[var(--border)]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={!stripe || loading || success || user?.role === "host"}
              className="flex-1 satoshi-medium cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : success ? (
                "Verified ✓"
              ) : (
                "Pay $1 to Verify"
              )}
            </Button>
          </div>

          <p className="text-xs text-center text-[var(--foreground)]/70 pt-2">
            Secured by Stripe • Your payment information is encrypted
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HostVerifyDialog;