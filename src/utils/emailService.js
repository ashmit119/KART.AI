const emailjs = require('@emailjs/nodejs');
const Product = require('../models/Product'); // Ensure the Product model is registered for populate
require('dotenv').config();

// Initialize EmailJS with public key and optional private key
emailjs.init({
  publicKey: process.env.EMAILJS_PUBLIC_KEY,
  privateKey: process.env.EMAILJS_PRIVATE_KEY,
});

/**
 * Send an order confirmation email to the user.
 * @param {Object} user   - User object with at least { email }
 * @param {Object} order  - Mongoose Order document
 * @returns {boolean}     - true on success, false on failure
 */
const sendOrderConfirmationEmail = async (user, order) => {
  try {
    // Populate the product details for the order items
    await order.populate('items.productId');

    // Derive a display name from the email (e.g. "john" from "john@example.com")
    const displayName = user.email.split('@')[0];

    // Map the order items to match the {{#orders}} list in the EmailJS template
    const ordersList = order.items.map(item => ({
      name: item.productId ? item.productId.name : 'Unknown Product',
      price: item.productId ? item.productId.price : 0,
      units: item.quantity,
    }));

    const templateParams = {
      email: user.email,             // Matches {{email}} in "To Email" field
      to_email: user.email,          // Fallback/compatibility
      to_name: displayName,
      order_id: order._id.toString(),
      order_date: new Date(order.createdAt).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      orders: ordersList,            // Matches {{#orders}} ... {{/orders}} loop
      cost: {
        shipping: 0,
        tax: 0,
        total: order.totalAmount,
      },
      total: order.totalAmount,
    };

    await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_ORDER_TEMPLATE_ID,
      templateParams
    );

    console.log(`[EmailJS] Order confirmation email sent to ${user.email} for order #${order._id}`);
    return true;
  } catch (error) {
    console.error(`[EmailJS] Failed to send order confirmation email:`, error?.text || error?.message || error);
    return false;
  }
};

module.exports = { sendOrderConfirmationEmail };
