<template>
  <div class="App min-h-screen flex flex-col items-center justify-between">
    <Header />
    <div
      class="flex flex-col items-center justify-center flex-grow w-full mt-24 px-4"
    >
      <Card class="w-full max-w-2xl p-8 shadow-lg">
        <CardHeader>
          <template v-if="accountAddress">
            <CardTitle class="text-center text-4xl font-bold mt-2">
              Wallet Details
            </CardTitle>
            <p class="mb-6 text-gray-600 text-center font-bold text-xl">
              Your MetaMask connection information:
            </p>
          </template>
          <template v-else>
            <div class="text-center">
              <CardTitle class="text-2xl font-bold mb-4">
                Connect MetaMask Wallet
              </CardTitle>
              <p class="mb-6 text-gray-600">
                Please connect your MetaMask wallet to continue.
              </p>
              <Button
                @click="connectWallet"
                class="bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md"
              >
                Connect Wallet
              </Button>
            </div>
          </template>
        </CardHeader>
        <CardContent v-if="accountAddress">
          <div>
            <p><strong>Ethereum Address:</strong> {{ accountAddress }}</p>
            <p><strong>Network ID:</strong> {{ networkId }}</p>
            <p><strong>Connection Status:</strong> {{ connectionStatus }}</p>
          </div>
        </CardContent>
        <CardFooter class="flex justify-center">
          <Button
            @click="goToHome"
            class="bg-teal-400 hover:bg-teal-700 text-black font-bold py-2 px-4 rounded-md"
          >
            Go to Home
          </Button>
        </CardFooter>
      </Card>
    </div>
    <Footer />
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import Web3 from "web3";
import Header from "@/components/Header.vue";
import Footer from "@/components/Footer.vue";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default defineComponent({
  name: "UserPage",
  components: {
    Header,
    Footer,
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    Button,
  },
  setup() {
    const router = useRouter();
    const accountAddress = ref(null);
    const networkId = ref(null);
    const connectionStatus = ref("Not Connected");
    const web3 = ref(null);

    const connectWallet = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          await switchToOpenCampusNetwork();

          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });

          accountAddress.value = accounts[0];
          connectionStatus.value = "Connected";

          const web3Instance = new Web3(window.ethereum);
          web3.value = web3Instance;
          networkId.value = await web3Instance.eth.getChainId();

          localStorage.setItem("walletAddress", accounts[0]);
        } catch (error) {
          console.error("Failed to connect wallet:", error);
        }
      } else {
        alert("Please install MetaMask!");
      }
    };

    const switchToOpenCampusNetwork = async () => {
      if (typeof window.ethereum !== "undefined") {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0xa045c" }],
          });
        } catch (switchError) {
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
              console.error(
                "Failed to add Open Campus Codex network:",
                addError
              );
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

    const goToHome = () => {
      router.push("/");
    };

    onMounted(() => {
      // Check if wallet was previously connected
      const storedAddress = localStorage.getItem("walletAddress");
      if (storedAddress && typeof window.ethereum !== "undefined") {
        window.ethereum.request({ method: "eth_accounts" }).then((accounts) => {
          if (accounts.length > 0 && accounts[0] === storedAddress) {
            accountAddress.value = storedAddress;
            connectionStatus.value = "Connected";

            const web3Instance = new Web3(window.ethereum);
            web3.value = web3Instance;
            web3Instance.eth.getChainId().then((chainId) => {
              networkId.value = chainId;
            });
          } else {
            localStorage.removeItem("walletAddress");
          }
        });
      }

      // Setup event listeners for MetaMask
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.on("accountsChanged", (accounts) => {
          if (accounts.length === 0) {
            accountAddress.value = null;
            connectionStatus.value = "Not Connected";
            localStorage.removeItem("walletAddress");
          } else {
            accountAddress.value = accounts[0];
            localStorage.setItem("walletAddress", accounts[0]);
          }
        });

        window.ethereum.on("chainChanged", () => {
          window.location.reload();
        });
      }
    });

    return {
      accountAddress,
      networkId,
      connectionStatus,
      connectWallet,
      goToHome,
    };
  },
});
</script>
