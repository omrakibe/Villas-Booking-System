const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.send("Get route for user");
});

module.exports = router;
