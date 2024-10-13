<template>
  <div class="App min-h-screen flex flex-col items-center justify-between">
    <Header />
    <div class="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4">
      <Card class="w-full max-w-2xl p-8 shadow-lg">
        <CardHeader>
          <CardTitle class="text-center text-4xl font-bold mt-2">
            Welcome to Open Campus ID
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p class="mb-6 text-gray-600 text-center">
            Connect with Open Campus ID to get started.
          </p>
        </CardContent>
        <CardFooter class="flex justify-center">
          <LoginButton v-if="!isAuthenticated" />
          <Button
            v-else
            @click="goToUserPage"
            class="bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md"
          >
            Go to User Page
          </Button>
        </CardFooter>
      </Card>
    </div>
    <Footer />
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOCAuth } from "@opencampus/ocid-connect-js"
import Header from '@/components/Header.vue'
import Footer from '@/components/Footer.vue'
import LoginButton from '@/components/LoginButton.vue'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default defineComponent({
  name: 'HomePage',
  components: {
    Header,
    Footer,
    LoginButton,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Button
  },
  setup() {
    const router = useRouter()
    const { authState } = useOCAuth()

    const isAuthenticated = computed(() => !!authState.value.idToken)

    const goToUserPage = () => {
      router.push('/user')
    }

    return {
      isAuthenticated,
      goToUserPage
    }
  }
})
</script>
