import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

const googleAuth = async (code: string) => {
  return api.post("/auth/sign-in", { code });
};

const getUser = async () => {
  return await api.get("/auth/user", { withCredentials: true });
};
const logout = async () => {
  return await api.post("/auth/logout", { withCredentials: true });
};

const paymentApi = async (eventId: string, numberOfTickets: number, couponCode: string) => {
  return await api.post(
    "/booking",
    { eventId, numberOfTickets, couponCode },
    { withCredentials: true }
  )
};

const succesPay = async (session_id: string) => {
  return await api.get(`booking/success/${session_id}`, {
    withCredentials: true,
  });
};

const getBookedEvents = async () => {
  return await api.get("event-booking/get-booked-events", {
    withCredentials: true,
  });
};

const getAllEvents = async () => {
  return await api.get("/events");
};

const getEventById = async (eventId: string) => {
  return await api.get(`/events/${eventId}`);
};

const becomeHost = async () => {
  return await api.get("/auth/become/host", { withCredentials: true });
};

const verifyHostPayment = async ({ paymentIntentId }: { paymentIntentId: string }) => {
  return await api.post(
    "/auth/verify/host",
    { paymentIntentId },
    { withCredentials: true }
  );
}

const refundHost = async () => {
  return await api.get(
    "/host/refund",
    { withCredentials: true }
  );
}

const hostEvent = async (title,price,seats,category,date,time,description,location,eventType,onlineDetails,tags) => {
  return await api.post(
    "/host/create-event",
    {
      title,
      price,
      seats,
      category,
      date,
      time,
      description,
      location,
      eventType,
      onlineDetails,
      tags,
    },
    { withCredentials: true }
  );
}

export {
  api,
  googleAuth,
  getAllEvents,
  paymentApi,
  succesPay,
  getUser,
  logout,
  getBookedEvents,
  getEventById,
  becomeHost,
  verifyHostPayment,
  refundHost,
  hostEvent
};
