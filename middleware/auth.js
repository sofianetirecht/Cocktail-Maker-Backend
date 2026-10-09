const supabase = require("../models/supabase");

async function authMiddleware(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7).trim() : null;

    if (!token) {
      return res
        .status(401)
        .json({ ok: false, error: "Token manquant (Authorization: Bearer)" });
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("id, username, email")
      .eq("token", token)
      .maybeSingle();

    if (error) throw error;
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
