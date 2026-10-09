var express = require("express");
var router = express.Router();
const bcrypt = require("bcrypt");
const uid2 = require("uid2");
const rateLimit = require("express-rate-limit");

const supabase = require("../models/supabase");
const auth = require("../middleware/auth");

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UNIQUE_VIOLATION = "23505";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Trop de tentatives. Réessaie dans 15 minutes." },
});

function checkBody(body, fields) {
  return fields.every((f) => typeof body[f] === "string" && body[f].trim() !== "");
}

function textOrNull(value) {
  return typeof value === "string" ? value : null;
}

function toTextArray(value) {
  if (value === undefined || value === null) return [];
  return (Array.isArray(value) ? value : [value]).map(String);
}

function toFavorite(row) {
  return { idDrink: row.id_drink, nom: row.nom, image: row.image, addedAt: row.added_at };
}

function toRecipe(row) {
  return {
    _id: row.id,
    user: row.user_id,
    name: row.name,
    type: row.type,
    format: row.format,
    profile: row.profile ?? [],
    glass: row.glass,
    ice: row.ice,
    ingredients: row.ingredients ?? [],
    steps: row.steps ?? [],
    garnish: row.garnish,
    tips: row.tips ?? [],
    mocktailVariant: row.mocktail_variant,
    createdAt: row.created_at,
  };
}

async function getFavorites(userId) {
  const { data, error } = await supabase
    .from("favorites")
    .select("id_drink, nom, image, added_at")
    .eq("user_id", userId)
    .order("added_at", { ascending: true });
  if (error) throw error;
  return data.map(toFavorite);
}

/**
 * -----------------------------
 *  AUTH
 * -----------------------------
 */

router.post("/signup", authLimiter, async (req, res) => {
  try {
    if (!checkBody(req.body, ["username", "email", "password"])) {
      return res
        .status(400)
        .json({ ok: false, error: "Champs manquants ou vides" });
    }

    const { username, email, password } = req.body;

    if (username.trim().length < 4) {
      return res.status(400).json({ ok: false, error: "4 caractères minimum" });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ ok: false, error: "Email invalide" });
    }

    if (password.length < 5) {
      return res.status(400).json({ ok: false, error: "Mot de passe trop court (5 caractères min.)" });
    }

    const hash = await bcrypt.hash(password, 10);
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password: hash,
        token: uid2(32),
      })
      .select("token, username")
      .single();

    if (error?.code === UNIQUE_VIOLATION) {
      return res
        .status(409)
        .json({ ok: false, error: "Utilisateur déjà existant" });
    }
    if (error) throw error;

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

router.post("/signin", authLimiter, async (req, res) => {
  try {
    if (!checkBody(req.body, ["email", "password"])) {
      return res
        .status(400)
        .json({ ok: false, error: "Champs manquants ou vides" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, password")
      .eq("email", req.body.email.trim().toLowerCase())
      .maybeSingle();
    if (error) throw error;

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res
        .status(401)
        .json({ ok: false, error: "Identifiants invalides" });
    }

    const token = uid2(32);
    const { error: updateError } = await supabase
      .from("users")
      .update({ token })
      .eq("id", user.id);
    if (updateError) throw updateError;

    res.json({
      ok: true,
      token,
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

router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      ok: true,
      user: {
        username: req.user.username,
        email: req.user.email,
        favorites: await getFavorites(req.user.id),
      },
    });
  } catch (error) {
    console.error("Erreur GET /me:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

router.delete("/me", auth, async (req, res) => {
  try {
    const { error } = await supabase.from("users").delete().eq("id", req.user.id);
    if (error) throw error;
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

router.get("/favorites", auth, async (req, res) => {
  try {
    res.json({ ok: true, favorites: await getFavorites(req.user.id) });
  } catch (error) {
    console.error("Erreur favorites GET:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

router.post("/favorites", auth, async (req, res) => {
  try {
    const { idDrink, nom, image } = req.body;
    if (!["string", "number"].includes(typeof idDrink) || String(idDrink).trim() === "") {
      return res.status(400).json({ ok: false, error: "idDrink requis" });
    }

    const { count, error: countError } = await supabase
      .from("favorites")
      .select("*", { count: "exact", head: true })
      .eq("user_id", req.user.id);
    if (countError) throw countError;

    if (count >= 500) {
      return res.status(400).json({ ok: false, error: "Limite de 500 favoris atteinte" });
    }

    const { error } = await supabase
      .from("favorites")
      .insert({ user_id: req.user.id, id_drink: String(idDrink), nom: textOrNull(nom), image: textOrNull(image) });

    if (error?.code === UNIQUE_VIOLATION) {
      return res
        .status(409)
        .json({ ok: false, error: "Cocktail déjà en favori" });
    }
    if (error) throw error;

    res.json({ ok: true, favorites: await getFavorites(req.user.id) });
  } catch (error) {
    console.error("Erreur favorites POST:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

router.delete("/favorites/:idDrink", auth, async (req, res) => {
  try {
    const { data: deleted, error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", req.user.id)
      .eq("id_drink", req.params.idDrink)
      .select("id_drink");
    if (error) throw error;

    if (deleted.length === 0) {
      return res.status(404).json({ ok: false, error: "Favori non trouvé" });
    }

    res.json({ ok: true, favorites: await getFavorites(req.user.id) });
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
    const { data, error } = await supabase
      .from("recipes")
      .select("*")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ ok: true, recipes: data.map(toRecipe) });
  } catch (error) {
    console.error("Erreur recipes GET:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

router.post("/recipes", auth, async (req, res) => {
  try {
    const { name, type, format, profile, glass, ice, ingredients, steps, garnish, tips, mocktailVariant } = req.body;
    if (typeof name !== "string" || name.trim() === "") {
      return res
        .status(400)
        .json({ ok: false, error: "Le nom de la recette est requis" });
    }
    const { data, error } = await supabase
      .from("recipes")
      .insert({
        user_id: req.user.id,
        name: name.trim(),
        type: textOrNull(type),
        format: textOrNull(format),
        profile: toTextArray(profile),
        glass: textOrNull(glass),
        ice: textOrNull(ice),
        ingredients: Array.isArray(ingredients) ? ingredients : [],
        steps: toTextArray(steps),
        garnish: textOrNull(garnish),
        tips: toTextArray(tips),
        mocktail_variant: textOrNull(mocktailVariant),
      })
      .select("*")
      .single();
    if (error) throw error;

    res.json({ ok: true, recipe: toRecipe(data) });
  } catch (error) {
    console.error("Erreur recipes POST:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

router.delete("/recipes/:id", auth, async (req, res) => {
  try {
    if (!UUID_REGEX.test(req.params.id)) {
      return res.status(400).json({ ok: false, error: "ID invalide" });
    }

    const { data: deleted, error } = await supabase
      .from("recipes")
      .delete()
      .eq("id", req.params.id)
      .eq("user_id", req.user.id)
      .select("id");
    if (error) throw error;

    if (deleted.length === 0) {
      return res.status(404).json({ ok: false, error: "Recette non trouvée" });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Erreur recipes DELETE:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

/**
 * -----------------------------
 *  VINS FAVORIS (auth requis)
 * -----------------------------
 */

function toWine(row) {
  return { _id: row.id, ...row.data, scanId: row.scan_id, createdAt: row.created_at };
}

router.get("/wines", auth, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("wines")
      .select("id, scan_id, data, created_at")
      .eq("user_id", req.user.id)
      .order("created_at", { ascending: false });
    if (error) throw error;
    res.json({ ok: true, wines: data.map(toWine) });
  } catch (error) {
    console.error("Erreur wines GET:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

router.post("/wines", auth, async (req, res) => {
  try {
    const wine = req.body?.wine;
    if (!wine || typeof wine !== "object" || !UUID_REGEX.test(String(wine.scanId)) || !wine.identity) {
      return res.status(400).json({ ok: false, error: "Fiche vin invalide" });
    }

    const { _id, scanId, createdAt, ...data } = wine;
    const { data: row, error } = await supabase
      .from("wines")
      .upsert(
        { user_id: req.user.id, scan_id: scanId, data },
        { onConflict: "user_id,scan_id" },
      )
      .select("id, scan_id, data, created_at")
      .single();
    if (error) throw error;

    res.json({ ok: true, wine: toWine(row) });
  } catch (error) {
    console.error("Erreur wines POST:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

router.delete("/wines/:scanId", auth, async (req, res) => {
  try {
    if (!UUID_REGEX.test(req.params.scanId)) {
      return res.status(400).json({ ok: false, error: "ID invalide" });
    }

    const { data: deleted, error } = await supabase
      .from("wines")
      .delete()
      .eq("user_id", req.user.id)
      .eq("scan_id", req.params.scanId)
      .select("id");
    if (error) throw error;

    if (deleted.length === 0) {
      return res.status(404).json({ ok: false, error: "Vin non trouvé" });
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Erreur wines DELETE:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
});

module.exports = router;
