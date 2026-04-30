const express = require('express');
const router = express.Router();
const crypto = require("crypto");

require('dotenv').config();

const { Payment } = require('../Models/payment');
const { Order } = require('../Models/order');
const { Cart } = require('../Models/cart');

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
      address,
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

    // Create Payment record first
    const newPayment = await Payment.create({
      transactionID: razorpay_payment_id,
      user: req.user._id,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      amount: amountNum,
      currency: "INR",
      status: "success",
    });

    // Create Order record linked to payment
    const orderProducts = cart ? cart.map(item => ({
      product: item.product._id || item.product,
      quantity: item.quantity
    })) : [];

    const newOrder = await Order.create({
      orderID: razorpay_order_id,
      user: req.user._id,
      products: orderProducts,
      totalPrice: amountNum,
      address: address || "No Address Provided", // ✅ Saves selected address
      status: "confirmed", // ✅ Now confirmed since payment is successful
      payment: newPayment._id, // ✅ LINKED TO PAYMENT!
    });

    // Clear the cart securely after successful payment
    await Cart.findOneAndDelete({ user: req.user._id });

    res.json({
      success: true,
      message: "Payment verified successfully",
      razorpay_order_id,
      razorpay_payment_id,
    });

  } catch (err) {
    // Log detailed error for debugging
    console.error("Payment verification error:", {
      error: err.message,
      stack: err.stack,
      orderId: req.body.razorpay_order_id,
      userId: req.user?._id
    });
    
    // Return generic error to client (don't expose internal details)
    res.status(500).json({ 
      success: false,
      message: "Payment verification failed. Please try again or contact support." 
    });
  }
});

module.exports = router;