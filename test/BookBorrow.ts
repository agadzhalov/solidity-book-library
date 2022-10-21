import { expect } from "chai";
import { ethers } from "hardhat";
import { BookBorrow } from "../typechain-types";
import type { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("BookBorrow", function () {
    
    let bookBorrowFactory: any;
    let bookBorrow: BookBorrow;

    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    beforeEach(async () => {
        [owner, addr1, addr2] = await ethers.getSigners();
        bookBorrowFactory = await ethers.getContractFactory("BookBorrow");
        bookBorrow = await bookBorrowFactory.deploy();
        await bookBorrow.deployed();
    });

    it("Should borrow a book", async function () {
        const addNewBookTx = await bookBorrow.addNewBook("The Godfather", "Mario Puzo", 5);
        await addNewBookTx.wait();

        const borrowABookTx = await bookBorrow.borrowABook(1);
        await borrowABookTx.wait();

        expect(await bookBorrow.borrowedBooks(owner.address, 1)).to.equal(true);
    });

    it("Should throw on trying to borrow the same book twice", async function () {
        const addNewBookTx = await bookBorrow.addNewBook("The Godfather", "Mario Puzo", 5);
        await addNewBookTx.wait();

        const borrowABookTx = await bookBorrow.borrowABook(1);
        await borrowABookTx.wait();

        await expect(bookBorrow.borrowABook(1)).to.be.revertedWith("You can borrow only one copy of this book");
    });
    
    it("Should throw on trying to borrow a book which is not available", async function () {
        const addNewBookTx = await bookBorrow.addNewBook("The Godfather", "Mario Puzo", 2);
        await addNewBookTx.wait();
 
        const borrowABookTx = await bookBorrow.connect(addr1).borrowABook(1);
        await borrowABookTx.wait();
        
        const borrowABookSecondTimeTx = await bookBorrow.connect(addr2).borrowABook(1);
        await borrowABookSecondTimeTx.wait();
        
        await expect(bookBorrow.connect(owner).borrowABook(1)).to.be.revertedWith("Book copy is not available.");
    });

    it("Should throw on trying to borrow a book not inserted", async function () {
        await expect(bookBorrow.borrowABook(0)).to.be.revertedWith("Book copy is not available."); // think more on this case
        await expect(bookBorrow.borrowABook(1)).to.be.revertedWith("Non existing book ID");
        await expect(bookBorrow.borrowABook(4253)).to.be.revertedWith("Non existing book ID");
    });

    it("Should return a borrowed book", async function () {
        const addNewBookTx = await bookBorrow.addNewBook("The Godfather", "Mario Puzo", 2);
        await addNewBookTx.wait();

        const borrowABookTx = await bookBorrow.borrowABook(1);
        await borrowABookTx.wait();
       
        const returnABookTx = await bookBorrow.returnBook(1);
        await returnABookTx.wait();

        expect(await bookBorrow.borrowedBooks(owner.address, 1)).to.equal(false);
    });

    it("Should throw when trying to return a book user hadn't borrowed", async function () {
        const addNewBookTx = await bookBorrow.addNewBook("The Godfather", "Mario Puzo", 2);
        await addNewBookTx.wait();       
        
        await  expect(bookBorrow.returnBook(1)).to.be.revertedWith("You didn't borrow this book");
    });
    
    it("Should throw when trying to return a book with non existing ID", async function () {
        const addNewBookTx = await bookBorrow.addNewBook("The Godfather", "Mario Puzo", 2);
        await addNewBookTx.wait();       
        
        await  expect(bookBorrow.returnBook(5)).to.be.revertedWith("Non existing book ID");
    });

    it("Should be able to borrow a book when returned from others", async function () {
        const addNewBookTx = await bookBorrow.addNewBook("The Godfather", "Mario Puzo", 1);
        await addNewBookTx.wait();  
        
        const borrowAddr1BookTx = await bookBorrow.connect(addr1).borrowABook(1);
        await borrowAddr1BookTx.wait();

        expect(await bookBorrow.borrowedBooks(addr1.address, 1)).to.equal(true);

        const returnAddr1BookTx = await bookBorrow.connect(addr1).returnBook(1);
        await returnAddr1BookTx.wait();

        const borrowOwnerBookTx = await bookBorrow.connect(owner).borrowABook(1);
        await borrowOwnerBookTx.wait();
        expect(await bookBorrow.borrowedBooks(owner.address, 1)).to.equal(true);
    });
    
    it("Should be able to borrow the same book after return", async function () {
        const addNewBookTx = await bookBorrow.addNewBook("The Godfather", "Mario Puzo", 5);
        await addNewBookTx.wait();

        const borrowABookTx = await bookBorrow.borrowABook(1);
        await borrowABookTx.wait();

        const returnABookTx = await bookBorrow.returnBook(1);
        await returnABookTx.wait();

        const borrowABookTx2 = await bookBorrow.borrowABook(1);
        await borrowABookTx2.wait();

        expect(await bookBorrow.borrowedBooks(owner.address, 1)).to.equal(true);
    });

    it("Shoud sent event that a book was borrowed", async function () {
        const addNewBookTx = await bookBorrow.addNewBook("The Godfather", "Mario Puzo", 5);
        await addNewBookTx.wait();

        const borrowABookTx = await bookBorrow.borrowABook(1);
        await borrowABookTx.wait();
        
        const book = await bookBorrow.books(0);
        await expect(borrowABookTx).to.emit(bookBorrow, 'BookBorrowedEvent').withArgs(book.name, book.author);
    });

    it("Shoud sent event that a book was returned", async function () {
        const addNewBookTx = await bookBorrow.addNewBook("The Godfather", "Mario Puzo", 5);
        await addNewBookTx.wait();

        const borrowABookTx = await bookBorrow.borrowABook(1);
        await borrowABookTx.wait();
        
        const returnBookTx = await bookBorrow.returnBook(1);
        await returnBookTx.wait();

        const book = await bookBorrow.books(0);
        await expect(returnBookTx).to.emit(bookBorrow, 'BookReturnEvent').withArgs(book.name, book.author);
    });
});
