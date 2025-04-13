<template>
  <div class="App min-h-screen flex flex-col items-center justify-between">
    <Header />
    <div
      class="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4"
    >
      <Card class="w-full max-w-2xl p-8 shadow-lg">
        <CardHeader>
          <CardTitle class="text-center text-4xl font-bold mt-4">
            📚 Simple Greetings Dapp 📚
          </CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col items-center mt-4 space-y-6">
          <LoginButton v-if="!ocidUsername" />
          <div v-if="ocidUsername" class="text-center text-xl">
            <h1>
              👉Welcome,
              <NuxtLink to="/user">
                <strong>{{ ocidUsername }}</strong> </NuxtLink
              >👈
            </h1>
          </div>
          <div v-if="isConnected" class="text-center text-xl">
            <h1>
              Connected to wallet address: <strong>{{ accountAddress }}</strong>
            </h1>
          </div>
          <Button
            v-if="!isConnected"
            class="bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md mb-4"
            @click="connectWallet"
            variant="link"
          >
            Connect with MetaMask
          </Button>
          <div class="flex flex-col items-center">
            <Input
              v-model="message"
              type="text"
              placeholder="Enter a message to put onchain"
              class="w-80 bg-white rounded border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:bg-white focus:border-indigo-500 text-base outline-none text-gray-700 px-3 leading-8 transition-colors duration-200 ease-in-out mb-4"
            />
            <div class="flex space-x-4">
              <Button
                class="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded"
                @click="isConnected ? send : undefined"
              >
                Send
              </Button>
              <Button
                class="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded"
                @click="isConnected ? receive : undefined"
              >
                Receive
              </Button>
            </div>
            <div v-if="showMessage">
              <p class="text-center text-sm mt-6">loading...</p>
              <p class="mt-4 text-xs">
                Txn hash:
                <a
                  class="text-teal-300"
                  :href="
                    'https://edu-chain-testnet.blockscout.com/tx/' + txnHash
                  "
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {{ txnHash }}
                </a>
              </p>
              <p class="mt-2 text-xs">
                Please wait till the Txn is completed :)
              </p>
            </div>
          </div>
          <div class="text-center text-3xl mt-4">
            <b>{{ displayMessage }}</b>
          </div>
        </CardContent>
      </Card>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useOCAuth } from "@/composables/useOCAuth";
import { jwtDecode } from "jwt-decode";
import Web3 from "web3";
import contractJson from "@/contracts/Greeter.sol/Greeter.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import LoginButton from "@/components/LoginButton.vue";

interface DecodedToken {
  edu_username: string;
  [key: string]: any;
}

const contractAddress = "0x48D2d71e26931a68A496F66d83Ca2f209eA9956E";

const { authState } = useOCAuth();
const mmStatus = ref("Not connected!");
const isConnected = ref(false);
const accountAddress = ref<string | undefined>(undefined);
const displayMessage = ref("");
const web3 = ref<Web3 | undefined>(undefined);
const contract = ref<any>(undefined);
const loading = ref(false);
const txnHash = ref<string | null>(null);
const showMessage = ref(false);
const ocidUsername = ref<string | null>(null);
const message = ref("");

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
                chainName: "Open Campus Codex",
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
          console.error("Failed to add Open Campus Codex network:", addError);
        }
      } else {
        console.error(
          "Failed to switch to Open Campus Codex network:",
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
      const chainId = await window.ethereum.request({ method: "eth_chainId" });

      if (chainId !== "0xa045c") {
        alert("Please connect to the Open Campus Codex network in MetaMask.");
        return;
      }

      await window.ethereum.request({ method: "eth_requestAccounts" });
      const accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      accountAddress.value = accounts[0];
      mmStatus.value = "Connected!";
      isConnected.value = true;
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
    }
  } else {
    alert("Please install MetaMask!");
  }
};

onMounted(() => {
  if (authState.value.idToken) {
    const decodedToken = jwtDecode<DecodedToken>(authState.value.idToken);
    ocidUsername.value = decodedToken.edu_username;
  }

  if (typeof window.ethereum !== "undefined") {
    const web3Instance = new Web3(window.ethereum);
    web3.value = web3Instance;

    const Greeter = new web3Instance.eth.Contract(
      contractJson.abi,
      contractAddress
    );
    contract.value = Greeter;
    Greeter.setProvider(window.ethereum);
  } else {
    alert("Please install MetaMask!");
  }
});

const receive = async () => {
  if (contract.value) {
    try {
      const fetchedMessage = await contract.value.methods.read().call();
      displayMessage.value = fetchedMessage;
    } catch (error) {
      console.error("Failed to read from contract:", error);
    }
  }
};

const send = async () => {
  if (!message.value.trim()) {
    alert("Message cannot be empty.");
    return;
  }
  loading.value = true;
  showMessage.value = true;
  if (contract.value && accountAddress.value) {
    try {
      await contract.value.methods
        .write(message.value)
        .send({ from: accountAddress.value })
        .on("transactionHash", (hash: string) => {
          txnHash.value = hash;
        });
      await receive();
    } catch (error) {
      console.error("Failed to write to contract:", error);
    }
  }
  loading.value = false;
  setTimeout(() => {
    showMessage.value = false;
  }, 3000);
};
</script>
