const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");

const app = express();

// Use EJS as the view engine
app.set('view engine', 'ejs');

// Set the views directory path
app.set('views', path.join(__dirname, '..', 'views'));

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// Define routes
app.get("/login", (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

app.get("/", (req, res) => {
    res.render("login");
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server running on Port: ${port}`);
});