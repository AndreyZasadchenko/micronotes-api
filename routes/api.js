const express = require("express");
const authRouter = require("./auth");
const noteRouter = require("./note");

const app = express();

app.use("/auth/", authRouter);
app.use("/note/", noteRouter);

module.exports = app;
