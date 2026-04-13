const express = require("express");
const router = express.Router();
const { Product, validateProduct } = require("../Models/ProductModel");
const { Category, validateCategory } = require("../Models/category");
const upload = require("../config/multer_config");
const { validateAdmin, userIsLoggedIn } = require("../middlewares/admin");
const { Cart } = require("../Models/cart");

router.get("/", userIsLoggedIn, async function (req, res) {
  let somethingInCart = false;
  const products = await Product.aggregate([
    { $sort: { _id: -1 } },
    {
      $group: {
        _id: "$category",
        products: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        category: "$_id",
        products: { $slice: ["$products", 10] },
        _id: 0,
      },
    },
  ]);

  let cart = await Cart.findOne({ user: req.session.passport.user });
  if (cart && cart.products.length > 0) somethingInCart = true;

  let rnproducts = await Product.aggregate([{ $sample: { size: 3 } }]);

  const finalResult = {};

  products.forEach((item) => {
    finalResult[item.category] = item.products;
  });

  res.render("index", {
    products: finalResult,
    rnproducts,
    somethingInCart,
    cartCount: cart?.products?.length || 0,
  });
});

router.get("/delete/:id", validateAdmin, async function (req, res) {
  if (req.user.admin) {
    await Product.findOneAndDelete({ _id: req.params.id });
    res.redirect("/admin/products");
  }
  res.send("you are not allowed to delete this product");
});

router.post("/delete", validateAdmin, async function (req, res) {
  if (req.user.admin) {
    await Product.findOneAndDelete({ _id: req.body.product_id });
    res.redirect("back");
  }
  res.send("you are not allowed to delete this product");
});

router.post("/", upload.single("image"), async function (req, res) {
  let { name, price, category, stock, description, image } = req.body;
  let { error } = validateProduct({
    name,
    price,
    category,
    stock,
    description,
    image,
  });

  if (error) return res.send(error.message);

  let isCategory = await Category.findOne({ name: category });
  if (!isCategory) {
    await Category.create({ name: category });
  }

  await Product.create({
    name,
    price,
    category,
    image: req.file.buffer,
    description,
    stock,
  });

  res.redirect("/admin/dashboard");
});

module.exports = router;
