const mongoose = require('mongoose');
const Joi = require('joi');

// MONGOOSE SCHEMA

const AddressSchema = new mongoose.Schema({
  state: {
    type: String,
    required: true,
    trim: true
  },
  zip: {
    type: String,
    required: true,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true,
    trim: true
  }
});

const userSchema = new mongoose.Schema({
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
    minlength: 6
  },
  phone: {
    type: String,
    minlength: 10,
    maxlength: 15
  },
  addresses: [AddressSchema]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// JOI VALIDATION

const validateUser = (data) => {
  const addressSchema = Joi.object({
    state: Joi.string().trim().required(),
    zip: Joi.string().trim().required(),
    city: Joi.string().trim().required(),
    address: Joi.string().trim().required()
  });

  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),

    email: Joi.string()
      .email()
      .required(),

    password: Joi.string()
      .min(6)
      .required(),

    phone: Joi.string()
      .pattern(/^[0-9]{10,15}$/)
      .required(),

    addresses: Joi.array()
      .items(addressSchema)
      .optional()
  });

  return schema.validate(data);
};

module.exports = {
  User,
  validateUser
};