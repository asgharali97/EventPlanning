import React from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api/api";
import { useNavigate } from "react-router-dom";
import { useAuthContext } from "../context/AuthContext";
const SignIn = () => {
  const navigate = useNavigate();
  const {setUser} = useAuthContext();
   const handleSuccess = async (tokenResponse) => {
    console.log("req come");
    try {
      console.log("Google login success:", tokenResponse);
      const { data } = await googleAuth(tokenResponse.code);
      if(data.data.user){
          setUser(data.data.user)
         navigate('/')
      }
    } catch (error) {
      console.error("got error while logging with google", error);
    }
  };

  const handleError = (err) => {
    console.error("Google login error:", err);
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleSuccess,
    onError: handleError,
    flow: "auth-code",
  });
  return (
    <>
      <div className="w-full h-screen bg-[#030712]">
        <div className="w-full flex justify-between">
          <div className="w-1/2 h-screen bg-[#1f2937] border-r-[.05px] border-[#808793] text-white relative py-2 px-4 md:py-4 md:px-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold ">
              EventSphere
            </h2>
            <div className="absolute bottom-0">
              <p className="py-4 my-4 text-[#808793] text-sm md:text-lg">
                Book your Favourite Events with EventSphere Easily and Safely
              </p>
            </div>
          </div>
          <div className="w-1/2 h-screen flex justify-center items-center">
            <div className="w-full h-full flex justify-center items-center flex-col">
              <h4 className="text-xl sm:text-2xl md:text-3xl font-bold text-center my-4">
                Sign In with Google
              </h4>
              <div className="flex flex-col justify-center my-4">
              
                <Button
                  className="w-36 bg-transparent text-white rounded-sm hover:bg-[#1f2937] border-[.02px] border-[#7e8aa181] cursor-pointer my-6"
                  onClick={() => googleLogin()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  <span className="mx-3">Google</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignIn;
