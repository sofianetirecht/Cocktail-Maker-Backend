const mongoose = require("mongoose");

const recipeIngredientSchema = mongoose.Schema(
  {
    name: String,
    amount: String,
    role: String,
  },
  { _id: false },
);

const recipeSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
  name: { type: String, required: true },
  type: String,
  format: String,
  profile: [String],
  glass: String,
  ice: String,
  ingredients: [recipeIngredientSchema],
  steps: [String],
  garnish: String,
  tips: [String],
  mocktailVariant: String,
  createdAt: { type: Date, default: Date.now },
});

const Recipe = mongoose.model("recipes", recipeSchema);

module.exports = Recipe;
