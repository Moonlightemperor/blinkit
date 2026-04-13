const { Order } = require('./Models/order');
require('./config/db');

async function checkOrders() {
  try {
    const orders = await Order.find({}).lean();
    console.log('Orders found:', orders.length);
    orders.forEach(order => {
      console.log('OrderID:', order.orderID);
      console.log('User:', order.user);
      console.log('Address:', order.address);
      console.log('---');
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkOrders();
