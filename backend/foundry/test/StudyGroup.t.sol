// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/StudyGroup.sol";

contract StudyGroupTest is Test {
    StudyGroup public group;
    address public member1;
    address public member2;
    address public nonMember;

    function setUp() public {
        group = new StudyGroup();
        member1 = address(0x1);
        member2 = address(0x2);
        nonMember = address(0x3);
    }

    function testJoinGroup() public {
        vm.prank(member1);
        group.joinGroup();
        assertTrue(group.getMemberStatus(member1));
    }

    function testCannotJoinTwice() public {
        vm.startPrank(member1);
        group.joinGroup();
        vm.expectRevert("Already a member");
        group.joinGroup();
        vm.stopPrank();
    }

    function testSendMessage() public {
        vm.startPrank(member1);
        group.joinGroup();
        group.sendMessage("Hello, study group!");
        vm.stopPrank();

        StudyGroup.Message[] memory messages = group.getMessages();
        assertEq(messages.length, 1);
        assertEq(messages[0].sender, member1);
        assertEq(messages[0].content, "Hello, study group!");
    }

    function testNonMemberCannotSendMessage() public {
        vm.prank(nonMember);
        vm.expectRevert("Must be a member to send messages");
        group.sendMessage("This should fail");
    }

    function testMessageLengthLimits() public {
        vm.startPrank(member1);
        group.joinGroup();

        vm.expectRevert("Message cannot be empty");
        group.sendMessage("");

        string memory longMessage = new string(281);
        vm.expectRevert("Message too long");
        group.sendMessage(longMessage);

        vm.stopPrank();
    }

    function testMultipleMessages() public {
        vm.prank(member1);
        group.joinGroup();

        vm.prank(member2);
        group.joinGroup();

        vm.prank(member1);
        group.sendMessage("Message 1");

        vm.prank(member2);
        group.sendMessage("Message 2");

        StudyGroup.Message[] memory messages = group.getMessages();
        assertEq(messages.length, 2);
        assertEq(messages[0].sender, member1);
        assertEq(messages[0].content, "Message 1");
        assertEq(messages[1].sender, member2);
        assertEq(messages[1].content, "Message 2");
    }

    function testGetMemberStatus() public {
        assertFalse(group.getMemberStatus(member1));

        vm.prank(member1);
        group.joinGroup();

        assertTrue(group.getMemberStatus(member1));
        assertFalse(group.getMemberStatus(nonMember));
    }
}