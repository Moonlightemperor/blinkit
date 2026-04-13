const mongoose = require("mongoose");
const Joi = require("joi");

// MONGOOSE SCHEMA


const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true // one cart per user
    },

    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },

        quantity: {
          type: Number,
          required: true,
          min: 1
        },

        price: {
          type: Number,
          required: true,
          min: 0
        }
      }
    ],

    totalPrice: {
      type: Number,
      min: 0,
      default: 0
    }
  },
  { timestamps: true }
);

const Cart = mongoose.model("cart", cartSchema);


// JOI VALIDATION


const validateCart = (data) => {
  const schema = Joi.object({
    user: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),

    products: Joi.array()
      .items(
        Joi.object({
          product: Joi.string()
            .regex(/^[0-9a-fA-F]{24}$/)
            .required(),

          quantity: Joi.number()
            .min(1)
            .required(),

          price: Joi.number()
            .min(0)
            .required()
        })
      )
      .min(1)
      .required(),

    totalPrice: Joi.number()
      .min(0)
      .optional()
  });

  return schema.validate(data);
};


module.exports = {
  Cart,
  validateCart
};