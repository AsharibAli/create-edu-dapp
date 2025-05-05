"use client";

import { LoginCallBack, useOCAuth } from "@opencampus/ocid-connect-js";
import { useRouter } from "next/navigation";


function CustomErrorComponent() {
  const { authState } = useOCAuth();
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="bg-red-100 p-6 rounded-lg shadow-md max-w-md">
        <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Error</h2>
        <p className="text-gray-800">Error logging in: {authState.error?.message}</p>
      </div>
    </div>
  );
}


function CustomLoadingComponent() {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <h1 className="text-xl font-bold mb-4">Authenticating...</h1>
        <p className="text-gray-600">Please wait while we complete your login</p>
      </div>
    </div>
  );
}

export default function RedirectPage() {
  const router = useRouter();

 
  const loginSuccess = () => {
    router.push("/user"); 
  };


  const loginError = (error: Error) => {
    console.error("Login error:", error);
    router.push("/");
  };

  return (
    <LoginCallBack
      errorCallback={loginError}
      successCallback={loginSuccess}
      customErrorComponent={CustomErrorComponent}
      customLoadingComponent={CustomLoadingComponent}
    />
  );
}
