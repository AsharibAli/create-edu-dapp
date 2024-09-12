<p align="center">
    <img align="center" src="https://www.opencampus.xyz/static/media/coin-logo.39cbd6c42530e57817a5b98ac7621ca7.svg" width="100"></img>
</p>

<h1 align="center">create-edu-dapp</h1>

<div align="center">
    <img src="https://img.shields.io/badge/platform-opencampus-teal.svg?style=flat-square" alt="Platform">
    <img src="https://img.shields.io/github/license/asharibali/create-edu-dapp-hardhat?color=teal&style=flat-square " alt="License">
    <img src="https://img.shields.io/npm/v/create-edu-dapp?color=teal" alt="NPM Version">
</div><br>

A full-stack starter template featuring **Next.js & Hardhat or Foundry**, designed for building `dApps`, and for developing, deploying, testing, and verifying Solidity smart contracts on the Open Campus L3 **(EduChain)**. The starter kit comes pre-configured with **six example dApps** and includes essential tools and libraries such as `create-next-app`, `Hardhat`, `Foundry`, `TypeScript`, `Tailwind CSS`, `shadcn-ui`, `web3.js`, `Open Campus ID`, and more.

<table align="center">
  <tr>
    <td align="center">
      <a align="center" href="https://ced.asharib.xyz/">
  <img src="https://cdn.dorahacks.io/static/files/191743e71ac107ee43506c8424997c17.png" alt="package">
  <b>create-edu-dapp</b>
</a>
  </tr>
</table>


## 🎉 Achievements
- **1k+ NPM Downloads**
- **Appreciated by the Open Campus Team on X**

## 🚀 Quick Start

Choose your preferred implementation:
- [Next.js & Hardhat](https://github.com/AsharibAli/create-edu-dapp-hardhat)
- [Next.js & Foundry](https://github.com/AsharibAli/create-edu-dapp-foundry)

### 📦 Installation

Open up your terminal (or command prompt) and type the following command:

```sh
npx create-edu-dapp <your-dapp-name>

# Select Hardhat or Foundry Option

# cd into the directory
cd <your-dapp-name>
```

***Note: If you have used the npx command then you don't have to install manually in any directory.***

# Hardhat Setup

## 📜 Smart Contracts

All smart contracts are located inside the `backend` aka `hardhat` folder, which can be found in the root directory. To get started, first install the necessary dependencies by running:

```sh
# change directory into the backend folder
cd backend

npm install
```

### 🔑 Private Key

Ensure you create a `.env` file in the `backend` directory. Then paste your [Metamask private key](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key) in `.env` with the variable name `ACCOUNT_PRIVATE_KEY` as follows:

```sh
ACCOUNT_PRIVATE_KEY=0x734...
```

### ⚙️ Compile

Now, you can write your contracts in `./contracts/` directory, replace `Greeter.sol` with `<your-contracts>.sol` file.

```sh
# For compiling the smart contracts
npx hardhat compile
```

After successful compilation, the artifacts directory will be created in `./src` with a JSON `/contracts/<your-contracts>.sol/<your-contracts>.json` containing ABI and Bytecode of your compiled smart contracts.

### 🧪 Test

To write tests, go to `./test` directory and create `<your-contracts>.ts`, you can test your smart contracts using the following command.

```sh
# For testing the smart contracts
npx hardhat test
```

### ⛓️ Deploy

Before deploying the smart contracts, ensure that you have added the [`Open Campus Codex`](https://open-campus-docs.vercel.app/getting-started) to your MetaMask wallet and that it has sufficient funds. If you do not have testnet $EDU on Open Campus Codex, please follow this [faucets guide](https://open-campus-docs.vercel.app/build/faucet).

Also, make changes in `./scripts/deploy.ts` (replace the greeter contract name with `<your-contract-name>`).

For deploying the smart contracts to `open campus codex` network, type the following command:

```sh
# For deploying the smart contracts
npx hardhat run scripts/deploy.ts --network opencampus
```

```sh
<your-contract> deployed to: 0x...
```

**Copy and paste the generated contract JSON ABI folder `contracts` inside the `backend/src/contracts` directory to the `/frontend/` directory.**

**Copy and paste the deployed contract address in the frontend page directory. For example, if the deployed contract is `Greeter.sol`, then you have to paste the address in `frontend/app/(dapps)/simple-greeting-dapp/page.tsx`.**

### ✅ Verify

To verify the deployed smart contract on `Open Campus Codex`, execute the following command:

```sh
# For verifying the smart contracts
npx hardhat verify --network opencampus <deployed-contract-address>
```

# Foundry Setup

## 📜 Smart Contracts

All smart contracts are located inside the `backend` aka `foundry` folder, which can be found in the root directory.

```sh
# change directory into the backend folder
cd backend
```

### 🔑 Private Key

Ensure you create a `.env` file in the `backend` directory. Then paste your [Metamask private key](https://metamask.zendesk.com/hc/en-us/articles/360015289632-How-to-export-an-account-s-private-key) in `.env` with the variable name `ACCOUNT_PRIVATE_KEY` as follows:

```sh
ACCOUNT_PRIVATE_KEY=0x734...
```

### ⚙️ Compile

Now, you can write your contracts in `./src/` directory, replace `Greeter.sol` with `<your-contracts>.sol` file.

```sh
# For compiling the smart contracts
forge compile
```

After successful compilation, the artifacts directory will be created in `./out` with a JSON `/<your-contract>/<your-contracts>.json` containing ABI and Bytecode of your compiled smart contracts.

### 🧪 Test

To write tests, go to `./test` directory and create `<your-contracts>.t.sol`, you can test your smart contracts using the following command.

```sh
# For testing the smart contracts
forge test
```

### ⛓️ Deploy

Before deploying the smart contracts, ensure that you have added the [`Open Campus Codex`](https://open-campus-docs.vercel.app/getting-started) to your MetaMask wallet and that it has sufficient funds. If you do not have testnet $EDU on Open Campus Codex, please follow this [faucets guide](https://open-campus-docs.vercel.app/build/faucet).

Also, make changes in `./script/DeployGreeter.s.sol` (replace the deploy greeter contract name with `<your-contract-name>`).

For deploying the smart contracts to `open campus codex` network, type the following command:

```sh
# For deploying the smart contracts
forge script script/DeployGreeter.s.sol --broadcast --rpc-url https://rpc.open-campus-codex.gelato.digital/ --gas-limit 30000000 --with-gas-price 5gwei --skip-simulation
```

```sh
<your-contract> deployed to: 0x...
```

**Copy and paste the generated contract JSON ABI folder `Greeter.sol` inside the `backend/out/` directory to the `/frontend/contracts/` directory.**

**Copy and paste the deployed contract address in the frontend page directory. For example, if the deployed contract is `Greeter.sol`, then you have to paste the address in `frontend/app/(dapps)/simple-greeting-dapp/page.tsx`.**

### ✅ Verify

To verify the deployed smart contract on `Open Campus Codex`, execute the following command:

```sh
# For verifying the smart contracts
forge verify-contract \
  --rpc-url https://rpc.open-campus-codex.gelato.digital \
  --verifier blockscout \
  --verifier-url 'https://opencampus-codex.blockscout.com/api/' \
  <deployed-contract-address> \
  [contractFile]:[contractName]
```

## Next.js Client

Start the Next.js app by running the following command in the `frontend` directory:

```sh
# Change directory into the frontend folder 
cd frontend

# Start the development server
npm run dev
```

<table align="center">
  <tr>
    <td align="center">
      <img src="https://i.ibb.co/Zdb4RKD/create-edu-dapp-before.png" alt="create-edu-dapp-before" width="500"/>
      <b>(/) create-edu-dapp Before Auth</b>
    </td>
    <td align="center">
      <img src="https://i.ibb.co/Xzd8bqS/create-edu-dapp-after.png" alt="create-edu-dapp-after" width="500"/>
      <b>(state update) create-edu-dapp After Auth</b>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://i.ibb.co/dc5JVgF/connect-with-ocid-before.png" alt="connect-with-ocid-before" width="500"/>
      <b>(/user) connect-with-ocid Before Auth</b>
    </td>
    <td align="center">
      <img src="https://i.ibb.co/QbK9MNm/connect-with-ocid-after.png" alt="connect-with-ocid-after" width="500"/>
      <b>(state update) connect-with-ocid After Auth</b>
    </td>
  </tr>
</table>

## ➡️ Contributing

We welcome contributions from the community! If you'd like to contribute, please follow the guidelines in our [CONTRIBUTING.md](https://github.com/AsharibAli/create-edu-dapp-hardhat/blob/main/CONTRIBUTING.md) file.

## ⚖️ License

create-edu-dapp is licensed under the [MIT License](https://github.com/AsharibAli/create-edu-dapp-hardhat/blob/main/LICENSE.md).

### ⭐️ Don't forget to star the repository, and [follow me on X](https://x.com/0xAsharib).
