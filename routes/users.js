var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const uid2 = require("uid2");

const User = require("../models/users");
const Recipe = require("../models/recipes");
const auth = require("../middleware/auth");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function checkBody(body, fields) {
  return fields.every(
    (f) => body[f] !== undefined && body[f] !== null && body[f] !== "",
  );
}

/**
 * -----------------------------
 *  AUTH
 * -----------------------------
 */

router.post("/signup", async (req, res) => {
  try {
    if (!checkBody(req.body, ["username", "email", "password"])) {
      return res
        .status(400)
        .json({ ok: false, error: "Champs manquants ou vides" });
    }

    const { username, email, password } = req.body;

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ ok: false, error: "Email invalide" });
    }

    const existing = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existing) {
      return res
        .status(409)
        .json({ ok: false, error: "Utilisateur déjà existant" });
    }

    const hash = bcrypt.hashSync(password, 10);
    const newUser = await new User({
      username,
      email,
      password: hash,
      token: uid2(32),
      favorites: [],
    }).save();

    res.json({
      ok: true,
      token: newUser.token,
      username: newUser.username,
    });
  } catch (error) {
    console.error("Erreur signup:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

router.post("/signin", async (req, res) => {
  try {
    if (!checkBody(req.body, ["email", "password"])) {
      return res
        .status(400)
        .json({ ok: false, error: "Champs manquants ou vides" });
    }

    const user = await User.findOne({ email: req.body.email.toLowerCase() });

    if (!user || !bcrypt.compareSync(req.body.password, user.password)) {
      return res
        .status(401)
        .json({ ok: false, error: "Identifiants invalides" });
    }

    res.json({
      ok: true,
      token: user.token,
      username: user.username,
    });
  } catch (error) {
    console.error("Erreur signin:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

/**
 * -----------------------------
 *  PROFIL (auth requis)
 * -----------------------------
 */

router.get("/me", auth, (req, res) => {
  res.json({
    ok: true,
    user: {
      username: req.user.username,
      email: req.user.email,
      favorites: req.user.favorites,
    },
  });
});

router.delete("/me", auth, async (req, res) => {
  try {
    await Recipe.deleteMany({ user: req.user._id });
    await User.deleteOne({ _id: req.user._id });
    res.json({ ok: true });
  } catch (error) {
    console.error("Erreur DELETE /me:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

/**
 * -----------------------------
 *  FAVORIS (auth requis)
 * -----------------------------
 */

router.get("/favorites", auth, (req, res) => {
  res.json({ ok: true, favorites: req.user.favorites });
});

router.post("/favorites", auth, async (req, res) => {
  try {
    if (!checkBody(req.body, ["idDrink"])) {
      return res.status(400).json({ ok: false, error: "idDrink requis" });
    }

    const { idDrink, nom, image } = req.body;

    if (req.user.favorites.some((f) => f.idDrink === idDrink)) {
      return res
        .status(409)
        .json({ ok: false, error: "Cocktail déjà en favori" });
    }

    req.user.favorites.push({ idDrink, nom, image });
    await req.user.save();

    res.json({ ok: true, favorites: req.user.favorites });
  } catch (error) {
    console.error("Erreur favorites POST:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

router.delete("/favorites/:idDrink", auth, async (req, res) => {
  try {
    const before = req.user.favorites.length;
    req.user.favorites = req.user.favorites.filter(
      (f) => f.idDrink !== req.params.idDrink,
    );

    if (req.user.favorites.length === before) {
      return res.status(404).json({ ok: false, error: "Favori non trouvé" });
    }

    await req.user.save();
    res.json({ ok: true, favorites: req.user.favorites });
  } catch (error) {
    console.error("Erreur favorites DELETE:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

/**
 * -----------------------------
 *  RECETTES IA (auth requis)
 * -----------------------------
 */

router.get("/recipes", auth, async (req, res) => {
  try {
    const recipes = await Recipe.find({ user: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ ok: true, recipes });
  } catch (error) {
    console.error("Erreur recipes GET:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

router.post("/recipes", auth, async (req, res) => {
  try {
    if (!checkBody(req.body, ["name"])) {
      return res
        .status(400)
        .json({ ok: false, error: "Le nom de la recette est requis" });
    }

    const recipe = await new Recipe({
      user: req.user._id,
      ...req.body,
    }).save();

    res.json({ ok: true, recipe });
  } catch (error) {
    console.error("Erreur recipes POST:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

router.delete("/recipes/:id", auth, async (req, res) => {
  try {
    const result = await Recipe.deleteOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ ok: false, error: "Recette non trouvée" });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Erreur recipes DELETE:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

module.exports = router;
