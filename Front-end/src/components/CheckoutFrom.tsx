import React, { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { becomeHost, verifyHostPayment } from "../api/api";
import { useAuthContext } from "../context/AuthContext";
import { Button } from "./ui/button";
const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await becomeHost();
      console.log(response.data.data);

      // Confirm the payment with Stripe
      const result = await stripe.confirmCardPayment(response.data.data, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.name,
            email: user.email,
          },
        },
      });
      console.log(result);
      console.log(result.paymentIntent.id);
      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        console.log("Payment succeeded!", result.paymentIntent.id);
        
        const response = await verifyHostPayment({ paymentIntentId:result.paymentIntent.id });
        console.log(response);

        if (response) {
          alert("you are now host");
          setLoading(false);
        }
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div
        style={{
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "4px",
        }}
      >
          options={{
            style: {
              base: {
                fontSize: "16px",
                color: "#424770",
                "::placeholder": {
                  color: "#aab7c4",
                },
              },
              invalid: {
                color: "#9e2146",
              },
            },
          }}
        />
      </div>

      {error && <p className="text-red-500">{error}</p>}
      <Button type="submit" disabled={!stripe || loading} className="mt-4">
        {loading ? "Processing..." : "Pay $1 to Verify"}
      </Button>
    </form>
  );
};

export default CheckoutForm;
