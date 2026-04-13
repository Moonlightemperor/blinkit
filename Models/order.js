const mongoose = require("mongoose");
const Joi = require("joi");



// MONGOOSE SCHEMA


const orderSchema = new mongoose.Schema(
  {
    orderID: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
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
        }
      }
    ],

    totalPrice: {
      type: Number,
      required: true,
      min: 0
    },

    address: {
      type: String,
      required: false,
      trim: true,
      maxlength: 200
    },

    status: {
      type: String,
      enum: ["pending", "confirmed", "shipped", "delivered", "cancelled"],
      default: "pending"
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment"
    },

    delivery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Delivery"
    }
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);



// JOI VALIDATION


const validateOrder = (data) => {
  const schema = Joi.object({
    orderID: Joi.string()
      .required()
      .trim(),
    
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
            .required()
        })
      )
      .min(1)
      .required(),

    totalPrice: Joi.number()
      .min(0)
      .required(),

    address: Joi.string()
      .trim()
      .max(200)
      .optional(),

    status: Joi.string()
      .valid("pending", "confirmed", "shipped", "delivered", "cancelled")
      .optional(),

    payment: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional(),

    delivery: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .optional()
  });

  return schema.validate(data);
};



module.exports = {
  Order,
  validateOrder
};