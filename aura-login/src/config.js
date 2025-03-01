const mongoose = require("mongoose");
const connect = mongoose.connect("mongodb://localhost:27017/Login");

// check database connection or not

connect.then(() => {

    console.log("Database connected Successfully.");

})
.catch(() => {

    console.log("Database cannot be connected.");

});

// create a schema
const LogInSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true

    },
    password: {
        type: String,
        required: true
    }
});

// collection Port
const collection = new mongoose.model("users", LogInSchema);

module.exports = collection;