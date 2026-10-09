// Convertisseur de mesures EN -> FR (formats standards uniquement).
// Renvoie null si le format n'est pas reconnu.

const UNICODE_FRACTIONS = { "½": "1/2", "¼": "1/4", "¾": "3/4", "⅓": "1/3", "⅔": "2/3", "⅛": "1/8" };

function parseQty(str) {
  const s = str.trim();
  let m = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);
  if (m) return +m[1] + +m[2] / +m[3];
  m = s.match(/^(\d+)\/(\d+)$/);
  if (m) return +m[1] / +m[2];
  const n = Number(s.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function fmt(n) {
  const r = Math.round(n * 2) / 2;
  return String(r).replace(".", ",");
}

function fmtExact(n) {
  const r = Math.round(n * 100) / 100;
  return String(r).replace(".", ",");
}

const VOLUME_CL = {
  oz: 3, shot: 4.5, jigger: 4.5, cup: 24, pint: 47, quart: 95, gal: 380, fifth: 75, cl: 1, ml: 0.1, dl: 10,
};

const UNIT_ALIASES = [
  [/^(fl\.? ?oz|ounces?|oz\.?)$/, "oz"],
  [/^shots?$/, "shot"],
  [/^jiggers?$/, "jigger"],
  [/^cups?$/, "cup"],
  [/^pints?$/, "pint"],
  [/^(qts?|quarts?)$/, "quart"],
  [/^(gal|gallons?)$/, "gal"],
  [/^fifths?$/, "fifth"],
  [/^cl$/, "cl"],
  [/^ml$/, "ml"],
  [/^dl$/, "dl"],
  [/^(l|liters?|litres?)$/, "l"],
  [/^(tblsp|tbsp|tablespoons?|tbs)$/, "tbsp"],
  [/^(tsp|teaspoons?)$/, "tsp"],
  [/^parts?$/, "part"],
  [/^measures?$/, "measure"],
  [/^drops?$/, "drop"],
  [/^(dash|dashes)$/, "dash"],
  [/^(gr|g|grams?)$/, "g"],
  [/^kg$/, "kg"],
  [/^(lb|lbs|pounds?)$/, "lb"],
  [/^cans?$/, "can"],
  [/^bottles?$/, "bottle"],
  [/^glass(es)?$/, "glass"],
  [/^packages?$/, "package"],
  [/^cubes?$/, "cube"],
  [/^(pieces?|chunks?)$/, "piece"],
  [/^sticks?$/, "stick"],
  [/^scoops?$/, "scoop"],
  [/^sprigs?$/, "sprig"],
  [/^wedges?$/, "wedge"],
  [/^slices?$/, "slice"],
  [/^strips?$/, "strip"],
  [/^(inch|inches)$/, "inch"],
  [/^handfuls?$/, "handful"],
  [/^leaves$|^leaf$/, "leaf"],
  [/^pods?$/, "pod"],
  [/^(pinch|pinches)$/, "pinch"],
  [/^(splash|splashes)$/, "splash"],
];

// Qualificatifs et marques qui suivent parfois l'unité.
const DESCRIPTORS = {
  dry: "sec", sweet: "doux", cold: "froid", hot: "chaud", boiling: "bouillant", iced: "glacé", chilled: "frais",
  fresh: "frais", frozen: "surgelé", crushed: "pilé", chopped: "haché", "finely chopped": "finement haché",
  ground: "moulu", "ground roasted": "torréfié moulu", grated: "râpé", powdered: "en poudre", dried: "séché",
  "dried and chopped": "séché et haché", instant: "instantané", superfine: "extra-fin", granulated: "en poudre",
  fine: "fin", plain: "nature", pure: "pur", sweetened: "sucré", unsweetened: "non sucré", skimmed: "écrémé",
  whole: "entier", light: "ambré clair", "light or dark": "clair ou ambré", white: "blanc", red: "rouge",
  blue: "bleu", green: "vert", yellow: "jaune", black: "noir", double: "double", cream: "crème", mild: "doux",
  fruit: "de fruits", lemon: "citron", strong: "fort", "strong black": "noir fort", large: "grand", small: "petit",
  ripe: "mûr", cracked: "concassé", beaten: "battu", blended: "blended", "sweet or dry": "doux ou sec",
  "chopped bittersweet or semi-sweet": "noir haché", "finely chopped dark": "noir finement haché", hard: "brut",
  bacardi: "Bacardi", stoli: "Stolichnaya", smirnoff: "Smirnoff", jamaican: "jamaïcain", mexican: "mexicain",
  thai: "thaï", schweppes: "Schweppes", muscatel: "muscat", grape: "raisin", hazlenut: "noisette",
  "green ginger": "gingembre vert", tropical: "tropical",
};

// [singulier, pluriel]
const COUNT_UNITS = {
  part: ["part", "parts"],
  measure: ["mesure", "mesures"],
  drop: ["goutte", "gouttes"],
  dash: ["trait", "traits"],
  can: ["canette", "canettes"],
  bottle: ["bouteille", "bouteilles"],
  glass: ["verre", "verres"],
  package: ["sachet", "sachets"],
  cube: ["cube", "cubes"],
  piece: ["morceau", "morceaux"],
  stick: ["bâton", "bâtons"],
  scoop: ["boule", "boules"],
  sprig: ["brin", "brins"],
  wedge: ["quartier", "quartiers"],
  slice: ["tranche", "tranches"],
  strip: ["lanière", "lanières"],
  handful: ["poignée", "poignées"],
  leaf: ["feuille", "feuilles"],
  pod: ["gousse", "gousses"],
  pinch: ["pincée", "pincées"],
  splash: ["giclée", "giclées"],
  tbsp: ["c. à soupe", "c. à soupe"],
  tsp: ["c. à café", "c. à café"],
};

const QTY = String.raw`(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:[.,]\d+)?)`;
const RANGE_RE = new RegExp(String.raw`^${QTY}(?:\s*(?:-|to|or)\s*${QTY})?\s*(.*)$`, "i");

function toUnit(word) {
  const w = word.toLowerCase();
  for (const [re, unit] of UNIT_ALIASES) if (re.test(w)) return unit;
  return null;
}

function plain(n) {
  if (Number.isInteger(n) || (n > 1 && Number.isInteger(n * 2))) return fmt(n);
  const den = [2, 3, 4, 5, 6, 8].find((d) => Math.abs(n * d - Math.round(n * d)) < 1e-9);
  if (!den) return fmtExact(n);
  const whole = Math.floor(n);
  const num = Math.round((n - whole) * den);
  return whole ? `${whole} ${num}/${den}` : `${num}/${den}`;
}

function formatQty(a, b, conv) {
  const one = (n) => (conv ? fmt(conv(n)) : plain(n));
  return b == null ? one(a) : `${one(a)} à ${one(b)}`;
}

function convertStandardMeasure(raw) {
  if (!raw) return null;
  let s = raw.trim();
  for (const [k, v] of Object.entries(UNICODE_FRACTIONS)) s = s.replace(k, v);
  s = s.replace(/\s+/g, " ");

  const m = s.match(RANGE_RE);
  if (!m) return null;
  const a = parseQty(m[1]);
  const b = m[2] ? parseQty(m[2]) : null;
  if (a == null) return null;
  const rest = m[3].trim();

  if (rest === "") return formatQty(a, b);

  const [first, ...others] = rest.split(" ");
  const unit = toUnit(first.replace(/[.,]$/, ""));
  if (!unit) {
    const desc = DESCRIPTORS[rest.toLowerCase()];
    return desc ? `${formatQty(a, b)} (${desc})` : null;
  }
  const tail = others.join(" ").toLowerCase();
  let suffix = "";
  if (tail) {
    const desc = DESCRIPTORS[tail];
    if (!desc) return null;
    suffix = ` (${desc})`;
  }
  const base = formatUnit(a, b, unit);
  return base ? base + suffix : null;
}

function formatUnit(a, b, unit) {
  const max = b ?? a;
  if (unit in VOLUME_CL) {
    const total = (n) => n * VOLUME_CL[unit];
    if (total(max) >= 100) return formatQty(a, b, (n) => total(n) / 100) + " L";
    return formatQty(a, b, total) + " cl";
  }
  if (unit === "l") return formatQty(a, b) + " L";
  if (unit === "g") return formatQty(a, b) + " g";
  if (unit === "kg") return formatQty(a, b) + " kg";
  if (unit === "lb") return formatQty(a, b, (n) => n * 450) + " g";
  if (unit === "inch") return formatQty(a, b, (n) => n * 2.5) + " cm";
  if (unit in COUNT_UNITS) {
    const [sing, plur] = COUNT_UNITS[unit];
    return `${formatQty(a, b)} ${max > 1 ? plur : sing}`;
  }
  return null;
}

module.exports = { convertStandardMeasure };
