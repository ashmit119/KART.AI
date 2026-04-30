const Stripe = require('stripe');
const Order = require('../models/Order');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    // Note: req.body must be the raw buffer here
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    try {
      // Find the order with the matching session ID and update it
      const order = await Order.findOneAndUpdate(
        { stripeSessionId: session.id },
        { status: 'Paid' },
        { new: true }
      );

      if (order) {
        console.log(`Order ${order._id} marked as Paid.`);
      } else {
        console.warn(`Order with session ID ${session.id} not found.`);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      // Even if order update fails, we return 200 to acknowledge receipt of event
    }
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send();
};

module.exports = {
  handleStripeWebhook,
};
