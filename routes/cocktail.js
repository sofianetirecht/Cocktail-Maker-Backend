var express = require("express");
var router = express.Router();

/**
 * -----------------------------
 *  DICTIONNAIRES DE TRADUCTION
 * -----------------------------
 */

// FR -> EN (pour la recherche)
const ingredientsFrToEn = {
  // Alcools
  vodka: "vodka",
  rhum: "rum",
  rum: "rum",
  gin: "gin",
  tequila: "tequila",
  whisky: "whiskey",
  whiskey: "whiskey",
  cognac: "cognac",
  brandy: "brandy",
  champagne: "champagne",
  vin: "wine",
  biere: "beer",
  bière: "beer",
  sake: "sake",
  absinthe: "absinthe",
  amaretto: "amaretto",
  baileys: "baileys",
  "triple sec": "triple sec",
  cointreau: "cointreau",

  // Fruits
  citron: "lemon",
  citronvert: "lime",
  "citron vert": "lime",
  lime: "lime",
  orange: "orange",
  pamplemousse: "grapefruit",
  ananas: "pineapple",
  fraise: "strawberry",
  framboise: "raspberry",
  myrtille: "blueberry",
  cerise: "cherry",
  peche: "peach",
  pêche: "peach",
  mangue: "mango",
  banane: "banana",
  pomme: "apple",
  poire: "pear",
  pastèque: "watermelon",
  pasteque: "watermelon",
  melon: "melon",
  kiwi: "kiwi",

  // Passion (FR)
  passion: "passion",
  "fruit de la passion": "passion fruit",
  "jus de fruit de la passion": "passion fruit juice",
  "sirop de fruit de la passion": "passion fruit syrup",
  "purée de fruit de la passion": "passion fruit puree",
  "puree de fruit de la passion": "passion fruit puree",
  maracuja: "passion fruit",
  passoa: "passoa",

  // Herbes et épices
  menthe: "mint",
  basilic: "basil",
  thym: "thyme",
  romarin: "rosemary",
  coriandre: "coriander",
  gingembre: "ginger",
  cannelle: "cinnamon",
  vanille: "vanilla",

  // Autres ingrédients
  sucre: "sugar",
  sel: "salt",
  miel: "honey",
  sirop: "syrup",
  cafe: "coffee",
  café: "coffee",
  chocolat: "chocolate",
  cacao: "cocoa",
  lait: "milk",
  creme: "cream",
  crème: "cream",
  eau: "water",
  glace: "ice",
  soda: "soda",
  tonic: "tonic",
  cola: "cola",
  "jus de citron": "lemon juice",
  "jus d'orange": "orange juice",
  "jus de pomme": "apple juice",
  "jus d'ananas": "pineapple juice",
  olive: "olive",
  concombre: "cucumber",
  tomate: "tomato",
  piment: "chili",
  poivre: "pepper",
};

// EN -> FR (pour l'affichage) ✅ IMPORTANT: uniquement des strings
const ingredientsEnToFr = {
  // Alcools
  vodka: "Vodka",
  rum: "Rhum",
  "light rum": "Rhum blanc",
  "dark rum": "Rhum brun",
  "spiced rum": "Rhum épicé",
  gin: "Gin",
  tequila: "Tequila",
  whiskey: "Whisky",
  bourbon: "Bourbon",
  scotch: "Scotch",
  cognac: "Cognac",
  brandy: "Brandy",
  champagne: "Champagne",
  wine: "Vin",
  "white wine": "Vin blanc",
  "red wine": "Vin rouge",
  beer: "Bière",
  sake: "Saké",
  absinthe: "Absinthe",
  amaretto: "Amaretto",
  baileys: "Baileys",
  "triple sec": "Triple sec",
  cointreau: "Cointreau",
  vermouth: "Vermouth",
  kahlua: "Kahlua",
  "grand marnier": "Grand Marnier",

  // Fruits
  lemon: "Citron",
  "lemon juice": "Jus de citron",
  "lemon peel": "Zeste de citron",
  "lemon zest": "Zeste de citron",
  lime: "Citron vert",
  "lime juice": "Jus de citron vert",
  "lime peel": "Zeste de citron vert",
  "lime zest": "Zeste de citron vert",
  orange: "Orange",
  "orange juice": "Jus d'orange",
  "orange peel": "Zeste d'orange",
  "orange zest": "Zeste d'orange",
  grapefruit: "Pamplemousse",
  "grapefruit juice": "Jus de pamplemousse",
  "grapefruit peel": "Zeste de pamplemousse",
  "grapefruit zest": "Zeste de pamplemousse",
  pineapple: "Ananas",
  "pineapple juice": "Jus d'ananas",
  strawberry: "Fraise",
  raspberry: "Framboise",
  blueberry: "Myrtille",
  cherry: "Cerise",
  peach: "Pêche",
  mango: "Mangue",
  banana: "Banane",
  apple: "Pomme",
  "apple juice": "Jus de pomme",
  pear: "Poire",
  watermelon: "Pastèque",
  melon: "Melon",
  kiwi: "Kiwi",
  cranberry: "Canneberge",
  "cranberry juice": "Jus de canneberge",

  // Passion (EN)
  "passion fruit": "Fruit de la passion",
  "passion fruit juice": "Jus de fruit de la passion",
  "passion fruit syrup": "Sirop de fruit de la passion",
  "passion fruit puree": "Purée de fruit de la passion",
  passionfruit: "Fruit de la passion",
  passoa: "Passoã",

  // Herbes et épices
  mint: "Menthe",
  basil: "Basilic",
  thyme: "Thym",
  rosemary: "Romarin",
  coriander: "Coriandre",
  ginger: "Gingembre",
  cinnamon: "Cannelle",
  vanilla: "Vanille",

  // Autres ingrédients
  sugar: "Sucre",
  "powdered sugar": "Sucre glace",
  salt: "Sel",
  honey: "Miel",
  syrup: "Sirop",
  "simple syrup": "Sirop de sucre",
  "grenadine syrup": "Sirop de grenadine",
  coffee: "Café",
  "espresso coffee": "Café espresso",
  chocolate: "Chocolat",
  cocoa: "Cacao",
  milk: "Lait",
  cream: "Crème",
  "heavy cream": "Crème épaisse",
  "whipped cream": "Crème fouettée",
  water: "Eau",
  "tonic water": "Eau tonique",
  "soda water": "Eau gazeuse",
  "sparkling water": "Eau pétillante",
  ice: "Glace",
  soda: "Soda",
  tonic: "Tonic",
  cola: "Cola",
  olive: "Olive",
  cucumber: "Concombre",
  tomato: "Tomate",
  "tomato juice": "Jus de tomate",
  chili: "Piment",
  pepper: "Poivre",
  "black pepper": "Poivre noir",
  egg: "Œuf",
  "egg white": "Blanc d'œuf",
  "egg yolk": "Jaune d'œuf",
  coconut: "Noix de coco",
  "coconut cream": "Crème de coco",
  nutmeg: "Noix de muscade",
  angostura: "Angostura",
  bitters: "Bitters",
};

/**
 * -----------------------------
 *  HELPERS (normalisation / traduction)
 * -----------------------------
 */

function normalizeIngredientText(value) {
  return (value ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const ingredientsFrToEnNormalized = Object.entries(ingredientsFrToEn).reduce(
  (acc, [key, value]) => {
    acc[normalizeIngredientText(key)] = value;
    return acc;
  },
  {},
);

function translateIngredient(ingredientFr) {
  const normalized = normalizeIngredientText(ingredientFr);
  return ingredientsFrToEnNormalized[normalized] || ingredientFr;
}

function translateIngredientToFr(ingredientEn) {
  const key = normalizeIngredientText(ingredientEn);
  return ingredientsEnToFr[key] || ingredientEn;
}

function cocktailContainsIngredient(drink, ingredientEn) {
  const target = normalizeIngredientText(ingredientEn);
  if (!target) return false;

  for (let i = 1; i <= 15; i++) {
    const ing = drink[`strIngredient${i}`];
    if (!ing) continue;

    const normalizedIng = normalizeIngredientText(ing);
    if (normalizedIng.includes(target) || target.includes(normalizedIng)) {
      return true;
    }
  }
  return false;
}

/**
 * -----------------------------
 *  RECHERCHE “ENGLOBANTE”
 * -----------------------------
 */

const FR_CATEGORIES = {
  alcohols: new Set([
    "vodka",
    "rhum",
    "rum",
    "gin",
    "tequila",
    "whisky",
    "whiskey",
    "cognac",
    "brandy",
    "champagne",
    "vin",
    "biere",
    "bière",
    "sake",
    "absinthe",
    "amaretto",
    "baileys",
    "triple sec",
    "cointreau",
  ]),
  fruits: new Set([
    "citron",
    "citronvert",
    "citron vert",
    "lime",
    "orange",
    "pamplemousse",
    "ananas",
    "fraise",
    "framboise",
    "myrtille",
    "cerise",
    "peche",
    "pêche",
    "mangue",
    "banane",
    "pomme",
    "poire",
    "pasteque",
    "pastèque",
    "melon",
    "kiwi",
    "passion",
    "fruit de la passion",
    "jus de fruit de la passion",
    "sirop de fruit de la passion",
    "puree de fruit de la passion",
    "purée de fruit de la passion",
    "maracuja",
    "passoa",
  ]),
  herbsSpices: new Set([
    "menthe",
    "basilic",
    "thym",
    "romarin",
    "coriandre",
    "gingembre",
    "cannelle",
    "vanille",
  ]),
};

const SUFFIXES = {
  fruit: ["", " juice", " syrup", " puree"],
  citrus: ["", " juice", " peel", " zest"],
  alcohol: [""],
  herb: [""],
  other: [""],
};

const CITRUS_EN = new Set(["lemon", "lime", "orange", "grapefruit"]);

function passionVariantsEn() {
  return [
    "passion fruit",
    "passion fruit juice",
    "passion fruit syrup",
    "passion fruit puree",
    "passionfruit",
  ];
}

function guessCategoryFromUserInput(frInput) {
  const n = normalizeIngredientText(frInput);

  if (FR_CATEGORIES.alcohols.has(n)) return "alcohol";
  if (FR_CATEGORIES.herbsSpices.has(n)) return "herb";
  if (FR_CATEGORIES.fruits.has(n)) return "fruit";

  if (
    n.includes("jus") ||
    n.includes("sirop") ||
    n.includes("puree") ||
    n.includes("purée")
  ) {
    return "fruit";
  }

  return "other";
}

function baseFromCompositeEn(en) {
  const b = normalizeIngredientText(en);
  return b
    .replace(/ juice$/i, "")
    .replace(/ syrup$/i, "")
    .replace(/ puree$/i, "")
    .replace(/ peel$/i, "")
    .replace(/ zest$/i, "");
}

function buildVariantsEn(baseEn, category) {
  const base = normalizeIngredientText(baseEn);
  const variants = new Set();

  variants.add(base);
  variants.add(baseFromCompositeEn(base));

  if (CITRUS_EN.has(base)) {
    SUFFIXES.citrus.forEach((s) => variants.add(base + s));
  } else if (category === "fruit") {
    SUFFIXES.fruit.forEach((s) => variants.add(base + s));
  } else if (category === "alcohol") {
    SUFFIXES.alcohol.forEach((s) => variants.add(base + s));
  } else if (category === "herb") {
    SUFFIXES.herb.forEach((s) => variants.add(base + s));
  } else {
    SUFFIXES.other.forEach((s) => variants.add(base + s));
  }

  return Array.from(variants)
    .map((v) => v.trim())
    .filter(Boolean);
}

function getIngredientCandidatesEn(userInput) {
  const normalized = normalizeIngredientText(userInput);

  // pack passion
  if (
    normalized.includes("passion") ||
    normalized.includes("fruit de la passion") ||
    normalized.includes("maracuja")
  ) {
    return passionVariantsEn();
  }

  const category = guessCategoryFromUserInput(userInput);
  const translated = translateIngredient(userInput);
  const baseEn = normalizeIngredientText(translated);

  return buildVariantsEn(baseEn, category);
}

/**
 * -----------------------------
 *  FETCH HELPERS
 * -----------------------------
 */

async function fetchFilterByIngredientEn(ingredientEn) {
  const response = await fetch(
    `https://www.thecocktaildb.com/api/json/v1/1/filter.php?i=${encodeURIComponent(
      ingredientEn,
    )}`,
  );
  if (!response.ok) return [];
  const data = await response.json();
  return Array.isArray(data.drinks) ? data.drinks : [];
}

async function fallbackSearchAndFilter(ingredientEn) {
  const fallbackResponse = await fetch(
    `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
      ingredientEn,
    )}`,
  );
  if (!fallbackResponse.ok) return [];

  const fallbackData = await fallbackResponse.json();
  const fallbackDrinks = Array.isArray(fallbackData.drinks)
    ? fallbackData.drinks
        .filter((drink) => cocktailContainsIngredient(drink, ingredientEn))
        .map((drink) => ({
          strDrink: drink.strDrink,
          strDrinkThumb: drink.strDrinkThumb,
          idDrink: drink.idDrink,
        }))
    : [];

  return fallbackDrinks;
}

/**
 * -----------------------------
 *  MESURES (conversion) + UX
 * -----------------------------
 */

function parseFractionOrNumber(str) {
  const s = (str ?? "").toString().trim();

  const mixed = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (mixed) {
    const whole = parseInt(mixed[1], 10);
    const num = parseInt(mixed[2], 10);
    const den = parseInt(mixed[3], 10);
    return whole + num / den;
  }

  const frac = s.match(/^(\d+)\/(\d+)$/);
  if (frac) {
    const num = parseInt(frac[1], 10);
    const den = parseInt(frac[2], 10);
    return num / den;
  }

  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function roundToHalfCl(cl) {
  return Math.round(cl * 2) / 2;
}

function convertUnitMeasureToFr(measureRaw) {
  if (!measureRaw) return null;
  let m = measureRaw.toLowerCase().trim().replace(/\s+/g, " ");

  const patterns = [
    { re: /\btwist\b/, fr: "Un zeste" },
    { re: /\bpeel\b/, fr: "Un zeste" },
    { re: /\bzest\b/, fr: "Un zeste" },
    { re: /\bwedge\b/, fr: "1 quartier" },
    { re: /\bslice\b/, fr: "1 tranche" },
    { re: /\bsprig\b/, fr: "1 brin" },
    { re: /\bleaf\b|\bleaves\b/, fr: "Quelques feuilles" },
    { re: /\bcherry\b/, fr: "1 cerise" },
    { re: /\bolive\b/, fr: "1 olive" },
  ];

  for (const p of patterns) {
    if (p.re.test(m)) return p.fr;
  }

  return null;
}

function convertMeasureToFr(measureRaw) {
  if (!measureRaw) return null;

  let m = measureRaw.toLowerCase().trim().replace(/\s+/g, " ");

  // ✅ Gestion des "dash" AVEC quantité (ex: "3 dash", "2 dashes")
  if (/dash/.test(m)) {
    const m2 = m.replace(/dashes/g, "dash"); // uniformise
    const matchQty = m2.match(/^([\d\s\/\.,]+)/);
    if (matchQty) {
      const qty = parseFractionOrNumber(matchQty[1]);
      if (qty) {
        const n = Math.round(qty);
        return n > 1 ? `${n} traits` : "1 trait";
      }
    }
    return "1 trait";
  }

  const textMap = [
    { re: /top up|fill up/, fr: "Compléter" },
    { re: /fill/, fr: "Remplir" },
    { re: /to taste|as required|as desired/, fr: "Au goût" },
    { re: /splash/, fr: "Un splash" },
    { re: /pinch/, fr: "Une pincée" },
  ];

  for (const t of textMap) {
    if (t.re.test(m)) return t.fr;
  }

  m = m
    .replace(/\bounces?\b/g, "oz")
    .replace(/\bfl oz\b/g, "oz")
    .replace(/\btablespoons?\b/g, "tbsp")
    .replace(/\bteaspoons?\b/g, "tsp");

  const match = m.match(/^([\d\s\/\.,]+)\s*(oz|tbsp|tsp|shot|cup|cl|ml)?/);
  if (!match) return measureRaw;

  const qtyStr = (match[1] ?? "").trim();
  const unit = match[2] || "";

  const qty = parseFractionOrNumber(qtyStr);
  if (qty === null) return measureRaw;

  if (unit === "ml") {
    const cl = roundToHalfCl(qty / 10);
    return `${cl} cl`;
  }

  if (unit === "cl") {
    return `${roundToHalfCl(qty)} cl`;
  }

  if (unit === "oz") {
    const cl = roundToHalfCl(qty * 2.957);
    return `${cl} cl`;
  }

  if (unit === "tbsp") {
    const cl = roundToHalfCl(qty * 1.5);
    return `${cl} cl`;
  }

  if (unit === "tsp") {
    const cl = roundToHalfCl(qty * 0.5);
    return `${cl} cl`;
  }

  if (unit === "cup") {
    const cl = roundToHalfCl(qty * 24);
    return `${cl} cl`;
  }

  if (unit === "shot") {
    // ✅ NE PAS TRADUIRE shot
    return `${qtyStr} shot`;
  }

  return measureRaw;
}

function isGarnishIngredient(ingredientEn) {
  const ing = normalizeIngredientText(ingredientEn);

  const garnishKeywords = [
    "lime wedge",
    "lemon wedge",
    "orange peel",
    "lemon peel",
    "lime peel",
    "orange slice",
    "lemon slice",
    "lime slice",
    "twist",
    "zest",
    "cherry",
    "maraschino cherry",
    "mint",
    "mint sprig",
    "olive",
  ];

  return garnishKeywords.some((k) => ing.includes(k));
}

function getQuantityFr(measureRaw, ingredientEn) {
  const ing = normalizeIngredientText(ingredientEn);

  // 1) si mesure existe
  if (measureRaw && measureRaw.trim() !== "") {
    const unitFr = convertUnitMeasureToFr(measureRaw);
    if (unitFr) return unitFr;

    return convertMeasureToFr(measureRaw.trim());
  }

  // 2) sel/sucre sans mesure => Au goût
  if (ing.includes("salt") || ing.includes("sugar")) {
    return "Au goût";
  }

  // 3) garniture sans mesure => Pour décorer
  if (isGarnishIngredient(ingredientEn)) {
    return "Pour décorer";
  }

  // 4) défaut
  return "Au goût";
}

/**
 * -----------------------------
 *  ROUTES
 * -----------------------------
 */

router.get("/searchByName", async (req, res) => {
  try {
    const { name } = req.query;

    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Le paramètre 'name' est requis" });
    }

    const response = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/search.php?s=${encodeURIComponent(
        name,
      )}`,
    );

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: "Erreur lors de la requête à l'API" });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Erreur dans la route /searchByName:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

router.get("/searchByIngredient", async (req, res) => {
  try {
    const { ingredient } = req.query;

    if (!ingredient || ingredient.trim() === "") {
      return res
        .status(400)
        .json({ error: "Le paramètre 'ingredient' est requis" });
    }

    const candidatesEn = getIngredientCandidatesEn(ingredient);

    const lists = await Promise.all(
      candidatesEn.map((ingEn) => fetchFilterByIngredientEn(ingEn)),
    );

    const merged = new Map();
    lists.flat().forEach((drink) => merged.set(drink.idDrink, drink));

    let drinks = Array.from(merged.values());

    if (drinks.length === 0) {
      const ingredientEn = translateIngredient(ingredient);
      const fallbackDrinks = await fallbackSearchAndFilter(ingredientEn);

      return res.json({
        drinks: fallbackDrinks.length > 0 ? fallbackDrinks : null,
        meta: { input: ingredient, tested: [ingredientEn], fallback: true },
      });
    }

    return res.json({
      drinks,
      meta: { input: ingredient, tested: candidatesEn, fallback: false },
    });
  } catch (error) {
    console.error("Erreur dans la route /searchByIngredient:", error);
    res.status(500).json({ error: "Erreur interne du serveur" });
  }
});

router.get("/ingredients", async (req, res) => {
  try {
    const response = await fetch(
      "https://www.thecocktaildb.com/api/json/v1/1/list.php?i=list",
    );

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: "Erreur lors de la requête à l'API",
      });
    }

    const data = await response.json();

    const ingredientsFr = data.drinks
      ? data.drinks.map((item) => ({
          nomOriginal: item.strIngredient1,
          nomFr: translateIngredientToFr(item.strIngredient1),
        }))
      : [];

    res.json({
      ok: true,
      count: ingredientsFr.length,
      ingredients: ingredientsFr,
    });
  } catch (error) {
    console.error("Erreur dans la route /ingredients:", error);
    res.status(500).json({
      ok: false,
      error: "Erreur interne du serveur",
      message: error.message,
    });
  }
});

const SURPRISE_CACHE_TTL_MS = 10 * 60 * 1000;
const SURPRISE_FETCH_TIMEOUT_MS = 9000;

const surpriseListCache = {
  with: { ids: [], expiresAt: 0 },
  without: { ids: [], expiresAt: 0 },
};

function parseExcludedIds(raw) {
  if (!raw) return new Set();
  return new Set(
    String(raw)
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean),
  );
}

function mapDrinkToCocktail(drink) {
  const ingredients = [];
  for (let i = 1; i <= 15; i++) {
    const ingredient = drink[`strIngredient${i}`];
    const measure = drink[`strMeasure${i}`];

    if (ingredient && ingredient.trim() !== "") {
      ingredients.push({
        nom: translateIngredientToFr(ingredient.trim()),
        nomOriginal: ingredient.trim(),
        quantite: getQuantityFr(measure, ingredient),
      });
    }
  }

  const typeVerre = drink.strGlass || "Verre non spécifié";
  const categorie = drink.strCategory || "Non catégorisé";
  const alcoolise =
    drink.strAlcoholic === "Alcoholic"
      ? "Alcoolisé"
      : drink.strAlcoholic === "Non alcoholic"
        ? "Sans alcool"
        : "Optionnel";

  const instructions =
    drink.strInstructionsFR ||
    drink.strInstructions ||
    "Instructions non disponibles";

  return {
    id: drink.idDrink,
    nom: drink.strDrink,
    nomAlternatif: drink.strDrinkAlternate || null,
    categorie,
    type: alcoolise,
    verre: typeVerre,
    image: drink.strDrinkThumb,
    instructions,
    ingredients,
    tags: drink.strTags ? drink.strTags.split(",") : [],
  };
}

async function fetchJsonWithTimeout(
  url,
  timeoutMs = SURPRISE_FETCH_TIMEOUT_MS,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function getIdsByAlcoholMode(alcoholMode) {
  const key = alcoholMode === "without" ? "without" : "with";
  const now = Date.now();
  const cache = surpriseListCache[key];

  if (cache.expiresAt > now && cache.ids.length > 0) {
    return cache.ids;
  }

  const alcoholFilter =
    alcoholMode === "without" ? "Non_Alcoholic" : "Alcoholic";

  const listData = await fetchJsonWithTimeout(
    `https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(alcoholFilter)}`,
  );

  const ids = Array.isArray(listData?.drinks)
    ? listData.drinks
        .map((d) => String(d?.idDrink || "").trim())
        .filter(Boolean)
    : [];

  surpriseListCache[key] = {
    ids,
    expiresAt: now + SURPRISE_CACHE_TTL_MS,
  };

  return ids;
}

async function pickRandomDrink(alcoholMode, excludedIds = new Set()) {
  if (alcoholMode === "with" || alcoholMode === "without") {
    const ids = await getIdsByAlcoholMode(alcoholMode);
    const availableIds = ids.filter((id) => !excludedIds.has(String(id)));

    if (availableIds.length === 0) return null;

    const randomId =
      availableIds[Math.floor(Math.random() * availableIds.length)] || null;
    if (!randomId) return null;

    const detailData = await fetchJsonWithTimeout(
      `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(randomId)}`,
    );

    return Array.isArray(detailData?.drinks) ? detailData.drinks[0] : null;
  }

  const randomData = await fetchJsonWithTimeout(
    "https://www.thecocktaildb.com/api/json/v1/1/random.php",
  );

  return Array.isArray(randomData?.drinks) ? randomData.drinks[0] : null;
}

router.get("/surprise", async (req, res) => {
  try {
    const alcoholMode = String(req.query.alcohol || "").toLowerCase();
    const excludedIds = parseExcludedIds(req.query.excludeIds);
    const drink = await pickRandomDrink(alcoholMode, excludedIds);

    if (!drink) {
      return res.status(404).json({
        ok: false,
        error: "Aucun cocktail trouvé",
      });
    }

    res.json({
      ok: true,
      cocktail: mapDrinkToCocktail(drink),
    });
  } catch (error) {
    console.error("Erreur dans la route /surprise:", error);
    res.status(500).json({
      ok: false,
      error: "Erreur interne du serveur",
      message: error.message,
    });
  }
});

router.get("/surprise/batch", async (req, res) => {
  try {
    const alcoholMode = String(req.query.alcohol || "").toLowerCase();
    const requestedCount = Number.parseInt(String(req.query.count || "4"), 10);
    const count = Number.isFinite(requestedCount)
      ? Math.min(Math.max(requestedCount, 1), 12)
      : 4;

    const excludedIds = parseExcludedIds(req.query.excludeIds);
    const cocktails = [];
    const maxAttempts = count * 10;
    let attempts = 0;

    while (cocktails.length < count && attempts < maxAttempts) {
      attempts += 1;
      const drink = await pickRandomDrink(alcoholMode, excludedIds);
      if (!drink?.idDrink) continue;

      const id = String(drink.idDrink);
      if (excludedIds.has(id)) continue;

      excludedIds.add(id);
      cocktails.push(mapDrinkToCocktail(drink));
    }

    res.json({
      ok: true,
      count: cocktails.length,
      cocktails,
    });
  } catch (error) {
    console.error("Erreur dans la route /surprise/batch:", error);
    res.status(500).json({
      ok: false,
      error: "Erreur interne du serveur",
      message: error.message,
    });
  }
});

router.get("/match", async (req, res) => {
  try {
    const { ingredients, alcohol, limit } = req.query;

    if (!ingredients || ingredients.trim() === "") {
      return res.status(400).json({
        ok: false,
        error: "Le paramètre 'ingredients' est requis (ex: vodka,lemon,sugar)",
      });
    }

    const ingredientListFr = ingredients
      .split(",")
      .map((ing) => ing.trim())
      .filter((ing) => ing.length > 0);

    if (ingredientListFr.length === 0) {
      return res.status(400).json({
        ok: false,
        error: "Aucun ingrédient valide fourni",
      });
    }

    const expandedQueries = ingredientListFr.map((ingFr) => ({
      originalFr: ingFr,
      candidatesEn: getIngredientCandidatesEn(ingFr),
    }));

    const fetchPromises = expandedQueries.map(
      async ({ originalFr, candidatesEn }) => {
        const lists = await Promise.all(
          candidatesEn.map((ingEn) => fetchFilterByIngredientEn(ingEn)),
        );

        const merged = new Map();
        lists.flat().forEach((drink) => merged.set(drink.idDrink, drink));
        let drinks = Array.from(merged.values());

        if (drinks.length === 0) {
          const translated = translateIngredient(originalFr);
          const fallbackDrinks = await fallbackSearchAndFilter(translated);
          drinks = fallbackDrinks;
        }

        return { ingredient: originalFr, drinks };
      },
    );

    const results = await Promise.all(fetchPromises);

    const scoreMap = {};
    results.forEach(({ ingredient, drinks }) => {
      if (Array.isArray(drinks) && drinks.length > 0) {
        drinks.forEach((drink) => {
          const id = drink.idDrink;
          if (!scoreMap[id]) {
            scoreMap[id] = {
              idDrink: id,
              name: drink.strDrink,
              thumb: drink.strDrinkThumb,
              score: 0,
              matchedIngredients: [],
            };
          }
          scoreMap[id].score += 1;
          scoreMap[id].matchedIngredients.push(ingredient);
        });
      }
    });

    let cocktailList = Object.values(scoreMap).map((cocktail) => ({
      ...cocktail,
      score: Math.round((cocktail.score / ingredientListFr.length) * 100),
    }));

    cocktailList.sort((a, b) => b.score - a.score);

    const maxResults = limit ? Math.min(parseInt(limit, 10), 20) : 10;
    cocktailList = cocktailList.slice(0, maxResults);

    const detailPromises = cocktailList.map(async (cocktail) => {
      const response = await fetch(
        `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(
          cocktail.idDrink,
        )}`,
      );
      if (!response.ok) return null;
      const data = await response.json();
      return data.drinks ? data.drinks[0] : null;
    });

    const detailResults = await Promise.all(detailPromises);

    const finalResults = cocktailList
      .map((cocktail, index) => {
        const details = detailResults[index];

        if (!details) {
          return {
            idDrink: cocktail.idDrink,
            name: cocktail.name,
            score: cocktail.score,
            matchedIngredients: cocktail.matchedIngredients,
            drink: { strDrinkThumb: cocktail.thumb },
          };
        }

        if (alcohol) {
          const alcoholFilter = alcohol.toLowerCase();
          const isAlcoholic = (details.strAlcoholic || "").toLowerCase();

          if (
            (alcoholFilter === "yes" && isAlcoholic === "non alcoholic") ||
            (alcoholFilter === "no" && isAlcoholic === "alcoholic")
          ) {
            return null;
          }
        }

        const ingredientsFr = [];
        for (let i = 1; i <= 15; i++) {
          const ingredient = details[`strIngredient${i}`];
          const measure = details[`strMeasure${i}`];

          if (ingredient && ingredient.trim() !== "") {
            ingredientsFr.push({
              nom: translateIngredientToFr(ingredient.trim()),
              nomOriginal: ingredient.trim(),
              quantite: getQuantityFr(measure, ingredient),
            });
          }
        }

        return {
          idDrink: cocktail.idDrink,
          name: cocktail.name,
          score: cocktail.score,
          matchedIngredients: cocktail.matchedIngredients,
          drink: {
            ...details,
            ingredientsFr,
          },
        };
      })
      .filter(Boolean);

    res.json({
      ok: true,
      input: {
        ingredients: ingredientListFr,
        expanded: expandedQueries,
        alcohol: alcohol || null,
      },
      count: finalResults.length,
      results: finalResults,
    });
  } catch (error) {
    console.error("Erreur dans la route /match:", error);
    res.status(500).json({
      ok: false,
      error: "Erreur interne du serveur",
      message: error.message,
    });
  }
});

// IMPORTANT: Cette route doit être en dernier car /:id capture tout
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || id.trim() === "") {
      return res.status(400).json({
        ok: false,
        error: "L'ID du cocktail est requis",
      });
    }

    const response = await fetch(
      `https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${encodeURIComponent(
        id,
      )}`,
    );

    if (!response.ok) {
      return res.status(response.status).json({
        ok: false,
        error: "Erreur lors de la requête à l'API",
      });
    }

    const data = await response.json();

    if (!data.drinks || data.drinks.length === 0) {
      return res.status(404).json({
        ok: false,
        error: "Cocktail non trouvé",
      });
    }

    const drink = data.drinks[0];

    const ingredients = [];
    for (let i = 1; i <= 15; i++) {
      const ingredient = drink[`strIngredient${i}`];
      const measure = drink[`strMeasure${i}`];

      if (ingredient && ingredient.trim() !== "") {
        ingredients.push({
          nom: translateIngredientToFr(ingredient.trim()),
          nomOriginal: ingredient.trim(),
          quantite: getQuantityFr(measure, ingredient),
        });
      }
    }

    const typeVerre = drink.strGlass || "Verre non spécifié";
    const categorie = drink.strCategory || "Non catégorisé";
    const alcoolise =
      drink.strAlcoholic === "Alcoholic"
        ? "Alcoolisé"
        : drink.strAlcoholic === "Non alcoholic"
          ? "Sans alcool"
          : "Optionnel";

    const instructions =
      drink.strInstructionsFR ||
      drink.strInstructions ||
      "Instructions non disponibles";

    res.json({
      ok: true,
      cocktail: {
        id: drink.idDrink,
        nom: drink.strDrink,
        nomAlternatif: drink.strDrinkAlternate || null,
        categorie: categorie,
        type: alcoolise,
        verre: typeVerre,
        image: drink.strDrinkThumb,
        instructions: instructions,
        ingredients: ingredients,
        tags: drink.strTags ? drink.strTags.split(",") : [],
      },
    });
  } catch (error) {
    console.error("Erreur dans la route /:id:", error);
    res.status(500).json({
      ok: false,
      error: "Erreur interne du serveur",
      message: error.message,
    });
  }
});

module.exports = router;
