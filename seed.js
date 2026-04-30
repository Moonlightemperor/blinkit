const mongoose = require("mongoose");
const axios = require("axios");
const { Product } = require("./Models/ProductModel");
const { Category } = require("./Models/category");
require("dotenv").config();

const productsToSeed = [
  {
    name: "Fresh Milk (1 L)",
    price: 68,
    category: "Dairy",
    stock: 50,
    description: "Farm fresh toned milk.",
    imageUrl: "https://picsum.photos/seed/milk/400/400"
  },
  {
    name: "Classic Paneer (200 g)",
    price: 85,
    category: "Dairy",
    stock: 30,
    description: "Rich, soft and fresh paneer.",
    imageUrl: "https://picsum.photos/seed/paneer/400/400"
  },
  {
    name: "Potato Chips - Spicy (52 g)",
    price: 20,
    category: "Snacks",
    stock: 100,
    description: "Deliciously spiced potato chips.",
    imageUrl: "https://picsum.photos/seed/chips/400/400"
  },
  {
    name: "Aloo Bhujia (200 g)",
    price: 110,
    category: "Snacks",
    stock: 45,
    description: "Crunchy potato and gram flour savory snack.",
    imageUrl: "https://picsum.photos/seed/bhujia/400/400"
  },
  {
    name: "Cola Soft Drink (750 ml)",
    price: 40,
    category: "Beverages",
    stock: 80,
    description: "Refreshing cola drink.",
    imageUrl: "https://picsum.photos/seed/cola/400/400"
  },
  {
    name: "Energy Drink (250 ml)",
    price: 125,
    category: "Beverages",
    stock: 25,
    description: "Vitalizes body and mind.",
    imageUrl: "https://picsum.photos/seed/energy/400/400"
  },
  {
    name: "Cream Beauty Bathing Bar",
    price: 150,
    category: "Personal Care",
    stock: 60,
    description: "Contains 1/4 moisturizing cream.",
    imageUrl: "https://picsum.photos/seed/soap/400/400"
  },
  {
    name: "Strong Teeth Toothpaste",
    price: 115,
    category: "Personal Care",
    stock: 75,
    description: "Strong teeth, fresh breath.",
    imageUrl: "https://picsum.photos/seed/toothpaste/400/400"
  },
  {
    name: "Premium Wheat Atta (5 kg)",
    price: 280,
    category: "Grocery & Staples",
    stock: 20,
    description: "Premium quality wheat flour.",
    imageUrl: "https://picsum.photos/seed/atta/400/400"
  },
  {
    name: "Iodised Salt (1 kg)",
    price: 28,
    category: "Grocery & Staples",
    stock: 150,
    description: "Vacuum evaporated salt.",
    imageUrl: "https://picsum.photos/seed/salt/400/400"
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGOURL);
    console.log("Connected to DB...");

    for (const item of productsToSeed) {
      console.log(`Processing ${item.name}...`);
      
      // Ensure category exists
      let isCategory = await Category.findOne({ name: item.category });
      if (!isCategory) {
        await Category.create({ name: item.category });
        console.log(`Created category ${item.category}`);
      }

      // Download image
      const response = await axios.get(item.imageUrl, { responseType: 'arraybuffer' });
      const buffer = Buffer.from(response.data, 'binary');

      // Create product
      await Product.create({
        name: item.name,
        price: item.price,
        category: item.category,
        stock: item.stock,
        description: item.description,
        image: buffer
      });
      console.log(`Successfully added ${item.name}!`);
    }

    console.log("Seeding complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding:", error);
    process.exit(1);
  }
}

seed();
