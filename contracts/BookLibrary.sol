// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract BookLibrary is Ownable {

    struct Book {
        bytes32 id;
        string name;
        string author;
        uint32 copies;
    }
    
    Book[] public allBooks;

    mapping(bytes32 => bool) internal isBookAdded;

    mapping(bytes32 => uint32) internal availableCopiesMap; // id => copies
    mapping(bytes32 => bool) internal isCopyInserted; // id -> bool
    mapping(bytes32 => uint) public availableIdToIndex; // id => index of array
    
    event BookAddedEvent(string name, string author, uint32 copies);

    modifier onlyUniqueBooks(string memory _name, string memory _author) {
        bytes32 hashId = keccak256(abi.encodePacked(_name, _author));
        require (!isBookAdded[hashId], "Book already added");
        _;
    }

    function addNewBook(string memory _name, string memory _author, uint32 _copies) public onlyOwner onlyUniqueBooks(_name, _author) {
        require(bytes(_name).length != 0 && bytes(_author).length != 0, "Book title and author can not be empty");
        require (_copies > 0, "New books' copies must be more than zero");
        bytes32 hashId = keccak256(abi.encodePacked(_name, _author));
        isBookAdded[hashId] = true;
        _setAvailableCopies(hashId, _name, _author, _copies);
        emit BookAddedEvent(_name, _author, _copies);
    }

    function _setAvailableCopies(bytes32 _bookId, string memory _name, string memory _author, uint32 _copies) private {
        availableCopiesMap[_bookId] = _copies;
        isCopyInserted[_bookId] = true;
        allBooks.push(Book(_bookId, _name, _author, _copies));
        availableIdToIndex[_bookId] = allBooks.length - 1;
    }

    function updateAvailableCopies(bytes32 _bookId, uint32 _copies) internal {
        availableCopiesMap[_bookId] = _copies;
        allBooks[availableIdToIndex[_bookId]].copies = availableCopiesMap[_bookId];
    }

}