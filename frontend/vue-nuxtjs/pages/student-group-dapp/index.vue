<template>
  <div class="App min-h-screen flex flex-col items-center justify-between">
    <Header />
    <div class="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4">
      <Card class="w-full max-w-2xl p-8 shadow-lg">
        <CardHeader>
          <CardTitle class="text-center text-4xl font-bold mt-4">
            📚 Study Group Chat Dapp 📚
          </CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col items-center mt-4 space-y-6">
          <LoginButton v-if="!ocidUsername" />
          <div v-if="ocidUsername" class="text-center text-xl">
            <h1>
              👉Welcome, 
              <NuxtLink to="/user">
                <strong>{{ ocidUsername }}</strong>
              </NuxtLink>👈
            </h1>
          </div>
          <div v-if="isConnected" class="text-center text-xl">
            <h1>
              Connected to wallet address: <strong>{{ account }}</strong>
            </h1>
          </div>
          <Button
            v-else
            class="bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md mb-4"
            @click="connectWallet"
          >
            Connect with MetaMask
          </Button>
          <Button
            v-if="!isMember && isConnected"
            @click="joinGroup"
            class="bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md mb-4"
          >
            Join Study Group
          </Button>
          <template v-if="isMember">
            <div class="flex flex-col items-center">
              <Input
                v-model="newMessage"
                type="text"
                placeholder="Type your message..."
                class="w-80 bg-white rounded border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:bg-white focus:border-indigo-500 text-base outline-none text-gray-700 px-3 leading-8 transition-colors duration-200 ease-in-out mb-4"
              />
              <div class="flex space-x-4">
                <Button
                  @click="sendMessage"
                  class="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded"
                >
                  Send Message
                </Button>
              </div>
            </div>
            <div class="space-y-4 mt-6 w-full">
              <div
                v-for="(msg, index) in messages"
                :key="index"
                class="bg-gray-100 p-4 rounded shadow-sm"
              >
                <p class="font-semibold">{{ msg.sender }}</p>
                <p>{{ msg.content }}</p>
                <p class="text-xs text-gray-500 mt-2">
                  {{ new Date(Number(msg.timestamp) * 1000).toLocaleString() }}
                </p>
              </div>
            </div>
          </template>
        </CardContent>
      </Card>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useOCAuth } from "@opencampus/ocid-connect-js"
import { jwtDecode } from "jwt-decode"
import Web3 from 'web3'
import contractABI from '@/contracts/StudyGroup.sol/StudyGroup.json'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/toast"
import Header from "@/components/Header.vue"
import Footer from "@/components/Footer.vue"
import LoginButton from "@/components/LoginButton.vue"

interface Message {
  sender: string;
  content: string;
  timestamp: number;
}

interface DecodedToken {
  edu_username: string;
  [key: string]: any;
}

const contractAddress = '0x158f83cD37e7774b520ADCb9BD7bc80330378c1B'

const { authState } = useOCAuth()
const { toast } = useToast()

const web3 = ref<Web3 | null>(null)
const contract = ref<any>(null)
const account = ref('')
const isMember = ref(false)
const messages = ref<Message[]>([])
const newMessage = ref('')
const ocidUsername = ref<string | null>(null)
const mmStatus = ref("Not connected!")
const isConnected = ref(false)
const getNetwork = ref<number | undefined>(undefined)

const switchToOpenCampusNetwork = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xa045c" }],
      })
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xa045c",
                chainName: "Open Campus Codex",
                nativeCurrency: {
                  name: "EDU",
                  symbol: "EDU",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.open-campus-codex.gelato.digital"],
                blockExplorerUrls: ["https://opencampus-codex.blockscout.com/"],
              },
            ],
          })
        } catch (addError) {
          console.error("Failed to add Open Campus Codex network:", addError)
        }
      } else {
        console.error("Failed to switch to Open Campus Codex network:", switchError)
      }
    }
  }
}

const connectWallet = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await switchToOpenCampusNetwork()

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      })
      
      if (chainId !== "0xa045c") {
        alert("Please connect to the Open Campus Codex network in MetaMask.")
        return
      }

      await window.ethereum.request({ method: "eth_requestAccounts" })
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      })
      account.value = accounts[0]
      mmStatus.value = "Connected!"
      isConnected.value = true
    } catch (error) {
      console.error("Failed to connect to wallet:", error)
    }
  } else {
    alert("Please install MetaMask!")
  }
}

const initWeb3 = async () => {
  if (typeof window.ethereum !== 'undefined') {
    const web3Instance = new Web3(window.ethereum)
    web3.value = web3Instance

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' })
      const accounts = await web3Instance.eth.getAccounts()
      account.value = accounts[0]

      const contractInstance = new web3Instance.eth.Contract(contractABI.abi, contractAddress)
      contract.value = contractInstance

      const memberStatus = await contractInstance.methods.getMemberStatus(accounts[0]).call()
      isMember.value = Boolean(memberStatus)

      await loadMessages()
    } catch (error) {
      console.error('Failed to connect to wallet:', error)
      toast({
        title: 'Error',
        description: 'Failed to connect to wallet. Please make sure MetaMask is installed and unlocked.',
        variant: 'destructive',
      })
    }
  } else {
    toast({
      title: 'MetaMask not detected',
      description: 'Please install MetaMask to use this dApp.',
      variant: 'destructive',
    })
  }
}

const loadMessages = async () => {
  if (contract.value) {
    const fetchedMessages = await contract.value.methods.getMessages().call()
    messages.value = fetchedMessages
  }
}

const joinGroup = async () => {
  if (contract.value && account.value) {
    try {
      await contract.value.methods.joinGroup().send({ from: account.value })
      isMember.value = true
      toast({
        title: 'Success',
        description: 'You have joined the study group!',
      })
    } catch (error) {
      console.error('Failed to join group:', error)
      toast({
        title: 'Error',
        description: 'Failed to join the study group. Please try again.',
        variant: 'destructive',
      })
    }
  }
}

const sendMessage = async () => {
  if (contract.value && account.value && newMessage.value.trim()) {
    try {
      await contract.value.methods.sendMessage(newMessage.value).send({ from: account.value })
      newMessage.value = ''
      await loadMessages()
      toast({
        title: 'Success',
        description: 'Message sent successfully!',
      })
    } catch (error) {
      console.error('Failed to send message:', error)
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      })
    }
  }
}

onMounted(() => {
  if (authState.value.idToken) {
    const decodedToken = jwtDecode<DecodedToken>(authState.value.idToken)
    ocidUsername.value = decodedToken.edu_username
  }
  initWeb3()
})

watch(() => window.ethereum, (newEthereum) => {
  if (newEthereum) {
    newEthereum.on("chainChanged", () => {
      window.location.reload()
    })
    newEthereum.on("accountsChanged", (accounts: string[]) => {
      if (accounts.length === 0) {
        isConnected.value = false
        account.value = ''
      } else {
        account.value = accounts[0]
        initWeb3()
      }
    })
  }
}, { immediate: true })
</script>
