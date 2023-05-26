const express = require("express");
const app = express();
const PORT = 1234;
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const {
    DB_HOST,
    DB_NAME,
    DB_PORT
} = process.env;
//LOCAL DB CONNECTION
mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`);

//ONLINE DB CONNECTION
// mongoose.connect("mongodb://mongo:2a2vOSAP9L0B5Icgtf66@containers-us-west-196.railway.app:5683/");
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/users", require("./api/users"));
app.use("/products", require("./api/products"));
app.use("/carts", require("./api/carts"));
app.use("/orders", require("./api/orders"));



app.listen(PORT, () => console.log("Server is running on PORT: " + PORT));
mongoose.connection.once("open", () => console.log("Connected to MongoDB"));