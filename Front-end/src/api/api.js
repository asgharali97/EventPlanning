import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:4000/",
  withCredentials: true,
});

const checkAuth = async () => {
  return  await api.post("/auth/sync");
}

// const check = ()=>{
//   return api.get('/')
// }

export { api, checkAuth };