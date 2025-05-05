declare module "@opencampus/ocid-connect-js" {
  export interface OCConnectProps {
    opts: {
      clientId?: string;
      redirectUri: string;
      referralCode?: string;
      storageType?: "localStorage" | "cookie";
      domain?: string;
      sameSite?: boolean;
    };
    sandboxMode?: boolean;
    children: React.ReactNode;
  }

  export interface AuthState {
    accessToken?: string;
    idToken?: string;
    isAuthenticated?: boolean;
    error?: Error;
  }

  export interface OCAuth {
    signInWithRedirect: (options: { state: string }) => Promise<void>;
    handleLoginRedirect: () => Promise<AuthState>;
    getAuthState: () => AuthState;
    getStateParameter: () => string | null;
    logout: (options?: { returnUrl?: string }) => Promise<void>;
  }

  export interface UseOCAuthReturn {
    isInitialized: boolean;
    authState: AuthState;
    ocAuth: OCAuth;
    OCId?: string;
    ethAddress?: string;
  }

  export const OCConnect: React.FC<OCConnectProps>;
  export const LoginCallBack: React.FC<any>;
  export function useOCAuth(): UseOCAuthReturn;
  export const OCAuthSandbox: any;
  export const OCAuthLive: any;
}
