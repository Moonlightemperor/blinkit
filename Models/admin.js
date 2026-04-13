const mongoose = require("mongoose");
const Joi = require("joi");

// MONGOOSE SCHEMA


const adminSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    role: {
      type: String,
      enum: ["admin", "superadmin"],
      default: "admin"
    }
  },
  { timestamps: true }
);

const Admin = mongoose.model("Admin", adminSchema);


// JOI VALIDATION


const validateAdmin = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .trim()
      .min(3)
      .max(50)
      .pattern(/^[A-Za-z\s]+$/)
      .required(),

    email: Joi.string()
      .email({ tlds: { allow: false } })
      .max(100)
      .required(),

    password: Joi.string()
      .min(6)
      .max(50)
      .required(),

    role: Joi.string()
      .valid("admin", "superadmin")
      .optional()
  });

  return schema.validate(data);
};


module.exports = {
  Admin,
  validateAdmin
};