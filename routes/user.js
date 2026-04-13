const express = require("express");
const router = express.Router();
const { User, validateUser } = require("../Models/user");

router.get("/login", function (req, res) {
  res.render("user_login");
});

router.get("/logout", function (req, res, next) {
  req.logOut(function (err) {
    if (err) {
      return next(err);
    }
    req.session.destroy((err)=>{
      if(err) return next(err);
      res.clearCookie("connect.sid");
      res.redirect("/users/login");
    })
  });
});

module.exports = router;
