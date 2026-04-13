const mongoose = require("mongoose");
const Joi = require("joi");
// MONGOOSE SCHEMA

const ProductSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    stock: {
      type: Number,
      min: 0,
      default: 0,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    image: {
      type: Buffer,
      trim: true,
    },
  },
  { timestamps: true },
);

const Product = mongoose.model("Product", ProductSchema);

// JOI VALIDATION

const validateProduct = (data) => {
  const schema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),

    price: Joi.number().min(0).required(),

    category: Joi.string().trim().min(2).max(50).required(),

    stock: Joi.number().optional(),

    description: Joi.string().trim().max(500).optional(),

    image: Joi.string()
      .uri() // ensures valid URL
      .optional(),
  });

  return schema.validate(data);
};

module.exports = {
  Product,
  validateProduct,
};
