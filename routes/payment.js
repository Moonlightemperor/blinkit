const express = require('express');
const router = express.Router();
const crypto = require("crypto");

require('dotenv').config();

const { Payment } = require('../Models/payment');
const { Order } = require('../Models/order');

const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_TEST_KEY,
  key_secret: process.env.RAZORPAY_TEST_SECRET,
});

router.post("/create/order", async (req, res) => {
  try {
    const amount = req.body?.amount;

    // 🔒 basic validation
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount"
      });
    }

    const options = {
      amount: amount * 100, // paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      order,
    });

  } catch (err) {
    console.error("CREATE ORDER ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

router.post("/api/payment/verify", async (req, res) => {
  try {
    if (typeof req.isAuthenticated !== "function" || !req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: "Please log in to complete payment",
      });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      cart // Add cart data from frontend
    } = req.body;

    // 🔒 check missing fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Missing payment details"
      });
    }

    const amountNum = Number(amount);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_TEST_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Invalid signature"
      });
    }

    await Payment.create({
      transactionID: razorpay_payment_id,
      user: req.user._id,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      amount: amountNum,
      currency: "INR",
      status: "success",
    });

    // Create an Order record with the same orderID
    const orderProducts = cart ? cart.map(item => ({
      product: item.product._id || item.product,
      quantity: item.quantity
    })) : [];

    console.log('Creating order with ID:', razorpay_order_id);
    console.log('Products:', orderProducts);

    const newOrder = await Order.create({
      orderID: razorpay_order_id,
      user: req.user._id,
      products: orderProducts,
      totalPrice: amountNum,
      address: null, // Will be set later via map
      status: "pending",
      payment: null, // Will be linked later
    });

    console.log('Order created successfully:', newOrder._id);

    res.json({
      success: true,
      message: "Payment verified successfully",
      razorpay_order_id,
      razorpay_payment_id,
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;