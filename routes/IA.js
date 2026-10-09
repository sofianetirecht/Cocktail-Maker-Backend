var express = require("express");
var router = express.Router();
const crypto = require("crypto");
const OpenAI = require("openai/index.js");
const rateLimit = require("express-rate-limit");
const auth = require("../middleware/auth");

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const AI_MODEL = "gpt-6-luna";

const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { ok: false, error: "Trop de requêtes IA. Réessaie dans une minute." },
});

// Helper: sécurise un peu l'entrée utilisateur
function cleanText(s, max = 500) {
  return (s ?? "").toString().trim().slice(0, max);
}

router.post("/original-recipe", auth, aiLimiter, async (req, res) => {
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
      model: AI_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      reasoning_effort: "none",
      max_completion_tokens: 800,
    });

    const content = completion.choices?.[0]?.message?.content || "";

    // On tente de parser le JSON (si l'IA a bien respecté)
    let recipe = null;
    try {
      recipe = JSON.parse(content);
    } catch (e) {
      console.error("Réponse IA non-JSON:", content);
      return res.status(500).json({
        ok: false,
        error: "Réponse IA invalide. Réessaie.",
      });
    }

    return res.json({ ok: true, recipe });
  } catch (error) {
    console.error("AI original-recipe error:", error);
    return res.status(500).json({ ok: false, error: "Erreur IA" });
  }
});

const MAX_IMAGE_BASE64_LENGTH = 1_500_000;

const nullable = (schema) => ({ anyOf: [schema, { type: "null" }] });
const str = { type: "string" };
const scale = { type: "integer", minimum: 1, maximum: 5 };
const obj = (properties) => ({
  type: "object",
  properties,
  required: Object.keys(properties),
  additionalProperties: false,
});

const WINE_SCHEMA = obj({
  status: { type: "string", enum: ["ok", "unreadable", "not_wine"] },
  wine: nullable(
    obj({
      precision: { type: "string", enum: ["élevée", "moyenne", "faible"] },
      taste: obj({
        body: scale,
        tannins: nullable(scale),
        acidity: scale,
        sweetness: { type: "string", enum: ["sec", "demi-sec", "moelleux", "doux"] },
        aromas: { type: "array", items: str, maxItems: 6 },
        summary: str,
      }),
      identity: obj({
        name: nullable(str),
        producer: nullable(str),
        appellation: nullable(str),
        region: nullable(str),
        country: nullable(str),
        vintage: nullable({ type: "integer" }),
        color: { type: "string", enum: ["rouge", "blanc", "rosé", "effervescent", "liquoreux"] },
        abv: nullable({ type: "number" }),
        mentions: { type: "array", items: str, maxItems: 4 },
      }),
      fromLabel: {
        type: "array",
        items: {
          type: "string",
          enum: ["name", "producer", "appellation", "region", "country", "vintage", "abv", "mentions", "grapes"],
        },
      },
      grapes: {
        type: "array",
        items: obj({ name: str, percent: nullable({ type: "integer" }) }),
        maxItems: 6,
      },
      service: obj({
        tempMin: { type: "integer" },
        tempMax: { type: "integer" },
        decant: nullable(str),
        glass: str,
      }),
      pairings: { type: "array", items: str, maxItems: 5 },
      price: obj({ min: { type: "integer" }, max: { type: "integer" } }),
      tips: { type: "array", items: str, maxItems: 4 },
    }),
  ),
});

const WINE_SYSTEM_PROMPT = `
Tu es sommelier. On te montre la photo d'une étiquette de vin.
1. Lis l'étiquette. N'invente jamais un texte qui n'y figure pas.
2. Complète avec tes connaissances (appellation, région, millésime) ce qui n'est pas écrit.
3. "fromLabel" liste uniquement les champs dont la valeur est écrite telle quelle sur l'étiquette (ex. "Gironde" écrit ne rend pas "Bordeaux" lu).
4. Champ inconnu et non déductible : null. "tannins" est null pour les blancs, rosés et effervescents.
5. "precision" reflète ta certitude globale sur la fiche (cuvée précise identifiée = élevée, seulement l'appellation = moyenne, devinette = faible).
6. Prix en euros, fourchette de prix public en caviste en France.
7. Textes en français, courts : "summary" en une phrase, chaque arôme en 1 à 3 mots, chaque accord et chaque conseil en une ligne.
8. "tips" : ce qu'il est utile de savoir avant d'acheter (style du millésime, pour quel amateur, rapport qualité-prix…).
9. "decant" : durée de carafage conseillée (ex. "1 h") ou null si inutile.
Si la photo n'est pas une étiquette de vin : status "not_wine". Si elle est illisible : status "unreadable". Dans ces deux cas, wine = null.
`.trim();

router.post("/wine-scan", auth, aiLimiter, async (req, res) => {
  try {
    const image = req.body?.image;
    if (typeof image !== "string" || !/^[A-Za-z0-9+/=]+$/.test(image.slice(0, 100))) {
      return res.status(400).json({ ok: false, error: "Photo manquante" });
    }
    if (image.length > MAX_IMAGE_BASE64_LENGTH) {
      return res.status(413).json({ ok: false, error: "Photo trop lourde" });
    }

    const completion = await client.chat.completions.create({
      model: AI_MODEL,
      messages: [
        { role: "system", content: WINE_SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:image/jpeg;base64,${image}` } },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "wine_scan", strict: true, schema: WINE_SCHEMA },
      },
      reasoning_effort: "none",
      max_completion_tokens: 900,
    });

    const result = JSON.parse(completion.choices?.[0]?.message?.content || "{}");

    if (result.status === "not_wine") {
      return res.status(422).json({ ok: false, error: "Ce n'est pas une étiquette de vin" });
    }
    if (result.status !== "ok" || !result.wine) {
      return res.status(422).json({
        ok: false,
        error: "Étiquette illisible, rapproche-toi et évite les reflets",
      });
    }

    return res.json({ ok: true, wine: { ...result.wine, scanId: crypto.randomUUID() } });
  } catch (error) {
    console.error("AI wine-scan error:", error);
    return res.status(500).json({ ok: false, error: "Analyse impossible. Réessaie." });
  }
});

module.exports = router;
