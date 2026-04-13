const express = require("express");
const router = express.Router();
const { Cart, validateCart } = require("../Models/cart");
const { validateAdmin, userIsLoggedIn } = require("../middlewares/admin");
const { Product } = require("../Models/ProductModel");

router.get("/", userIsLoggedIn, async function (req, res) {
  try {
    let cart = await Cart.findOne({ user: req.session.passport.user }).populate(
      "products.product",
    );

    let cartDataStructure = {};
    cart.products.forEach((product) => {
      let key = product.product._id.toString();
      if (cartDataStructure[key]) {
        cartDataStructure[key].quantity += 1;
      } else {
        cartDataStructure[key] = {
          product: product.product,
          price: product.price,
          quantity: 1,
        };
      }
    });

    let finalArray = Object.values(cartDataStructure);
    res.render("cart", {
      cart: finalArray,
      finalprice: cart.totalPrice,
      user: req.user,
      razorpayKeyId: process.env.RAZORPAY_TEST_KEY || "rzp_test_SYXc3uzf8qIkWz",
    });
  } catch (err) {
    res.send(err.message);
  }
});

router.get("/add/:id", userIsLoggedIn, async function (req, res) {
  try {
    let cart = await Cart.findOne({ user: req.session.passport.user });
    let product = await Product.findOne({ _id: req.params.id });

    if (!cart) {
      cart = await Cart.create({
        user: req.session.passport.user,
        products: [
          {
            product: req.params.id,
            quantity: 1,
            price: Number(product.price),
          },
        ],
        totalPrice: Number(product.price),
      });
    } else {
      cart.products.push({
        product: req.params.id,
        quantity: 1,
        price: Number(product.price),
      });
      cart.totalPrice = Number(cart.totalPrice) + Number(product.price);

      await cart.save();
    }
    res.redirect("/");
  } catch (err) {
    res.send(err.message);
  }
});

router.get("/remove/:id", userIsLoggedIn, async function (req, res) {
  try {
    const mongoose = require("mongoose");

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.redirect("/");
    }

    let cart = await Cart.findOne({ user: req.session.passport.user });
    let product = await Product.findById(req.params.id);

    if (!cart) {
      return res.send("Cart is empty");
    }

    let index = cart.products.findIndex(
      item => item.product.toString() === req.params.id
    );

    if (index === -1) {
      return res.send("Item not in cart");
    }

    if (cart.products[index].quantity > 1) {
      cart.products[index].quantity -= 1;
    } else {
      cart.products.splice(index, 1);
    }

    cart.totalPrice -= product.price;

    await cart.save();

    res.redirect(req.get("Referrer") || "/");

  } catch (err) {
    res.send(err.message);
  }
});


router.get("/remove/:id", userIsLoggedIn, async function (req, res) {
  try {
    let cart = await Cart.findOne({ user: req.session.passport.user });
    if (!cart) return res.send("something went wrong while removing item");
    let index = cart.products.indexOf(req.params.id);
    if (index !== -1) cart.products.splice(index, 1);
    else return res.send("Item is not in the cart");

    await cart.save();
    res.redirect("back");
  } catch (err) {
    res.send(err.message);
  }
});
module.exports = router;
