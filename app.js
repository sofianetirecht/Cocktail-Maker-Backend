require("dotenv").config();
require("./models/connection");

var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const cors = require("cors");

var aiRouter = require("./routes/IA");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var cocktailRouter = require("./routes/cocktail");
var ingredientRouter = require("./routes/cocktail");

var app = express();

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/ai", aiRouter);
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/cocktail", cocktailRouter);
app.use("/ingredient", ingredientRouter);
module.exports = app;
