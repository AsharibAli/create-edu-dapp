// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/AnonymousFeedback.sol";

contract AnonymousFeedbackTest is Test {
    AnonymousFeedback public feedback;

    function setUp() public {
        feedback = new AnonymousFeedback();
    }

    function testSubmitFeedback() public {
        string memory testFeedback = "This is a test feedback";
        feedback.submitFeedback(testFeedback);
        
        assertEq(feedback.getFeedbackCount(), 1);
        assertEq(feedback.getFeedbackByIndex(0), testFeedback);
    }

    function testEmptyFeedback() public {
        vm.expectRevert("Feedback cannot be empty");
        feedback.submitFeedback("");
    }

    function testMultipleFeedbacks() public {
        string[3] memory testFeedbacks = [
            "First feedback",
            "Second feedback",
            "Third feedback"
        ];

        for (uint i = 0; i < testFeedbacks.length; i++) {
            feedback.submitFeedback(testFeedbacks[i]);
        }

        assertEq(feedback.getFeedbackCount(), 3);

        for (uint i = 0; i < testFeedbacks.length; i++) {
            assertEq(feedback.getFeedbackByIndex(i), testFeedbacks[i]);
        }
    }

    function testGetAllFeedback() public {
        string[3] memory testFeedbacks = [
            "Feedback 1",
            "Feedback 2",
            "Feedback 3"
        ];

        for (uint i = 0; i < testFeedbacks.length; i++) {
            feedback.submitFeedback(testFeedbacks[i]);
        }

        string[] memory allFeedback = feedback.getAllFeedback();
        assertEq(allFeedback.length, 3);

        for (uint i = 0; i < testFeedbacks.length; i++) {
            assertEq(allFeedback[i], testFeedbacks[i]);
        }
    }

    function testGetFeedbackByInvalidIndex() public {
        vm.expectRevert("Index out of bounds");
        feedback.getFeedbackByIndex(0);
    }
}