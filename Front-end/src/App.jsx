import { useNavigate } from "react-router-dom"

function App() {
   const navigate =  useNavigate()
  return (
    <>
      <h1 className="text-orange-600 text-3xl bg-zinc-900 h-screen w-full">This is EventSphere</h1>
      <button onClick={() => navigate('/login')}>
        Login
      </button>
    </>
  )
}

export default App
