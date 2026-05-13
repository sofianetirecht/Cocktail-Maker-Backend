var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.json({ ok: true, name: "Cocktail Maker API", version: "1.0.0" });
});

module.exports = router;
