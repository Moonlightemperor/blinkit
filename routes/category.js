const express = require("express");
const router = express.Router();

const { Category, validateCategory } = require("../Models/category");

const {validateAdmin} = require("../middlewares/admin");

router.post("/", validateAdmin, function (req, res) {
  Category.create({
    name: req.body.name,
  });

  res.redirect("back");
});
module.exports = router;
