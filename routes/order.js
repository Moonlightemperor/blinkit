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

router.get("/address/:orderid", userIsLoggedIn, async function (req, res) {
  try {
    console.log('Accessing address page for order:', req.params.orderid);
    console.log('User:', req.user._id);
    
    let order = await Order.findOne({ orderID: req.params.orderid });
    console.log('Found order:', order);
    
    if (!order) {
      console.log('Order not found');
      return res.status(404).render("order-error", {
        title: "Order not found",
        message: "This order could not be found.",
        user: req.user,
      });
    }
    
    // Only allow the order owner to view the address selection
    if (order.user.toString() !== req.user._id.toString()) {
      console.log('Unauthorized access attempt');
      return res.status(403).render("order-error", {
        title: "Access Denied",
        message: "You are not authorized to access this order.",
        user: req.user,
      });
    }
    
    // If address is already set, redirect to order details
    if (order.address) {
      return res.redirect('/order/details/' + order.orderID);
    }
    
    console.log('Rendering map page');
    res.render("map", {
      orderid: order.orderID,
      user: req.user,
    });
  } catch (error) {
    console.error("Address page error:", error);
    res.status(500).render("order-error", {
      title: "Something went wrong",
      message: "Please try again or contact support.",
      user: req.user,
    });
  }
});

router.get("/details/:orderid", userIsLoggedIn, async function (req, res) {
  try {
    console.log('Accessing order details for:', req.params.orderid);
    
    let order = await Order.findOne({ orderID: req.params.orderid })
      .populate('user')
      .populate('products.product');
    
    console.log('Found order for details:', order);
    
    if (!order) {
      return res.status(404).render("order-error", {
        title: "Order not found",
        message: "This order could not be found.",
        user: req.user,
      });
    }
    
    // Only allow the order owner to view the details
    if (order.user._id.toString() !== req.user._id.toString()) {
      console.log('Unauthorized access to order details');
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

router.post("/address/:orderid", userIsLoggedIn, async function (req, res) {
  try {
    console.log('Updating address for order:', req.params.orderid);
    console.log('User:', req.user._id);
    console.log('Address:', req.body.address);
    
    let order = await Order.findOne({ orderID: req.params.orderid });
    console.log('Found order:', order);
    
    if (!order) {
      console.log('Order not found');
      return res.status(404).send("Sorry, this order is not found");
    }
    if (!req.body.address) {
      return res.status(400).send("Sorry, address is required");
    }
    
    // Only allow the order owner to update the address
    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).send("You are not authorized to update this order");
    }
    
    order.address = req.body.address;
    await order.save();
    console.log('Address saved successfully');
    
    // Redirect to order details page with proper order ID
    res.redirect('/order/details/' + order.orderID);
  } catch (error) {
    console.error("Address update error:", error);
    res.status(500).send("Internal server error");
  }
});

module.exports = router;
