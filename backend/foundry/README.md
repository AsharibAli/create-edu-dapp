# `create-edu-dapp` Foundry Implementation | Backend

This project demonstrates a basic Foundry implementation. It comes with a sample contract, tests for that contract, and scripts that deploy and verify that contract on the Open Campus L3 chain.

## Setup

First, navigate to the Foundry folder which is `backend` inside the project directory and install the dependencies:

```shell
# Navigate to the folder
cd backend

# Install dependencies
forge install
```

## Try running some of the following commands:

```shell
# For compiling the smart contracts
forge compile

# For testing the smart contracts
forge test

# For deploying the smart contracts
forge script script/DeployGreeter.s.sol --broadcast --rpc-url https://rpc.open-campus-codex.gelato.digital/ --gas-limit 30000000 --with-gas-price 5gwei --skip-simulation

# For verifying the smart contracts
forge verify-contract \
  --rpc-url https://rpc.open-campus-codex.gelato.digital \
  --verifier blockscout \
  --verifier-url 'https://opencampus-codex.blockscout.com/api/' \
  <deployed-contract-address> \
  [contractFile]:[contractName]

# Display help information for Foundry
forge help
```
