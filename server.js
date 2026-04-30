require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db');

// Import Routes
const adminRoutes = require('./src/routes/adminRoutes');
const searchRoutes = require('./src/routes/searchRoutes');
const chatRoutes = require('./src/routes/chatRoutes');
const checkoutRoutes = require('./src/routes/checkoutRoutes');
const webhookRoutes = require('./src/routes/webhookRoutes');
const authRoutes = require('./src/routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
connectDB();

// CORS Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:8081'
}));

// Webhook route needs raw body parser, so it MUST be defined before express.json()
app.use('/api/webhooks', webhookRoutes);

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/auth', authRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'KartAI Backend is running.' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
