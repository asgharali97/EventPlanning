import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import SignIn from './components/SignIn.jsx'
import HeroSection from './components/HeroSection.jsx'
import Login from './components/Login'


const router = createBrowserRouter([
   {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/signin",
        element: <SignIn />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/hero",
        element: <HeroSection />,
      }
  ]
  }
])
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
