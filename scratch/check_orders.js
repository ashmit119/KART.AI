require('dotenv').config();
const mongoose = require('mongoose');
const Order = require('../src/models/Order');
const User = require('../src/models/User');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const orders = await Order.find().sort({ createdAt: -1 }).limit(5).lean();
  console.log('--- RECENT ORDERS ---');
  for (const o of orders) {
    let email = 'N/A';
    if (o.userId) {
      const u = await User.findById(o.userId).lean();
      email = u ? u.email : 'User not found';
    }
    console.log(`Order ID: ${o._id}`);
    console.log(`Status: ${o.status}`);
    console.log(`Total: ${o.totalAmount}`);
    console.log(`User ID: ${o.userId} (Email: ${email})`);
    console.log(`Items Count: ${o.items ? o.items.length : 0}`);
    console.log(`Created At: ${o.createdAt}`);
    console.log(`Stripe Session ID: ${o.stripeSessionId}`);
    console.log('---------------------');
  }
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
