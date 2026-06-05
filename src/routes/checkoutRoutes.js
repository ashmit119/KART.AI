const express = require('express');
const { createCheckoutSession } = require('../controllers/checkoutController');
const { optionalProtect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-session', optionalProtect, createCheckoutSession);

module.exports = router;
