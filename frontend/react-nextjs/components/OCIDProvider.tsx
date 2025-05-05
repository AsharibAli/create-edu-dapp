"use client";

import { FC, ReactNode } from "react";
import { OCConnect } from "@opencampus/ocid-connect-js";

interface OCIDProviderProps {
  children: ReactNode;
}

const opts = {
  clientId: "<Does_Not_Matter_For_Sandbox_mode>",
  redirectUri: "http://localhost:3000/redirect",
  referralCode: "PARTNER6",

};

const OCIDProvider: FC<OCIDProviderProps> = ({ children }) => (
  <OCConnect opts={opts} sandboxMode={true}>
    {children}
  </OCConnect>
);

export default OCIDProvider;
