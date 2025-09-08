import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
  withCredentials: true,
});

const googleAuth = async (code:string) => {
  return api.post("/auth/sign-in", { code });
};

const getUser = async () => {
  return await api.get("/auth/user", { withCredentials: true });
};
const logout = async () => {
  return await api.post("/auth/logout", { withCredentials: true });
};

const paymentApi = async (eventId:string, numberOfTickets:number) => {
  return await api.post(
    "event-booking",
    { eventId, numberOfTickets },
    { withCredentials: true }
  );
};

const succesPay = async (session_id:string) => {
  return await api.get(`event-booking/success/${session_id}`, {
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

const getEventById = async (eventId:string) =>{
   return await api.get(`/events/${eventId}`);
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
};
