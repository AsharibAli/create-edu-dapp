// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Test.sol";
import "../src/StudyTracker.sol";

contract StudyTrackerTest is Test {
    StudyTracker public tracker;
    address public student1;
    address public student2;

    function setUp() public {
        tracker = new StudyTracker();
        student1 = address(0x1);
        student2 = address(0x2);
    }

    function testRecordStudySession() public {
        vm.prank(student1);
        tracker.recordStudySession(3600); // 1 hour

        assertEq(tracker.studyTimes(student1), 3600);
    }

    function testMultipleStudySessions() public {
        vm.startPrank(student1);
        tracker.recordStudySession(3600); // 1 hour
        tracker.recordStudySession(1800); // 30 minutes
        vm.stopPrank();

        assertEq(tracker.studyTimes(student1), 5400); // 1.5 hours
    }

    function testMultipleStudents() public {
        vm.prank(student1);
        tracker.recordStudySession(3600); // 1 hour

        vm.prank(student2);
        tracker.recordStudySession(7200); // 2 hours

        assertEq(tracker.studyTimes(student1), 3600);
        assertEq(tracker.studyTimes(student2), 7200);
    }

    function testGetTotalStudyTime() public {
        vm.startPrank(student1);
        tracker.recordStudySession(3600); // 1 hour
        tracker.recordStudySession(1800); // 30 minutes

        uint256 totalTime = tracker.getTotalStudyTime();
        assertEq(totalTime, 5400); // 1.5 hours
        vm.stopPrank();
    }

    function testZeroInitialStudyTime() public {
        assertEq(tracker.studyTimes(student1), 0);
        assertEq(tracker.getTotalStudyTime(), 0);
    }

    function testLargeStudyTime() public {
        uint256 largeTime = 1000000000; // A very large number
        vm.prank(student1);
        tracker.recordStudySession(largeTime);

        assertEq(tracker.studyTimes(student1), largeTime);
    }
}