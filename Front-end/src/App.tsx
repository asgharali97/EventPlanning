import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import background from "/background.png";
import { useUser } from "@/hooks/useUser";
import  Container  from "@/components/Container";
function App() {
  useUser();
  const location = useLocation();

  const isHomePage = location.pathname === "/";
  return (
    <>
      <div
        className="w-full min-h-screen"
        style={{
          backgroundImage: isHomePage ? `url('${background}')` : "none",
          backgroundColor: isHomePage ? "transparent" : "var(--background)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "var(--foreground)",
        }}
      >
        <Navbar />
        <Container>
          <Outlet />
        </Container>
      </div>
    </>
  );
}

export default App;
