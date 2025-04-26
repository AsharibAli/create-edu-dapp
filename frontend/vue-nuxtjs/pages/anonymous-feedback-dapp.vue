<template>
  <div class="App min-h-screen flex flex-col items-center justify-between">
    <Header />
    <div
      class="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4"
    >
      <Card class="w-full max-w-2xl p-8 shadow-lg">
        <CardHeader>
          <CardTitle class="text-center text-4xl font-bold mt-4">
            📚 Anonymous FB Dapp 📚
          </CardTitle>
        </CardHeader>
        <CardContent class="flex flex-col items-center mt-4 space-y-6">
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
          <div class="flex flex-col items-center w-full">
            <Textarea
              v-model="feedback"
              placeholder="Enter your anonymous feedback about the course here"
              class="w-full mb-4"
            />
            <Button
              class="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded"
              @click="isConnected ? submitFeedback : undefined"
            >
              Submit Feedback
            </Button>
            <Button
              v-if="isEducator"
              class="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded mt-4"
              @click="isConnected ? getFeedback : undefined"
            >
              View Feedback
            </Button>
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
          <div
            v-if="isEducator && submittedFeedback.length > 0"
            class="w-full mt-8"
          >
            <h2 class="text-2xl font-bold mb-4">Submitted Feedback:</h2>
            <div
              v-for="(feedback, index) in submittedFeedback"
              :key="index"
              class="bg-gray-100 p-4 rounded-md mb-2"
            >
              {{ feedback }}
            </div>
          </div>
          <Alert v-if="!isEducator" class="mt-4">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Student View</AlertTitle>
            <AlertDescription>
              As a student, you can submit anonymous feedbacks about the courses
              but cannot view all feedback submissions, only educators with
              authorized wallet addresses can see it.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import Web3 from "web3";
import contractJson from "@/contracts/AnonymousFeedback.sol/AnonymousFeedback.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-vue-next";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import type { Contracts } from "@/types";

const contractAddress = "0x5E953eF799f59D2589b72c19c05A7e02EAbcdf0C";
const mmStatus = ref("Not connected!");
const isConnected = ref(false);
const accountAddress = ref<string | undefined>(undefined);
const feedback = ref("");
const submittedFeedback = ref<string[]>([]);
const web3 = ref<Web3 | undefined>(undefined);
const getNetwork = ref<number | undefined>(undefined);
const contracts = ref<Contracts | undefined>(undefined);
const loading = ref(false);
const txnHash = ref<string | null>(null);
const showMessage = ref(false);
const isEducator = ref(false);

const educatorAddresses = [
  "0x123456789abcdef0123456789abcdef012345678",
  "0x987654321fedcba0987654321fedcba098765432",
];

const checkEducatorRole = () => {
  if (accountAddress.value) {
    isEducator.value = educatorAddresses.includes(
      accountAddress.value.toLowerCase()
    );
  } else {
    isEducator.value = false;
  }
};

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

      checkEducatorRole();
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
    }
  } else {
    alert("Please install MetaMask!");
  }
};

onMounted(async () => {
  try {
    const storedAddress = localStorage.getItem("walletAddress");

    if (typeof window.ethereum !== "undefined") {
      const web3Instance = new Web3(window.ethereum);
      web3.value = web3Instance;
      const networkId: any = await web3Instance.eth.getChainId();
      getNetwork.value = networkId;
      const AnonymousFeedback = new web3Instance.eth.Contract(
        contractJson.abi,
        contractAddress
      ) as Contracts;
      contracts.value = AnonymousFeedback;
      AnonymousFeedback.setProvider(window.ethereum);

      if (storedAddress) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0 && accounts[0] === storedAddress) {
          accountAddress.value = storedAddress;
          mmStatus.value = "Connected!";
          isConnected.value = true;

          checkEducatorRole();
        } else {
          localStorage.removeItem("walletAddress");
        }
      }

      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length === 0) {
          accountAddress.value = undefined;
          isConnected.value = false;
          isEducator.value = false;
          localStorage.removeItem("walletAddress");
        } else {
          accountAddress.value = accounts[0];
          localStorage.setItem("walletAddress", accounts[0]);
          checkEducatorRole();
        }
      });
    } else {
      alert("Please install MetaMask!");
    }
  } catch (error) {
    console.error("Failed to initialize web3 or contract:", error);
  }
});

const submitFeedback = async () => {
  if (!feedback.value.trim()) {
    alert("Feedback cannot be empty.");
    return;
  }
  loading.value = true;
  showMessage.value = true;
  if (contracts.value && accountAddress.value) {
    try {
      await contracts.value.methods
        .submitFeedback(feedback.value)
        .send({ from: accountAddress.value })
        .on("transactionHash", (hash: string) => {
          txnHash.value = hash;
        });
      feedback.value = "";
      alert("Feedback submitted successfully!");
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  }
  loading.value = false;
  setTimeout(() => {
    showMessage.value = false;
  }, 3000);
};

const getFeedback = async () => {
  if (contracts.value) {
    try {
      const feedbackList = await contracts.value.methods
        .getAllFeedback()
        .call();
      submittedFeedback.value = feedbackList;
    } catch (error) {
      console.error("Failed to get feedback:", error);
    }
  }
};
</script>
