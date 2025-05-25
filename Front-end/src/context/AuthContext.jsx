import react,{createContext,useContext,useState,useEffect} from "react";
import {getUser} from "../api/api";

const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
    const [user,setUser] = useState(null);
    
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