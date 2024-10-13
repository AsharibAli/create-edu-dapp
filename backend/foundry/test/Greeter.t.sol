// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {Test, console} from "forge-std/Test.sol";
import {Greeter} from "../src/Greeter.sol";

contract GreeterTest is Test {
    Greeter public greeter;

    function setUp() public {
        greeter = new Greeter();
    }

    function testInitialGreeting() public view {
        string memory initialGreeting = greeter.read();
        assertEq(initialGreeting, "Hello, world!");
    }

    function testUpdateGreeting() public {
        string memory newGreeting = "Hello, Open Campus!";
        greeter.write(newGreeting);

        string memory updatedGreeting = greeter.read();
        assertEq(updatedGreeting, newGreeting);
    }
}
