import { useOCAuth } from "@opencampus/ocid-connect-js";
import OCButton from "./OCButton";
import { useLocation } from "@remix-run/react";

const LoginButton = () => {
  const { ocAuth } = useOCAuth();
  const location = useLocation();

  const handleLogin = async () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("previousPath", location.pathname);
    }

    await ocAuth.signInWithRedirect({
      state: "opencampus",
    });
  };

  return <OCButton onClick={handleLogin}>Connect OCID</OCButton>;
};

export default LoginButton;
