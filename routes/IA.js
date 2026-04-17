require("dotenv").config();
var express = require("express");
var router = express.Router();
const OpenAI = require("openai/index.js");
// cocktail generé par ia
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Helper: sécurise un peu l'entrée utilisateur
function cleanText(s, max = 500) {
  return (s ?? "").toString().trim().slice(0, max);
}

router.post("/original-recipe", async (req, res) => {
  try {
    const {
      tastes, // ex: "sucré, acidulé"
      ingredients, // ex: "vodka, citron, passion"
      isLongDrink, // true/false
      isMocktail, // true/false
      strength, // ex: "léger" | "normal" | "fort"
      constraints, // ex: "sans lait", "sans oeuf"
    } = req.body || {};

    const tastesClean = cleanText(tastes, 200);
    const ingredientsClean = cleanText(ingredients, 400);
    const constraintsClean = cleanText(constraints, 300);
    const strengthClean = cleanText(strength, 50);

    if (!tastesClean && !ingredientsClean) {
      return res.status(400).json({
        ok: false,
        error: "Donne au moins tes goûts ou des ingrédients.",
      });
    }

    const cocktailType = isMocktail
      ? "mocktail (sans alcool)"
      : "cocktail (alcoolisé)";
    const drinkLength = isLongDrink ? "long drink" : "short drink";

    const system = `
Tu es un barman créatif et précis.
Tu inventes des recettes originales et réalistes.
Tu utilises uniquement des unités métriques (cl, ml) et une écriture française naturelle.
Tu respectes le type de boisson demandé (mocktail/cocktail) et le format (long/short).
Tu évites d'inventer des ingrédients introuvables si l'utilisateur en a donné une liste.
tu peux ajoueter des ingrédients originaux pour compléter la recette, mais pas en trop grand nombre.
Réponds en JSON STRICT, sans texte autour.
`.trim();

    const user = `
Crée UNE recette originale.
Type: ${cocktailType}
Format: ${drinkLength}
Puissance: ${strengthClean || "normal"}
Goûts recherchés: ${tastesClean || "libre"}
Ingrédients disponibles (si vide, tu proposes toi-même): ${ingredientsClean || "aucun"}
Contraintes/allergies: ${constraintsClean || "aucune"}

JSON attendu (strict):
{
  "name": "Nom du cocktail",
  "type": "cocktail|mocktail",
  "format": "long|short",
  "profile": ["sucré","acidulé","amer","fruité","floral","épicé","sec"],
  "glass": "type de verre",
  "ice": "avec/sans glace + type si besoin",
  "ingredients": [
    {"name": "ingrédient", "amount": "x cl|ml|1 trait|au goût", "role": "base|acid|sweet|bitter|aroma|top"}
  ],
  "steps": ["étape 1", "étape 2", "étape 3"],
  "garnish": "décoration",
  "tips": ["conseil 1", "conseil 2"],
  "mocktailVariant": "si cocktail, propose une variante sans alcool, sinon null"
}
`.trim();

    const completion = await client.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.9,
      max_tokens: 800,
    });

    const content = completion.choices?.[0]?.message?.content || "";

    // On tente de parser le JSON (si l'IA a bien respecté)
    let recipe = null;
    try {
      recipe = JSON.parse(content);
    } catch (e) {
      return res.status(500).json({
        ok: false,
        error: "Réponse IA non-JSON (à ajuster).",
        raw: content,
      });
    }

    return res.json({ ok: true, recipe });
  } catch (error) {
    console.error("AI original-recipe error:", error);
    return res.status(500).json({ ok: false, error: "Erreur IA" });
  }
});

module.exports = router;
