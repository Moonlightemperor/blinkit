const mongoose = require("mongoose");
const Joi = require("joi");



// MONGOOSE SCHEMA


const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 2,
      maxlength: 50,
      unique: true
    }
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);



// JOI VALIDATION


const validateCategory = (data) => {
  const schema = Joi.object({
    name: Joi.string()
      .trim()
      .min(2)
      .max(50)
      .pattern(/^[a-zA-Z\s]+$/)
      .required()
  });

  return schema.validate(data);
};




module.exports = {
  Category,
  validateCategory
};