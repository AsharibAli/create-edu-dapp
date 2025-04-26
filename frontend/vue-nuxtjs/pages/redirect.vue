<template>
  <div class="App min-h-screen flex flex-col items-center justify-between">
    <Header />
    <div
      class="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4"
    >
      <Card class="w-full max-w-2xl p-8 shadow-lg">
        <CardHeader>
          <CardTitle class="text-center text-4xl font-bold mt-2">
            Checking Wallet Status...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="error" class="text-red-500 text-center">
            <p>Error: {{ error }}</p>
            <button
              @click="goToHome"
              class="mt-4 bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md"
            >
              Go to Home
            </button>
          </div>
          <div v-else class="text-gray-600 text-center">
            <p>Please wait while we check your wallet connection status...</p>
          </div>
        </CardContent>
      </Card>
    </div>
    <Footer />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const router = useRouter();
const error = ref(null);

function goToHome() {
  router.push("/");
}

onMounted(async () => {
  try {
    const storedAddress = localStorage.getItem("walletAddress");

    if (storedAddress && window.ethereum) {
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });

      if (accounts.length > 0 && accounts[0] === storedAddress) {
        router.push("/user");
      } else {
        localStorage.removeItem("walletAddress");
        router.push("/");
      }
    } else {
      router.push("/");
    }
  } catch (err) {
    console.error("Wallet check failed:", err);
    error.value = err.message || "Failed to check wallet status";
  }
});
</script>
