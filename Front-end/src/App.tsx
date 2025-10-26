import { Outlet, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import background from "/background.png";
import { useUser } from "@/hooks/useUser";
import Container from "@/components/Container";

function App() {
  useUser();
  const location = useLocation();

  const hideNavbarRoutes = [
    "/host/dashboard",
    "/host/events",
    "/host/coupons",
    "/host/settings",
  ];

  const shouldHideNavbar = hideNavbarRoutes.some((route) =>
    location.pathname.startsWith(route)
  );

  const backgroundRoutes = ["/"];

  const shouldShowBackground =
    location.pathname === "/" ||
    backgroundRoutes.some(
      (route) => route !== "/" && location.pathname.startsWith(route)
    );

  return (
    <>
      <div
        className="w-full min-h-screen"
        style={{
          backgroundImage: shouldShowBackground ? `url('${background}')` : "none",
          backgroundColor: shouldShowBackground
            ? "transparent"
            : "var(--background)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "var(--foreground)",
        }}
      >
        {!shouldHideNavbar && <Navbar />}
        {!shouldHideNavbar ? (
          <Container>
            <Outlet />
          </Container>
        ) : (
          <Outlet />
        )}
      </div>
    </>
  );
}

export default App;