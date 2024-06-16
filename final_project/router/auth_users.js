const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  let existingUser = users.filter((user) => {
    return user.username === username;
  });

  return existingUser.length > 0;
};

const authenticatedUser = (username, password) => {
  let validUsers = users.filter((user) => {
    return user.username === username && user.password === password;
  });

  return validUsers.length > 0;
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign(
      {
        data: password,
      },
      "access",
      { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
      accessToken,
      username,
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const currentUser = req.session.authorization.username;

  if (books[isbn]) {
    books[isbn].reviews[currentUser] = review;
    res.send(books[isbn]);
  } else {
    res.status(400).send(`Error: No book found with ISBN '${isbn}'`);
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  delete books[isbn].reviews[req.session.authorization.username];
  res.send({
    message: `Deleted book review for ${req.session.authorization.username}`,
    book: books[isbn],
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
