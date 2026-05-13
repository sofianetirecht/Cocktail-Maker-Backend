require("dotenv").config();
require("./models/connection");

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ OPENAI_API_KEY manquant dans .env");
  process.exit(1);
}

var express = require("express");
var path = require("path");
var logger = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

var aiRouter = require("./routes/IA");
var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var cocktailRouter = require("./routes/cocktail");

const cocktailLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Trop de requêtes. Réessaie dans une minute." },
});

var app = express();

app.use(helmet());
app.use(cors());
app.use(logger("dev"));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false, limit: "10kb" }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/ai", aiRouter);
app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/cocktail", cocktailLimiter, cocktailRouter);

app.use((req, res) => {
  res.status(404).json({ ok: false, error: "Route introuvable" });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ ok: false, error: "Erreur interne du serveur" });
});

module.exports = app;
