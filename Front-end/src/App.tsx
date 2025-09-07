import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthContextProvider } from "./context/AuthContext";
function App() {
  
  return (
    // color pelette
    // bg-[#030712]
    // mian color #6d28d9
    // normal text color #808793
    <>
      <div className="w-full bg-[#030712] text-white">
        <AuthContextProvider>
        <Navbar />
        <Outlet />
        </AuthContextProvider>
      </div>
    </>
  );
}

export default App;
