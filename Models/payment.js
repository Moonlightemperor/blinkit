const mongoose = require("mongoose");
const Joi = require("joi");


// MONGOOSE SCHEMA

const paymentSchema = new mongoose.Schema(
  {
    // Stored to match an existing unique MongoDB index (transactionID_1).
    // Razorpay provides a unique id per payment; we reuse it here.
    transactionID: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: String,
      ref: "Order",
      required: true
    },
    paymentId:{
      type:String,
      required:true
    },
    signature:{
      type:String,
      required:true
    },
    amount:{
      type:Number,
      required:true,
    },
    currency:{
      type:String,
      required:true,
    },
    status:{
      type:String,
       enum: ["pending", "success", "failed"],
      default:'pending'
    },

  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", paymentSchema);


// JOI VALIDATION

const validatePayment = (data) => {
  const schema = Joi.object({
    transactionID: Joi.string().required(),
    user: Joi.string().required(),
    orderId: Joi.string().required(),
    paymentId: Joi.string().allow("", null),
    signature: Joi.string().allow("", null),
    amount: Joi.number().min(0).required(),
    currency: Joi.string().required(),
    status: Joi.string()
      .valid("pending", "success", "failed")
      .default("pending"),
  });

  return schema.validate(data);
};



module.exports = {
  Payment,
  validatePayment
};