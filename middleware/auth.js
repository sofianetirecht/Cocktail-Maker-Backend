const User = require("../models/users");

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;

    if (!token) {
      return res
        .status(401)
        .json({ ok: false, error: "Token manquant (Authorization: Bearer)" });
    }

    const user = await User.findOne({ token });
    if (!user) {
      return res.status(401).json({ ok: false, error: "Token invalide" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Erreur authMiddleware:", error);
    res.status(500).json({ ok: false, error: "Erreur interne du serveur" });
  }
}

module.exports = authMiddleware;
