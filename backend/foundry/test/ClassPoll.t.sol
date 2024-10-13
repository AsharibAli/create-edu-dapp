// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/ClassPoll.sol";

contract ClassPollTest is Test {
    ClassPoll public poll;
    address public owner;
    address public voter1;
    address public voter2;

    function setUp() public {
        owner = address(this);
        voter1 = address(0x1);
        voter2 = address(0x2);
        poll = new ClassPoll();
    }

    function testCreatePoll() public {
        string memory question = "What's your favorite color?";
        string[] memory options = new string[](3);
        options[0] = "Red";
        options[1] = "Blue";
        options[2] = "Green";

        poll.createPoll(question, options);

        ClassPoll.Poll memory currentPoll = poll.getCurrentPoll();
        assertEq(currentPoll.question, question);
        assertEq(currentPoll.options.length, 3);
        assertEq(currentPoll.options[0], "Red");
        assertEq(currentPoll.options[1], "Blue");
        assertEq(currentPoll.options[2], "Green");
    }

    function testOnlyOwnerCanCreatePoll() public {
        vm.prank(voter1);
        vm.expectRevert("Only the owner can call this function");
        poll.createPoll("Test question", new string[](2));
    }

    function testVoting() public {
        string[] memory options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";
        poll.createPoll("Do you like smart contracts?", options);

        vm.prank(voter1);
        poll.vote(0); // Vote for "Yes"

        vm.prank(voter2);
        poll.vote(1); // Vote for "No"

        uint256[] memory voteCounts = poll.getVoteCounts();
        assertEq(voteCounts[0], 1);
        assertEq(voteCounts[1], 1);
    }

    function testInvalidVoteOption() public {
        string[] memory options = new string[](2);
        options[0] = "Option A";
        options[1] = "Option B";
        poll.createPoll("Test poll", options);

        vm.expectRevert("Invalid option index");
        poll.vote(2); // Try to vote for non-existent option
    }

    function testMultipleVotes() public {
        string[] memory options = new string[](2);
        options[0] = "Option 1";
        options[1] = "Option 2";
        poll.createPoll("Multiple votes test", options);

        vm.prank(voter1);
        poll.vote(0);

        vm.prank(voter1);
        poll.vote(0);

        uint256[] memory voteCounts = poll.getVoteCounts();
        assertEq(voteCounts[0], 2);
        assertEq(voteCounts[1], 0);
    }

    function testGetCurrentPoll() public {
        string memory question = "Test question";
        string[] memory options = new string[](2);
        options[0] = "Option A";
        options[1] = "Option B";
        poll.createPoll(question, options);

        ClassPoll.Poll memory currentPoll = poll.getCurrentPoll();
        assertEq(currentPoll.question, question);
        assertEq(currentPoll.options.length, 2);
        assertEq(currentPoll.options[0], "Option A");
        assertEq(currentPoll.options[1], "Option B");
    }
}