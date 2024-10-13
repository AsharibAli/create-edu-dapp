<template>
  <OCConnect :opts="opts" :sandboxMode="true">
    <slot></slot>
  </OCConnect>
</template>

<script>
import { defineComponent } from 'vue'
import { OCConnect } from "@opencampus/ocid-connect-js"

export default defineComponent({
  name: 'OCIDProvider',
  components: {
    OCConnect
  },
  setup() {
    const opts = {
      redirectUri: "http://localhost:3000/redirect",
      referralCode: "ASHARIB",
    }

    return {
      opts
    }
  }
})
</script>
