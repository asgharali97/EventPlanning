import React from "react";

const Login = () => {
    const login = () => {
        console.log("Login function called");
        // Add your login logic here
    }
    console.log("Login component rendered");
    login();
  return <>
    <div className="w-full py-4 px-6">
        <h1 className="text-2xl font-bold">Login</h1>
    </div>
    </>;
};

export default Login;