// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {Script, console} from "forge-std/Script.sol";
import {AnonymousFeedback} from "../src/AnonymousFeedback.sol";

contract DeployAnonymousFeedback is Script {
    function run() external {
        // Load the deployer's private key from the environment variables
        uint256 deployerPrivateKey = vm.envUint("ACCOUNT_PRIVATE_KEY");

        // Start broadcasting the transaction using the deployer's private key
        vm.startBroadcast(deployerPrivateKey);

        // Deploy the AnonymousFeedback contract
        AnonymousFeedback anonymousFeedback = new AnonymousFeedback();

        // End broadcasting the transaction
        vm.stopBroadcast();

        // Log the address of the deployed contract
        console.log("AnonymousFeedback deployed to:", address(anonymousFeedback));
    }
}
