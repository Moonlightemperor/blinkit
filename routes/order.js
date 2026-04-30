const express = require("express");
const router = express.Router();
const { userIsLoggedIn } = require("../middlewares/admin");
const { Payment } = require("../Models/payment");
const { Order } = require("../Models/order");

router.get("/payment-failed", userIsLoggedIn, (req, res) => {
  res.render("order-failed", {
    reason: req.query.reason || "",
    user: req.user,
  });
});

router.get("/success/:razorpayOrderId", userIsLoggedIn, async (req, res) => {
  try {
    const { razorpayOrderId } = req.params;

    const payment = await Payment.findOne({
      orderId: razorpayOrderId,
      user: req.user._id,
    }).lean();

    if (!payment) {
      return res.status(404).render("order-error", {
        title: "Order not found",
        message:
          "We could not find this payment. It may belong to another account or the link is invalid.",
        user: req.user,
      });
    }

    // Check if the associated order has an address, if not redirect to address selection
    const order = await Order.findOne({ 
      orderID: razorpayOrderId,
      user: req.user._id 
    });
    
    if (order && !order.address) {
      return res.redirect('/order/address/' + razorpayOrderId);
    }
    
    // If order has address, redirect to order details
    if (order && order.address) {
      return res.redirect('/order/details/' + razorpayOrderId);
    }

    res.render("order-success", {
      payment,
      user: req.user,
    });
  } catch (error) {
    console.error("ORDER SUCCESS PAGE ERROR:", error);
    res.status(500).render("order-error", {
      title: "Something went wrong",
      message: "Please try again or contact support.",
      user: req.user,
    });
  }
});

// Deprecated address routes removed - handled in checkout flow instead

router.get("/details/:orderid", userIsLoggedIn, async function (req, res) {
  try {
    let order = await Order.findOne({ orderID: req.params.orderid })
      .populate('products.product'); 
    
    if (!order) {
      return res.status(404).render("order-error", {
        title: "Order not found",
        message: "This order could not be found.",
        user: req.user,
      });
    }
    
    // Only allow the order owner to view the details
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).render("order-error", {
        title: "Access Denied",
        message: "You are not authorized to view this order.",
        user: req.user,
      });
    }
    
    res.render("order-details", {
      order,
      user: req.user,
    });
  } catch (error) {
    console.error("Order details error:", error);
    res.status(500).render("order-error", {
      title: "Something went wrong",
      message: "Please try again or contact support.",
      user: req.user,
    });
  }
});

module.exports = router;
