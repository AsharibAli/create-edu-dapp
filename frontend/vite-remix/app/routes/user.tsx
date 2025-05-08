import { useOCAuth } from "@opencampus/ocid-connect-js";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "@remix-run/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import LoginButton from "~/components/LoginButton";
import Header from "~/components/Header";
import Footer from "~/components/Footer";
import { useEffect, useState } from "react";
import ClientOnly from "~/components/ClientOnly";

interface DecodedToken {
  user_id: number;
  eth_address: string;
  edu_username: string;
  iss: string;
  iat: number;
  exp: number;
  aud: string;
  [key: string]: any;
}

export default function UserPage() {
  const navigate = useNavigate();

  return (
    <div className="App min-h-screen flex flex-col items-center justify-between">
      <Header />
      <div className="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4">
        <Card className="w-full max-w-2xl p-8 shadow-lg">
          <ClientOnly
            fallback={
              <CardHeader>
                <p>Loading...</p>
              </CardHeader>
            }
          >
            <UserContent navigate={navigate} />
          </ClientOnly>
        </Card>
      </div>
      <Footer />
    </div>
  );
}

function UserContent({ navigate }: { navigate: (path: string) => void }) {
  const { authState } = useOCAuth();
  const [userInfo, setUserInfo] = useState<DecodedToken | null>(null);

  useEffect(() => {
    if (authState.idToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(authState.idToken);
        setUserInfo(decoded);
      } catch (error) {
        console.error("Failed to decode token:", error);
      }
    }
  }, [authState.idToken]);

  if (authState.error) {
    return (
      <>
        <CardHeader>
          <div className="bg-red-100 p-4 rounded-md">
            <p className="text-red-600">Error: {authState.error.message}</p>
          </div>
        </CardHeader>
        <CardFooter className="flex justify-center">
          <Button
            onClick={() => navigate("/")}
            className="bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md"
          >
            Go to Home
          </Button>
        </CardFooter>
      </>
    );
  }

  return (
    <>
      <CardHeader>
        {userInfo ? (
          <>
            <CardTitle className="text-center text-4xl font-bold mt-2">
              Welcome to Open Campus ID
            </CardTitle>
            <p className="mb-6 text-gray-600 text-center font-bold text-xl">
              Here are your OCID details:
            </p>
          </>
        ) : (
          <div className="text-center">
            <CardTitle className="text-2xl font-bold mb-4">
              Connect with OCID
            </CardTitle>
            <p className="mb-6 text-gray-600">
              Please link with open campus to view your details.
            </p>
            <LoginButton />
          </div>
        )}
      </CardHeader>

      {userInfo && (
        <CardContent>
          <div className="text-gray-800">
            <p>
              <strong>User ID:</strong> {userInfo.user_id}
            </p>
            <p>
              <strong>(OCID) Username:</strong> {userInfo.edu_username}
            </p>
            <p>
              <strong>(OCID) Wallet Address:</strong> {userInfo.eth_address}
            </p>
            <p>
              <strong>Issuer:</strong> {userInfo.iss}
            </p>
            <p>
              <strong>Issued At:</strong>{" "}
              {new Date(userInfo.iat * 1000).toLocaleString()}
            </p>
            <p>
              <strong>Expiration:</strong>{" "}
              {new Date(userInfo.exp * 1000).toLocaleString()}
            </p>
            <p>
              <strong>Audience:</strong> {userInfo.aud}
            </p>
          </div>
        </CardContent>
      )}

      <CardFooter className="flex justify-center">
        <Button
          onClick={() => navigate("/")}
          className="bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md"
        >
          Go to Home
        </Button>
      </CardFooter>
    </>
  );
}
