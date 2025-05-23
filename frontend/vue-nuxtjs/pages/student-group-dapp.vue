<template>
  <div class="App min-h-screen flex flex-col items-center justify-between">
    <Header />
    <div
      class="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4"
    >
      <Card class="w-full max-w-2xl p-8 shadow-lg">
        <CardHeader>
          <CardTitle class="text-center text-4xl font-bold mt-4">
            📚 Study Group Chat Dapp 📚
          </CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col items-center mt-4 space-y-6">
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
import { ref, onMounted, watch } from "vue";
import Web3 from "web3";
import contractABI from "@/contracts/StudyGroup.sol/StudyGroup.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

interface Message {
  sender: string;
  content: string;
  timestamp: number;
}

const contractAddress = "0x158f83cD37e7774b520ADCb9BD7bc80330378c1B";

const { toast } = useToast();

const web3 = ref<Web3 | null>(null);
const contract = ref<any>(null);
const account = ref("");
const isMember = ref(false);
const messages = ref<Message[]>([]);
const newMessage = ref("");
const mmStatus = ref("Not connected!");
const isConnected = ref(false);
const getNetwork = ref<number | undefined>(undefined);

const switchToOpenCampusNetwork = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xa045c" }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0xa045c",
                chainName: "EDU Chain Testnet",
                nativeCurrency: {
                  name: "EDU",
                  symbol: "EDU",
                  decimals: 18,
                },
                rpcUrls: ["https://rpc.open-campus-codex.gelato.digital"],
                blockExplorerUrls: [
                  "https://edu-chain-testnet.blockscout.com/",
                ],
              },
            ],
          });
        } catch (addError) {
          console.error("Failed to add EDU Chain Testnet network:", addError);
        }
      } else {
        console.error(
          "Failed to switch to EDU Chain Testnet network:",
          switchError
        );
      }
    }
  }
};

const connectWallet = async () => {
  if (typeof window.ethereum !== "undefined") {
    try {
      await switchToOpenCampusNetwork();

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

      if (chainId !== "0xa045c") {
        alert("Please connect to the EDU Chain Testnet network in MetaMask.");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      account.value = accounts[0];
      mmStatus.value = "Connected!";
      isConnected.value = true;

      localStorage.setItem("walletAddress", accounts[0]);

      initWeb3();
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
    }
  } else {
    alert("Please install MetaMask!");
  }
};

const initWeb3 = async () => {
  if (typeof window.ethereum !== "undefined") {
    const web3Instance = new Web3(window.ethereum);
    web3.value = web3Instance;

    try {
      const accounts = await web3Instance.eth.getAccounts();
      account.value = accounts[0];

      const contractInstance = new web3Instance.eth.Contract(
        contractABI.abi,
        contractAddress
      );
      contract.value = contractInstance;

      const memberStatus = await contractInstance.methods
        .getMemberStatus(accounts[0])
        .call();
      isMember.value = Boolean(memberStatus);

      await loadMessages();
    } catch (error) {
      console.error("Failed to initialize web3:", error);
      toast({
        title: "Error",
        description:
          "Failed to initialize web3. Please make sure MetaMask is installed and unlocked.",
        variant: "destructive",
      });
    }
  } else {
    toast({
      title: "MetaMask not detected",
      description: "Please install MetaMask to use this dApp.",
      variant: "destructive",
    });
  }
};

const loadMessages = async () => {
  if (contract.value) {
    const fetchedMessages = await contract.value.methods.getMessages().call();
    messages.value = fetchedMessages;
  }
};

const joinGroup = async () => {
  if (contract.value && account.value) {
    try {
      await contract.value.methods.joinGroup().send({ from: account.value });
      isMember.value = true;
      toast({
        title: "Success",
        description: "You have joined the study group!",
      });
    } catch (error) {
      console.error("Failed to join group:", error);
      toast({
        title: "Error",
        description: "Failed to join the study group. Please try again.",
        variant: "destructive",
      });
    }
  }
};

const sendMessage = async () => {
  if (contract.value && account.value && newMessage.value.trim()) {
    try {
      await contract.value.methods
        .sendMessage(newMessage.value)
        .send({ from: account.value });
      newMessage.value = "";
      await loadMessages();
      toast({
        title: "Success",
        description: "Message sent successfully!",
      });
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  }
};

onMounted(() => {
  const storedAddress = localStorage.getItem("walletAddress");
  if (storedAddress && typeof window.ethereum !== "undefined") {
    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length > 0 && accounts[0] === storedAddress) {
        account.value = storedAddress;
        mmStatus.value = "Connected!";
        isConnected.value = true;
        initWeb3();
      } else {
        localStorage.removeItem("walletAddress");
      }
    });
  }
});

watch(
  () => window.ethereum,
  (newEthereum) => {
    if (newEthereum) {
      newEthereum.on("chainChanged", () => {
        window.location.reload();
      });
      newEthereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          isConnected.value = false;
          account.value = "";
          localStorage.removeItem("walletAddress");
        } else {
          account.value = accounts[0];
          localStorage.setItem("walletAddress", accounts[0]);
          initWeb3();
        }
      });
    }
  },
  { immediate: true }
);
</script>
