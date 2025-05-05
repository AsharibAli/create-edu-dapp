import { useNavigate } from "@remix-run/react";
import { LoginCallBack, useOCAuth } from "@opencampus/ocid-connect-js";
import ClientOnly from "~/components/ClientOnly";

function CustomErrorComponent() {
  const { authState } = useOCAuth();
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center border-l-4 border-red-500">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          Authentication Error
        </h1>
        <p className="text-gray-600">
          {authState.error?.message ||
            "An error occurred during authentication."}
        </p>
      </div>
    </div>
  );
}

function CustomLoadingComponent() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <h1 className="text-2xl font-bold mb-4">Processing Login...</h1>
        <p className="text-gray-600">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
}

export default function RedirectPage() {
  const navigate = useNavigate();

  const loginSuccess = () => {
 
    if (typeof window !== "undefined") {
      localStorage.setItem("previousPath", window.location.pathname || "/");
    }


    navigate("/user");
  };

  const loginError = (error: unknown) => {
    console.error("Authentication error:", error);
    navigate("/");
  };

  return (
    <ClientOnly>
      <LoginCallBack
        errorCallback={loginError}
        successCallback={loginSuccess}
        customErrorComponent={CustomErrorComponent}
        customLoadingComponent={CustomLoadingComponent}
      />
    </ClientOnly>
  );
}
