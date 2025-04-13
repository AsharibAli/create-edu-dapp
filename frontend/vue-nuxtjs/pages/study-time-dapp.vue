<template>
  <div class="App min-h-screen flex flex-col items-center justify-between">
    <Header />
    <div
      class="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4"
    >
      <Card class="w-full max-w-2xl p-8 shadow-lg">
        <CardHeader>
          <CardTitle class="text-center text-4xl font-bold mt-4">
            📚 Study Time Tracker Dapp 📚
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
          <div v-if="isConnected" class="flex flex-col items-center space-y-4">
            <div class="text-6xl font-bold">
              {{ formatTime(studyTime) }}
            </div>
            <Button
              :class="[
                isStudying
                  ? 'bg-red-500 hover:bg-red-700'
                  : 'bg-green-500 hover:bg-green-700',
                'text-white font-bold py-2 px-4 rounded-full',
              ]"
              @click="toggleStudyTimer"
            >
              {{ isStudying ? "Stop Studying" : "Start Studying" }}
            </Button>
            <div class="text-xl">
              Total Study Time: {{ formatTime(totalStudyTime) }}
            </div>
            <Button
              class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              @click="getTotalStudyTime"
            >
              Refresh Total Time
            </Button>
          </div>
          <div v-if="showMessage">
            <p class="text-center text-sm mt-6">Recording study session...</p>
            <p class="mt-4 text-xs">
              Txn hash:
              <a
                class="text-teal-300"
                :href="'https://edu-chain-testnet.blockscout.com/tx/' + txnHash"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ txnHash }}
              </a>
            </p>
            <p class="mt-2 text-xs">Please wait till the Txn is completed :)</p>
          </div>
        </CardContent>
      </Card>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useOCAuth } from "@/composables/useOCAuth";
import { jwtDecode } from "jwt-decode";
import Web3 from "web3";
import contractJson from "@/contracts/StudyTracker.sol/StudyTracker.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import LoginButton from "@/components/LoginButton.vue";

interface DecodedToken {
  edu_username: string;
  [key: string]: any;
}

const contractAddress = "0x4592d03bf91Ba5667F2C064A3CC122917EC41f1F";

const { authState } = useOCAuth();
const mmStatus = ref("Not connected!");
const isConnected = ref(false);
const accountAddress = ref<string | undefined>(undefined);
const web3 = ref<Web3 | undefined>(undefined);
const contract = ref<any>(undefined);
const loading = ref(false);
const txnHash = ref<string | null>(null);
const showMessage = ref(false);
const ocidUsername = ref<string | null>(null);
const isStudying = ref(false);
const studyTime = ref(0);
const totalStudyTime = ref(0);
const startTime = ref<number | null>(null);

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

      const chainId = await window.ethereum.request({
        method: "eth_chainId",
      });

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
      localStorage.setItem("walletAddress", accounts[0]);
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
    }
  } else {
    alert("Please install MetaMask!");
  }
};

onMounted(() => {
  // Check local storage for wallet connection
  const storedAddress = localStorage.getItem("walletAddress");
  if (storedAddress) {
    accountAddress.value = storedAddress;
    isConnected.value = true;
    mmStatus.value = "Connected!";
  }

  // Check if user is logged in with OCID
  if (authState.value.idToken) {
    const decodedToken = jwtDecode<DecodedToken>(authState.value.idToken);
    ocidUsername.value = decodedToken.edu_username;
    localStorage.setItem("ocidUsername", decodedToken.edu_username);
  } else {
    // Check local storage for OCID username
    const storedUsername = localStorage.getItem("ocidUsername");
    if (storedUsername) {
      ocidUsername.value = storedUsername;
    }
  }

  // Initialize Web3 and set contract
  if (typeof window.ethereum !== "undefined") {
    const web3Instance = new Web3(window.ethereum);
    web3.value = web3Instance;
    const StudyTracker = new web3Instance.eth.Contract(
      contractJson.abi,
      contractAddress
    );
    contract.value = StudyTracker;
    StudyTracker.setProvider(window.ethereum);

    // Check if already connected
    if (storedAddress) {
      web3Instance.eth.getAccounts().then((accounts) => {
        if (accounts[0] === storedAddress) {
          accountAddress.value = accounts[0];
          isConnected.value = true;
          mmStatus.value = "Connected!";
        } else {
          // Clear stored address if it doesn't match current account
          localStorage.removeItem("walletAddress");
          isConnected.value = false;
          mmStatus.value = "Not connected!";
        }
      });
    }
  }

  // Set up event listeners for MetaMask
  if (window.ethereum) {
    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", () => window.location.reload());
  }

  // Start the study timer if it was running
  const storedStartTime = localStorage.getItem("studyStartTime");
  if (storedStartTime) {
    startTime.value = parseInt(storedStartTime);
    isStudying.value = true;
    updateStudyTime();
  }

  getTotalStudyTime();
});

const handleAccountsChanged = (accounts: string[]) => {
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    isConnected.value = false;
    mmStatus.value = "Not connected!";
    localStorage.removeItem("walletAddress");
  } else if (accounts[0] !== accountAddress.value) {
    accountAddress.value = accounts[0];
    isConnected.value = true;
    mmStatus.value = "Connected!";
    localStorage.setItem("walletAddress", accounts[0]);
  }
};

watch(isStudying, (newValue) => {
  if (newValue) {
    const interval = setInterval(() => {
      studyTime.value++;
    }, 1000);
    return () => clearInterval(interval);
  }
});

const toggleStudyTimer = async () => {
  if (!isStudying.value) {
    startTime.value = Date.now();
    localStorage.setItem("studyStartTime", startTime.value.toString());
    isStudying.value = true;
  } else {
    isStudying.value = false;
    localStorage.removeItem("studyStartTime");
    if (startTime.value) {
      const duration = Math.floor((Date.now() - startTime.value) / 1000);
      await recordStudySession(duration);
    }
  }
};

const recordStudySession = async (duration: number) => {
  loading.value = true;
  showMessage.value = true;
  if (contract.value && accountAddress.value) {
    try {
      await contract.value.methods
        .recordStudySession(duration)
        .send({ from: accountAddress.value })
        .on("transactionHash", (hash: string) => {
          txnHash.value = hash;
        });
      await getTotalStudyTime();
    } catch (error) {
      console.error("Failed to record study session:", error);
    }
  }
  loading.value = false;
  setTimeout(() => {
    showMessage.value = false;
  }, 3000);
};

const getTotalStudyTime = async () => {
  if (contract.value && accountAddress.value) {
    try {
      const totalTime = await contract.value.methods
        .getTotalStudyTime()
        .call({ from: accountAddress.value });
      totalStudyTime.value = parseInt(totalTime);
    } catch (error) {
      console.error("Failed to get total study time:", error);
    }
  }
};

const formatTime = (seconds: number) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
};

const updateStudyTime = () => {
  if (startTime.value) {
    studyTime.value = Math.floor((Date.now() - startTime.value) / 1000);
    requestAnimationFrame(updateStudyTime);
  }
};
</script>
