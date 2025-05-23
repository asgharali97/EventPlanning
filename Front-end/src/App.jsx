import { Outlet } from "react-router-dom"
function App() {
  return (
    // color pelette
    // bg-[#030712] 
    // mian color #6d28d9
    // normal text color #808793
    <>
      <div className="w-full bg-[#030712] text-white">
         <Outlet/>
      </div>
    </>
  )
}

export default App
