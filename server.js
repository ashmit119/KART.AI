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

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:8080',
  'http://localhost:8081',
  'http://localhost:5173',
  'https://kart-ai.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    const isAllowed = !origin || 
      allowedOrigins.includes(origin) || 
      origin.endsWith('.vercel.app');
    
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Routes
app.use('/api/webhooks', webhookRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(PORT, () => {
  console.log(`KartAI Server active on port ${PORT}`);
});
