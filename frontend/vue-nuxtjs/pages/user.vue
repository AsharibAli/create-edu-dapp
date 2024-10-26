<template>
  <div class="App min-h-screen flex flex-col items-center justify-between">
    <Header />
    <div
      class="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4"
    >
      <Card class="w-full max-w-2xl p-8 shadow-lg">
        <CardHeader>
          <template v-if="userInfo">
            <CardTitle class="text-center text-4xl font-bold mt-2">
              Welcome to Open Campus ID
            </CardTitle>
            <p class="mb-6 text-gray-600 text-center font-bold text-xl">
              Here are your OCID details:
            </p>
          </template>
          <template v-else>
            <div class="text-center">
              <CardTitle class="text-2xl font-bold mb-4">
                Connect with OCID
              </CardTitle>
              <p class="mb-6 text-gray-600">
                Please link with open campus to view your details.
              </p>
              <LoginButton />
            </div>
          </template>
        </CardHeader>
        <CardContent v-if="userInfo">
          <div>
            <p><strong>User ID:</strong> {{ userInfo.user_id }}</p>
            <p><strong>Ethereum Address:</strong> {{ userInfo.eth_address }}</p>
            <p><strong>Username:</strong> {{ userInfo.edu_username }}</p>
            <p><strong>Issuer:</strong> {{ userInfo.iss }}</p>
            <p>
              <strong>Issued At:</strong>
              {{ new Date(userInfo.iat * 1000).toLocaleString() }}
            </p>
            <p>
              <strong>Expiration:</strong>
              {{ new Date(userInfo.exp * 1000).toLocaleString() }}
            </p>
            <p><strong>Audience:</strong> {{ userInfo.aud }}</p>
          </div>
        </CardContent>
        <CardFooter class="flex justify-center">
          <Button
            @click="goToHome"
            class="bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md"
          >
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
    <Footer />
  </div>
</template>

<script>
import { defineComponent, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useOCAuth } from "@opencampus/ocid-connect-js";
import { jwtDecode } from "jwt-decode";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import LoginButton from "@/components/LoginButton.vue";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default defineComponent({
  name: "UserPage",
  components: {
    Header,
    Footer,
    LoginButton,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Button,
  },
  setup() {
    const router = useRouter();
    const { authState } = useOCAuth();

    const error = computed(() => authState.value.error);
    const userInfo = computed(() => {
      if (authState.value.idToken) {
        return jwtDecode(authState.value.idToken);
      }
      return null;
    });

    const goToHome = () => {
      router.push("/");
    };

    return {
      error,
      userInfo,
      goToHome,
    };
  },
});
</script>
