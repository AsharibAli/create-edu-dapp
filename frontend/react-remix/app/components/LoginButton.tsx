import { useOCAuth } from "@opencampus/ocid-connect-js";
import OCButton from "./OCButton";
import { useEffect } from "react";
import { useNavigate } from "@remix-run/react";

const LoginButton = () => {
  const { ocAuth } = useOCAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    await ocAuth.signInWithRedirect({
      state: "opencampus",
    });
  };

  return <OCButton onClick={handleLogin}>Connect OCID</OCButton>;
};

export default LoginButton;
