<template>
  <div class="App min-h-screen flex flex-col items-center justify-between">
    <Header />
    <div
      class="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4"
    >
      <Card class="w-full max-w-2xl p-8 shadow-lg">
        <CardHeader>
          <CardTitle class="text-center text-4xl font-bold mt-4">
            📚 Assignment Submit Dapp 📚
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
          <div class="flex flex-col items-center w-full">
            <Input
              v-model="assignmentHash"
              type="text"
              placeholder="Enter assignment hash or URL"
              class="w-full bg-white rounded border border-gray-300 focus:ring-2 focus:ring-indigo-200 focus:bg-white focus:border-indigo-500 text-base outline-none text-gray-700 px-3 leading-8 transition-colors duration-200 ease-in-out mb-4"
            />
            <Button
              class="bg-teal-300 hover:bg-teal-700 text-black font-bold py-1 px-6 rounded w-full"
              @click="isConnected ? submitAssignment : undefined"
              :disabled="!isConnected || loading"
            >
              {{ loading ? "Submitting..." : "Submit Assignment" }}
            </Button>
            <Alert v-if="showMessage" class="mt-4">
              <AlertCircle class="h-4 w-4" />
              <AlertTitle>Transaction Submitted</AlertTitle>
              <AlertDescription>
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
                <p>Please wait until the transaction is completed.</p>
              </AlertDescription>
            </Alert>
          </div>
          <div v-if="isEducator" class="w-full mt-8">
            <h2 class="text-2xl font-bold mb-4">Submissions</h2>
            <div
              v-for="(submission, index) in submissions"
              :key="index"
              class="border-b py-2"
            >
              <p>Student: {{ submission.student }}</p>
              <p>Assignment Hash: {{ submission.assignmentHash }}</p>
              <p>
                Timestamp:
                {{ new Date(submission.timestamp * 1000).toLocaleString() }}
              </p>
              <p>Verified: {{ submission.verified ? "Yes" : "No" }}</p>
              <Button
                v-if="!submission.verified"
                class="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-4 rounded mt-2"
                @click="verifySubmission(index)"
              >
                Verify Submission
              </Button>
            </div>
          </div>
          <Alert v-if="!isEducator" class="mt-4">
            <AlertCircle class="h-4 w-4" />
            <AlertTitle>Student View</AlertTitle>
            <AlertDescription>
              As a student, you can submit assignments but cannot view all
              submissions, only educators with ocid (edu_) can see it.
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
import { useOCAuth } from "@/composables/useOCAuth";
import { jwtDecode } from "jwt-decode";
import Web3 from "web3";
import contractJson from "@/contracts/AssignmentSubmission.sol/AssignmentSubmission.json";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-vue-next";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import LoginButton from "@/components/LoginButton.vue";

interface DecodedToken {
  edu_username: string;
  [key: string]: any;
}

interface Submission {
  student: string;
  assignmentHash: string;
  timestamp: number;
  verified: boolean;
}

const contractAddress = "0x0EA845BCC2bafD0C54cD0CFfCEF23B57aac439ED";

const { authState } = useOCAuth();
const mmStatus = ref("Not connected!");
const isConnected = ref(false);
const accountAddress = ref<string | undefined>(undefined);
const web3 = ref<Web3 | undefined>(undefined);
const contract = ref<any>(undefined);
const ocidUsername = ref<string | null>(null);
const assignmentHash = ref("");
const submissions = ref<Submission[]>([]);
const loading = ref(false);
const txnHash = ref<string | null>(null);
const showMessage = ref(false);
const isEducator = ref(false);

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
    isEducator.value = decodedToken.edu_username.startsWith("edu_");
  }

  if (typeof window.ethereum !== "undefined") {
    const web3Instance = new Web3(window.ethereum);
    web3.value = web3Instance;

    const AssignmentSubmission = new web3Instance.eth.Contract(
      contractJson.abi,
      contractAddress
    );
    contract.value = AssignmentSubmission;
    AssignmentSubmission.setProvider(window.ethereum);
  } else {
    alert("Please install MetaMask!");
  }
});

const submitAssignment = async () => {
  if (!assignmentHash.value.trim()) {
    alert("Assignment hash cannot be empty.");
    return;
  }
  loading.value = true;
  showMessage.value = true;
  if (contract.value && accountAddress.value) {
    try {
      await contract.value.methods
        .submitAssignment(assignmentHash.value)
        .send({ from: accountAddress.value })
        .on("transactionHash", (hash: string) => {
          txnHash.value = hash;
        });
      await fetchSubmissions();
      assignmentHash.value = "";
    } catch (error) {
      console.error("Failed to submit assignment:", error);
    }
  }
  loading.value = false;
  setTimeout(() => {
    showMessage.value = false;
  }, 3000);
};

const fetchSubmissions = async () => {
  if (contract.value && isEducator.value) {
    try {
      const count = await contract.value.methods.getSubmissionsCount().call();
      const fetchedSubmissions = [];
      for (let i = 0; i < count; i++) {
        const submission = await contract.value.methods.getSubmission(i).call();
        fetchedSubmissions.push({
          student: submission[0],
          assignmentHash: submission[1],
          timestamp: parseInt(submission[2]),
          verified: submission[3],
        });
      }
      submissions.value = fetchedSubmissions;
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    }
  }
};

const verifySubmission = async (index: number) => {
  if (contract.value && accountAddress.value && isEducator.value) {
    try {
      await contract.value.methods
        .verifySubmission(index)
        .send({ from: accountAddress.value })
        .on("transactionHash", (hash: string) => {
          txnHash.value = hash;
        });
      await fetchSubmissions();
    } catch (error) {
      console.error("Failed to verify submission:", error);
    }
  }
};

onMounted(() => {
  if (contract.value && isEducator.value) {
    fetchSubmissions();
  }
});
</script>
