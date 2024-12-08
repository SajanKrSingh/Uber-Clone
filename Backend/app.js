const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const cookies = require("cookie-parser");
const cors = require("cors");
const app = express();
const connectToDb = require("./db/db");
const UserRouter = require("./routes/user.routes");

connectToDb();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookies());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/users", UserRouter);

module.exports = app;
