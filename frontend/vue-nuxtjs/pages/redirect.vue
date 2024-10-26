<template>
  <div class="App min-h-screen flex flex-col items-center justify-between">
    <Header />
    <div
      class="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4"
    >
      <Card class="w-full max-w-2xl p-8 shadow-lg">
        <CardHeader>
          <CardTitle class="text-center text-4xl font-bold mt-2">
            Processing Login...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div v-if="error" class="text-red-500 text-center">
            <p>Error logging in: {{ error }}</p>
          </div>
          <div v-else class="text-gray-600 text-center">
            <p>Please wait while we complete your login...</p>
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
import { useOCIDAuth } from "~/composables/useOCIDAuth";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const router = useRouter();
const { handleRedirect } = useOCIDAuth();
const error = ref(null);

onMounted(async () => {
  try {
    const state = await handleRedirect();
    if (state.idToken) {
      router.push("/user");
    } else {
      error.value = "Authentication failed";
    }
  } catch (err) {
    console.error("Redirect handling failed:", err);
    error.value = err.message || "Authentication failed";
  }
});
</script>
