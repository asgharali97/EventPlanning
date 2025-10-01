import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthContextProvider } from "./context/AuthContext";
import background from '/background.png'

function App() {
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  return (
    <>
      <div className="w-full min-h-screen"
      style={{
        backgroundImage: isHomePage ? `url('${background}')` : "none",
        backgroundColor: isHomePage ? "transparent" : "var(--background)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        color: "var(--foreground)",
      }}
      >
        <AuthContextProvider>
        <Navbar />
        <Outlet />
        </AuthContextProvider>
      </div>
    </>
  );
}

export default App;
