import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000",
});

// const checkAuth = async (token) => {
//   return  await api.post("/auth/sync", {},
//    {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       }
//    })
// }



const paymentApi = async (eventId, numberOfTickets) => {
   return await api.post("event-booking", {eventId, numberOfTickets},{withCredentials: true});
}



const succesPay = async (session_id) => {
   return await api.get(`event-booking/success/${session_id}`,{withCredentials: true});
}

const getAllEvents = async () => {
   return await api.get('/events')
}

export { api, getAllEvents, paymentApi,succesPay};