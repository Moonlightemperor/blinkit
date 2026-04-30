const express = require("express");
const router = express.Router();
const { Cart, validateCart } = require("../Models/cart");
const { validateAdmin, userIsLoggedIn } = require("../middlewares/admin");
const { Product } = require("../Models/ProductModel");

router.get("/", userIsLoggedIn, async function (req, res) {
  try {
    const [cart, rnproducts] = await Promise.all([
      Cart.findOne({ user: req.session.passport.user }).populate(
        "products.product",
        "name price stock",
      ),
      Product.aggregate([{ $project: { name: 1, price: 1 } }, { $sample: { size: 3 } }]),
    ]);

    res.render("cart", {
      cart: cart ? cart.products : [],
      finalprice: cart ? cart.totalPrice : 0,
      rnproducts,
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
    
    if (!product) return res.send("Product not found");
    const stock = Number(product.stock) || 0;

    if (!cart) {
      if (stock < 1) {
        return res.send("Out of stock");
      }
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
      let existingProductIndex = cart.products.findIndex(
        (p) => p.product.toString() === req.params.id
      );

      if (existingProductIndex > -1) {
        if (cart.products[existingProductIndex].quantity >= stock) {
          return res.send("Not enough stock available");
        }
        cart.products[existingProductIndex].quantity += 1;
      } else {
        if (stock < 1) {
          return res.send("Out of stock");
        }
        cart.products.push({
          product: req.params.id,
          quantity: 1,
          price: Number(product.price),
        });
      }
      cart.totalPrice = Number(cart.totalPrice) + Number(product.price);

      await cart.save();
    }
    res.redirect(req.get("Referrer") || "/");
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

router.post("/reorder/:orderId", userIsLoggedIn, async function(req, res) {
  try {
    const { Order } = require('../Models/order');
    const order = await Order.findOne({ orderID: req.params.orderId, user: req.user._id }).populate('products.product');
    
    if (!order) return res.status(404).send("Order not found");

    let cart = await Cart.findOne({ user: req.user._id });
    
    if (!cart) {
      cart = new Cart({
        user: req.user._id,
        products: [],
        totalPrice: 0
      });
    }

    for (let item of order.products) {
      if (!item.product) continue;
      
      const stock = Number(item.product.stock) || 0;
      if (stock < 1) continue; 
      
      let existingIndex = cart.products.findIndex(p => p.product.toString() === item.product._id.toString());
      
      if (existingIndex > -1) {
        const newQuantity = cart.products[existingIndex].quantity + item.quantity;
        cart.products[existingIndex].quantity = Math.min(newQuantity, stock);
      } else {
        cart.products.push({
          product: item.product._id,
          quantity: Math.min(item.quantity, stock),
          price: Number(item.product.price)
        });
      }
    }

    cart.totalPrice = 0;
    cart.products.forEach(p => {
      cart.totalPrice += Number(p.price) * Number(p.quantity);
    });

    await cart.save();
    res.redirect("/cart");

  } catch (error) {
    console.error("Reorder error:", error);
    res.status(500).send("Error processing reorder");
  }
});

module.exports = router;
