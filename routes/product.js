const express = require("express");
const router = express.Router();
const { Product, validateProduct } = require("../Models/ProductModel");
const { Category, validateCategory } = require("../Models/category");
const upload = require("../config/multer_config");
const { validateAdmin, userIsLoggedIn } = require("../middlewares/admin");
const { Cart } = require("../Models/cart");

function detectImageMimeType(buffer) {
  if (!buffer || buffer.length < 4) return "image/jpeg";
  if (buffer[0] === 0xff && buffer[1] === 0xd8) return "image/jpeg";
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "image/png";
  }
  if (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46) {
    return "image/gif";
  }
  if (
    buffer.length >= 12 &&
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return "image/webp";
  }
  return "image/jpeg";
}

router.get("/image/:id", async function (req, res) {
  try {
    const product = await Product.findById(req.params.id).select("image").lean();
    if (!product || !product.image) {
      return res.status(404).send("Image not found");
    }

    res.set("Cache-Control", "public, max-age=86400");
    res.type(detectImageMimeType(product.image));
    return res.send(product.image);
  } catch (error) {
    return res.status(500).send("Could not fetch image");
  }
});

router.get("/", userIsLoggedIn, async function (req, res) {
  let somethingInCart = false;
  const [products, cart, rnproducts] = await Promise.all([
    Product.aggregate([
      {
        $project: {
          name: 1,
          price: 1,
          category: 1,
        },
      },
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
          products: { $slice: ["$products", 6] },
          _id: 0,
        },
      },
    ]),
    Cart.findOne({ user: req.session.passport.user }).lean(),
    Product.aggregate([{ $project: { name: 1, price: 1 } }, { $sample: { size: 2 } }]),
  ]);

  if (cart && cart.products.length > 0) somethingInCart = true;

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
