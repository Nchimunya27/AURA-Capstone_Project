const express = require('express');
const path = require("path");
const collection = require("./config");


const app = express();

//convert data into json format
app.use(express.json());

app.use(express.urlencoded({extended: false}));




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

// Register User
app.post("/signup", async (req, res) =>{
    const data = {
        name: req.body.username,
        password: req.body.password
    }

    const userdata = await collection.insertMany(data);
    console.log(userdata);
})

const port = 9999;
app.listen(port, () => {
    console.log(`Server running on Port: ${port}`);
});