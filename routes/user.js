const express = require("express");
const router = express.Router();
const { User, validateUser } = require("../Models/user");
const { Order } = require("../Models/order");
const { userIsLoggedIn } = require("../middlewares/admin");

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

router.post("/address/add", async function(req, res) {
  try {
    if (!req.isAuthenticated()) return res.redirect("/users/login");
    const { address, city, state, zip, phone } = req.body;
    
    let user = await User.findById(req.user._id);
    user.addresses.push({ address, city, state, zip, phone });
    await user.save();
    
    res.redirect(req.get("Referrer") || "/cart");
  } catch (err) {
    res.send(err.message);
  }
});

router.post("/address/delete/:id", userIsLoggedIn, async function(req, res) {
  try {
    let user = await User.findById(req.user._id);
    user.addresses = user.addresses.filter(addr => addr._id.toString() !== req.params.id);
    await user.save();
    res.redirect(req.get("Referrer") || "/users/profile");
  } catch (err) {
    res.send(err.message);
  }
});

router.post("/address/edit/:id", userIsLoggedIn, async function(req, res) {
  try {
    const { address, city, state, zip, phone } = req.body;
    let user = await User.findById(req.user._id);
    
    let addrIndex = user.addresses.findIndex(addr => addr._id.toString() === req.params.id);
    if (addrIndex !== -1) {
      user.addresses[addrIndex] = { ...user.addresses[addrIndex].toObject(), address, city, state, zip, phone };
      await user.save();
    }
    
    res.redirect(req.get("Referrer") || "/users/profile");
  } catch (err) {
    res.send(err.message);
  }
});

router.get("/profile", userIsLoggedIn, async function(req, res) {
  try {
    const user = await User.findById(req.user._id).lean();
    const orders = await Order.find({ user: req.user._id })
                              .sort({ createdAt: -1 })
                              .populate('products.product')
                              .lean();
    
    const { Cart } = require('../Models/cart');
    const cart = await Cart.findOne({ user: req.user._id }).lean();
    const cartCount = cart && cart.products ? cart.products.length : 0;

    res.render("profile", {
      user,
      orders,
      cartCount
    });
  } catch (err) {
    res.send(err.message);
  }
});

module.exports = router;
