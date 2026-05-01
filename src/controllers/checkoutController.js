const Stripe = require('stripe');
const Order = require('../models/Order');
const Product = require('../models/Product');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (req, res) => {
  try {
    const { items } = req.body; // Array of { productId, quantity }

    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'Cart items are required' });
    }

    const lineItems = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product with id ${item.productId} not found` });
      }

      const amount = product.price * 100; // Stripe expects amount in cents
      totalAmount += amount * item.quantity;

      lineItems.push({
        price_data: {
          currency: 'inr',
          product_data: {
            name: product.name,
            images: [product.imageUrl],
          },
          unit_amount: amount,
        },
        quantity: item.quantity,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
    });

    // Create Order in pending state
    const order = new Order({
      items: items,
      totalAmount: totalAmount / 100, // Store in dollars
      stripeSessionId: session.id,
      status: 'Pending',
    });

    await order.save();

    res.status(200).json({ url: session.url });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal server error creating checkout session.' });
  }
};

module.exports = {
  createCheckoutSession,
};
