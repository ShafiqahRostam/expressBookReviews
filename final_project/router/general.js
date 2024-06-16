const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username: username, password: password });
      return res.status(200).json({ message: "User successfully registered. Now you can login." });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

// Get the book list available in the shop
const getAllBooks = () => {
  return new Promise((resolve) => {
    resolve(books);
  });
};

public_users.get("/", function (req, res) {
  getAllBooks()
    .then((booksData) => res.send(booksData))
    .catch((err) => res.send(`Error: ${err}`));
});

// Get book details based on ISBN
const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    if (books[isbn]) resolve(books[isbn]);
    else reject(`No book found with ISBN '${isbn}'`);
  });
};

public_users.get("/isbn/:isbn", function (req, res) {
  getBookByISBN(req.params.isbn)
    .then((booksData) => res.send(booksData))
    .catch((err) => res.send(`Error: ${err}`));
});

// Get book details based on author
const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    const booksByAuthor = [];
    for (let isbn in books) {
      if (books[isbn].author === author) {
        booksByAuthor.push(books[isbn]);
      }
    }
    if (booksByAuthor.length > 0) resolve(booksByAuthor);
    else reject(`No books found by author '${author}'`);
  });
};

public_users.get("/author/:author", function (req, res) {
  getBooksByAuthor(req.params.author)
    .then((booksData) => res.send(booksData))
    .catch((err) => res.send(`Error: ${err}`));
});

// Get all books based on title
const getBookByTitle = (title) => {
  return new Promise((resolve, reject) => {
    for (let isbn in books) {
      if (books[isbn].title === title) {
        resolve(books[isbn]);
      }
    }
    reject(`No book found with title '${title}'`);
  });
};

public_users.get("/title/:title", function (req, res) {
  getBookByTitle(req.params.title)
    .then((booksData) => res.send(booksData))
    .catch((err) => res.send(`Error: ${err}`));
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

module.exports.general = public_users;
