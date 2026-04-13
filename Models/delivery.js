const mongoose = require("mongoose");
const Joi = require("joi");



// MONGOOSE SCHEMA


const deliverySchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true
    },

    deliveryBoy: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    status: {
      type: String,
      enum: ["assigned", "picked", "in_transit", "delivered", "failed"],
      default: "assigned"
    },

    trackingUrl: {
      type: String,
      trim: true
    },

    estimatedDeliveryTime: {
      type: Number, 
      required: true
    }
  },
  { timestamps: true }
);

const Delivery = mongoose.model("Delivery", deliverySchema);



// JOI VALIDATION


const validateDelivery = (data) => {
  const schema = Joi.object({
    order: Joi.string()
      .regex(/^[0-9a-fA-F]{24}$/)
      .required(),

    deliveryBoy: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .required(),

    status: Joi.string()
      .valid("assigned", "picked", "in_transit", "delivered", "failed")
      .optional(),

    trackingUrl: Joi.string()
      .uri()
      .optional(),

    estimatedDeliveryTime: Joi.date()
      .required()
  });

  return schema.validate(data);
};



module.exports = {
  Delivery,
  validateDelivery
};