import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignIn from "./components/SignIn";
import HeroSection from "./components/HeroSection";
import Event from "./components/Event";
import BookedEvents from "./components/BookedEvents";
import AllBookedEvents from "./components/AllBookedEvents";
import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/signin",
        element: (
          <GoogleOAuthProvider clientId={clientId}>
            <SignIn />
          </GoogleOAuthProvider>
        ),
      },
      {
        path: "/",
        element: <HeroSection />,
      },
      {
        path: "/events",
        element: <Event />,
      },
      {
        path: "booked-events/:session_id",
        element: <BookedEvents />,
      },
      {
        path:"Allbooked-events",
        element:<AllBookedEvents/>
      },
      {
        path: "*",
        element: <HeroSection/>
      }
    ],
  },
]);
const root = document.getElementById("root") as HTMLElement;
createRoot(root).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
