# `create-edu-dapp` Hardhat Implementation | Backend

This project demonstrates a basic Hardhat implementation. It comes with a sample contract, a test for that contract, and a script that deploys and verify that contract on the Open Campus L3 chain.

## Setup

First, navigate to the Hardhat folder which is `backend` inside the project directory and install the dependencies:

```shell
# Navigate to the folder
cd backend

# Install dependencies
npm install
```

## Try running some of the following commands:

```shell
# For compiling the smart contracts
npx hardhat compile

# For testing the smart contracts
npx hardhat test

# For deploying the smart contracts to testnet
npx hardhat run scripts/deployGreeter.ts --network educhain-testnet

# For deploying the smart contracts to mainnet
npx hardhat run scripts/deployGreeter.ts --network educhain-mainnet

# For verifying the smart contracts on testnet
npx hardhat verify --network educhain-testnet <deployed-contract-address>

# For verifying the smart contracts on mainnet
npx hardhat verify --network educhain-mainnet <deployed-contract-address>

# Display help information for Hardhat
npx hardhat help

# Start a local Ethereum node
npx hardhat node
```
