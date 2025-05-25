import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignIn from "./components/SignIn";
import HeroSection from "./components/HeroSection";
import Login from "./components/Login";
import Event from "./components/Event";
import BookedEvents from "./components/BookedEvents";
import BookEvent from "./components/BookEvent";
import CreateEvent from "./components/CreateEvent";
import { ClerkProvider } from "@clerk/clerk-react";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/signIn",
        element: <SignIn />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/",
        element: <HeroSection />,
      },
      {
        path: "/events",
        element: <Event/>
      },
      {
        path:"booked-events/:session_id",
        element: <BookedEvents/>
      },
      {
        path:"create-event",
        element: <CreateEvent/>
      },
      {
        path: "book-event",
        element: <BookEvent />,
      }
    ],
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <RouterProvider router={router} />
    </ClerkProvider>
  </StrictMode>
);
