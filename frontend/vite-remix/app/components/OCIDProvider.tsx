import { FC, ReactNode } from "react";
import { OCConnect } from "@opencampus/ocid-connect-js";

interface OCIDProviderProps {
  children: ReactNode;
}

const opts = {
  clientId: "<Does_Not_Matter_For_Sandbox_mode>", 
  redirectUri: "http://localhost:5173/redirect",
  referralCode: "REFERRAL123",

  // Optional parameters that can be added:
  // storageType: "localStorage", // or "cookie"
  // domain: undefined, // Only for cookie storage
  // sameSite: undefined, // Only for cookie storage
};

const OCIDProvider: FC<OCIDProviderProps> = ({ children }) => (
  <OCConnect opts={opts} sandboxMode={true}>
    {children}
  </OCConnect>
);

export default OCIDProvider;
