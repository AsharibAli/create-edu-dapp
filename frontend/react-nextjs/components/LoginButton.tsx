"use client";
import { useOCAuth } from "@opencampus/ocid-connect-js";
import OCButton from "./OCButton";
import { usePathname } from "next/navigation";

const LoginButton = () => {
  const { ocAuth } = useOCAuth();
  const pathname = usePathname();

  const handleLogin = async () => {
    try {
      localStorage.setItem("previousPath", pathname);

      await ocAuth.signInWithRedirect({
        state: "opencampus",
      });
    } catch (error) {
      console.error("Error initiating login:", error);
    }
  };

  return <OCButton onClick={handleLogin}>Connect OCID</OCButton>;
};

export default LoginButton;
