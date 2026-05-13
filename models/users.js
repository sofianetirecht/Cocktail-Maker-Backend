const mongoose = require("mongoose");

const favoriteSchema = mongoose.Schema(
  {
    idDrink: { type: String, required: true },
    nom: String,
    image: String,
    addedAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true, minlength: 4, maxlength: 50 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true, select: false },
  token: { type: String, required: true, index: true },
  favorites: [favoriteSchema],
});

const User = mongoose.model("users", userSchema);

module.exports = User;
