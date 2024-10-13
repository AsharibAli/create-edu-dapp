// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/AssignmentSubmission.sol";

contract AssignmentSubmissionTest is Test {
    AssignmentSubmission public submission;
    address public educator;
    address public student;

    function setUp() public {
        educator = address(this);
        student = address(0x1);
        submission = new AssignmentSubmission();
    }

    function testSubmitAssignment() public {
        vm.prank(student);
        submission.submitAssignment("hash1");
        
        assertEq(submission.getSubmissionsCount(), 1);
        
        (address submitter, string memory hash, uint256 timestamp, bool verified) = submission.getSubmission(0);
        assertEq(submitter, student);
        assertEq(hash, "hash1");
        assertEq(verified, false);
    }

    function testAddEducator() public {
        address newEducator = address(0x2);
        submission.addEducator(newEducator);
        
        vm.prank(newEducator);
        submission.addEducator(address(0x3)); // This should work now
    }

    function testOnlyEducatorCanVerify() public {
        vm.prank(student);
        submission.submitAssignment("hash2");

        vm.prank(student);
        vm.expectRevert("Only educators can call this function");
        submission.verifySubmission(0);

        submission.verifySubmission(0); // Should work for the original educator
    }

    function testVerifySubmission() public {
        vm.prank(student);
        submission.submitAssignment("hash3");

        submission.verifySubmission(0);
        
        (, , , bool verified) = submission.getSubmission(0);
        assertTrue(verified);
    }

    function testCannotVerifyNonexistentSubmission() public {
        vm.expectRevert("Invalid submission index");
        submission.verifySubmission(0);
    }

    function testCannotVerifyAlreadyVerifiedSubmission() public {
        vm.prank(student);
        submission.submitAssignment("hash4");

        submission.verifySubmission(0);
        
        vm.expectRevert("Submission already verified");
        submission.verifySubmission(0);
    }

    function testGetSubmissionsCount() public {
        assertEq(submission.getSubmissionsCount(), 0);

        vm.prank(student);
        submission.submitAssignment("hash5");
        assertEq(submission.getSubmissionsCount(), 1);

        vm.prank(student);
        submission.submitAssignment("hash6");
        assertEq(submission.getSubmissionsCount(), 2);
    }
}