const mongoose = require("mongoose");

const connectionString = process.env.MONGODB_URI;

if (!connectionString) {
  console.error("❌ MONGODB_URI manquant dans .env");
  process.exit(1);
}

mongoose
  .connect(connectionString, { connectTimeoutMS: 2000 })
  .then(() => console.log("✅ Database connected"))
  .catch((error) => console.error("❌ Database connection error:", error));

module.exports = mongoose;
