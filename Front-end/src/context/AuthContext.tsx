import react,{createContext,useContext,useState,useEffect} from "react";
import {getUser} from "../api/api";

interface User {
    id: string,
    name: string,
    email: string,
    avatar: string,
}
const AuthContext = createContext<{user: User | null, setUser: React.Dispatch<React.SetStateAction<User | null>>} | null>(null);
export const AuthContextProvider = ({children}: {children: React.ReactNode}) => {
    const [user,setUser] = useState<User | null>(null);
    
    useEffect(() => {
    getUser()
      .then((res) => setUser(res.data.data))
      .catch(() => setUser(null));
  }, []);
    return(
        <AuthContext.Provider  value={{user,setUser}}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => useContext(AuthContext);