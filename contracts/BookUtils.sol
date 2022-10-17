// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;
pragma abicoder v2;

import "./BookBorrow.sol";

contract BookUtils is BookBorrow {

    function showAvailableBooks() external view returns(AvailableBookDetails[] memory) {
        return availableBookDetails;
    }

    function historyOfBorrowAddresses(uint32 _bookId) external view returns(address[] memory) {
        return historyAddresses[_bookId].addresses;
    }

}