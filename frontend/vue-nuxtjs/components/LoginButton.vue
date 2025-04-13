<template>
  <OCButton @click="handleLogin">Connect OCID</OCButton>
</template>

<script>
import { useOCAuth } from "@/composables/useOCAuth";
import OCButton from "./OCButton.vue";

export default {
  name: 'LoginButton',
  components: {
    OCButton
  },
  setup() {
    const { ocAuth } = useOCAuth();

    const handleLogin = async () => {
      await ocAuth.signInWithRedirect({
        state: "opencampus",
      });
    };

    return {
      handleLogin
    };
  }
}
</script>
