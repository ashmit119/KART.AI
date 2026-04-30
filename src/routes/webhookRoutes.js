const express = require('express');
const { handleStripeWebhook } = require('../controllers/webhookController');

const router = express.Router();

// The webhook endpoint must receive the raw body to verify the signature
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

module.exports = router;
