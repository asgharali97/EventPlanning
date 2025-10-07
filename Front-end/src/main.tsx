import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from "./lib/queryClient";
import HeroSection from "./components/HeroSection";
import Event from "./components/Event";
import BookedEvents from "./components/BookedEvents";
import AllBookedEvents from "./components/AllBookedEvents";
import EventDetail from "./components/EventDetail";
import Host from "./components/Host";
import ProtectedRoute from "./components/ProtuctedRoutes";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <HeroSection />,
      },
      {
        path: "/events",
        element: <Event />,
      },
      {
        path: "/event/:eventId",
        element: <EventDetail />,
      },
      {
        path: "booked-events/:session_id",
        element: (
          <ProtectedRoute>
            <BookedEvents />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-bookings",
        element: (
          <ProtectedRoute>
            <AllBookedEvents />
          </ProtectedRoute>
        ),
      },
      {
        path: "/host",
        element: (
          <ProtectedRoute>
            <Host />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <HeroSection />
      }
    ],
  },
]);

const root = document.getElementById("root") as HTMLElement;
createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>
);