<template>
  <div class="App min-h-screen flex flex-col items-center justify-between">
    <Header />
    <div
      class="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4"
    >
      <Card class="w-full max-w-2xl p-8 shadow-lg">
        <CardHeader>
          <CardTitle class="text-center text-4xl font-bold mt-4">
            📚 Classroom Poll Dapp 📚
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
          <div v-if="isConnected" class="w-full space-y-4">
            <Input
              v-model="newQuestion"
              type="text"
              placeholder="Enter poll question"
              class="w-full"
            />
            <Input
              v-for="(option, index) in newOptions"
              :key="index"
              v-model="newOptions[index]"
              type="text"
              :placeholder="`Option ${index + 1}`"
              class="w-full"
            />
            <Button
              class="w-full bg-teal-300 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded"
              @click="createPoll"
            >
              Create Poll
            </Button>
          </div>
          <div v-if="currentPoll" class="w-full space-y-4">
            <h2 class="text-2xl font-bold">{{ currentPoll.question }}</h2>
            <div
              v-for="(option, index) in currentPoll.options"
              :key="index"
              class="flex justify-between items-center"
            >
              <span>{{ option }}</span>
              <div class="space-x-2">
                <span>{{ currentPoll.votes[index] }} votes</span>
                <Button
                  class="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-4 rounded"
                  @click="vote(index)"
                >
                  Vote
                </Button>
              </div>
            </div>
          </div>
          <div v-if="showMessage">
            <p class="text-center text-sm mt-6">loading...</p>
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
import { ref, computed, onMounted, watch } from "vue";
import Web3 from "web3";
import contractJson from "@/contracts/ClassPoll.sol/ClassPoll.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";

interface Poll {
  question: string;
  options: string[];
  votes: number[];
}

const contractAddress = "0x82D4bF11eA7d4295F94f9f6Ae4Bd04B91CCE11AA";
const mmStatus = ref("Not connected!");
const isConnected = ref(false);
const accountAddress = ref<string | undefined>(undefined);
const web3 = ref<Web3 | undefined>(undefined);
const contract = ref<any>(undefined);
const loading = ref(false);
const txnHash = ref<string | null>(null);
const showMessage = ref(false);
const currentPoll = ref<Poll | null>(null);
const newQuestion = ref("");
const newOptions = ref(["", "", ""]);
const voteCountsUpdated = ref(false);

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

      localStorage.setItem("walletAddress", accounts[0]);
    } catch (error) {
      console.error("Failed to connect to wallet:", error);
    }
  } else {
    alert("Please install MetaMask!");
  }
};

onMounted(() => {
  const storedAddress = localStorage.getItem("walletAddress");
  if (storedAddress && typeof window.ethereum !== "undefined") {
    window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
      if (accounts.length > 0 && accounts[0] === storedAddress) {
        accountAddress.value = storedAddress;
        mmStatus.value = "Connected!";
        isConnected.value = true;
      }
    });
  }

  if (typeof window.ethereum !== "undefined") {
    const web3Instance = new Web3(window.ethereum);
    web3.value = web3Instance;

    const ClassPoll = new web3Instance.eth.Contract(
      contractJson.abi,
      contractAddress
    );
    contract.value = ClassPoll;
    ClassPoll.setProvider(window.ethereum);
  } else {
    alert("Please install MetaMask!");
  }
});

const createPoll = async () => {
  if (
    !newQuestion.value.trim() ||
    newOptions.value.some((option) => !option.trim())
  ) {
    alert("Please fill in all fields.");
    return;
  }
  loading.value = true;
  showMessage.value = true;
  if (contract.value && accountAddress.value) {
    try {
      await contract.value.methods
        .createPoll(newQuestion.value, newOptions.value)
        .send({ from: accountAddress.value })
        .on("transactionHash", (hash: string) => {
          txnHash.value = hash;
        });
      await fetchCurrentPoll();
    } catch (error) {
      console.error("Failed to create poll:", error);
    }
  }
  loading.value = false;
  setTimeout(() => {
    showMessage.value = false;
  }, 3000);
};

const fetchVoteCounts = async () => {
  if (contract.value) {
    try {
      const voteCounts = await contract.value.methods.getVoteCounts().call();
      if (currentPoll.value) {
        currentPoll.value.votes = voteCounts.map(Number);
      }
      voteCountsUpdated.value = !voteCountsUpdated.value;
    } catch (error) {
      console.error("Failed to fetch vote counts:", error);
    }
  }
};

const vote = async (optionIndex: number) => {
  loading.value = true;
  showMessage.value = true;
  if (contract.value && accountAddress.value) {
    try {
      await contract.value.methods
        .vote(optionIndex)
        .send({ from: accountAddress.value })
        .on("transactionHash", (hash: string) => {
          txnHash.value = hash;
        });
      await fetchVoteCounts();
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  }
  loading.value = false;
  setTimeout(() => {
    showMessage.value = false;
  }, 3000);
};

const fetchCurrentPoll = async () => {
  if (contract.value) {
    try {
      const poll = await contract.value.methods.getCurrentPoll().call();
      currentPoll.value = {
        ...poll,
        votes: poll.votes.map(Number),
      };
      await fetchVoteCounts();
    } catch (error) {
      console.error("Failed to fetch current poll:", error);
    }
  }
};

watch(isConnected, (newValue) => {
  if (newValue) {
    fetchCurrentPoll();
  }
});

watch([isConnected, currentPoll], ([newIsConnected, newCurrentPoll]) => {
  if (newIsConnected && newCurrentPoll) {
    const interval = setInterval(fetchVoteCounts, 5000);
    return () => clearInterval(interval);
  }
});
</script>
