import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";
import { useOCAuth } from "@opencampus/ocid-connect-js";
import ClientOnly from "~/components/ClientOnly";

export default function RedirectPage() {
  const navigate = useNavigate();
  const { ocAuth } = useOCAuth();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        await ocAuth.handleLoginRedirect();

        navigate("/user");

        if (typeof window !== "undefined") {
          localStorage.setItem("previousPath", window.location.pathname || "/");
        }
      } catch (error) {
        console.error("Authentication error:", error);
        navigate("/");
      }
    };

    handleAuth();
  }, [ocAuth, navigate]);

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
