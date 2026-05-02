require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

async function checkProducts() {
  await mongoose.connect(process.env.MONGO_URI);
  const count = await Product.countDocuments();
  console.log(`Found ${count} products in the database.`);
  process.exit(0);
}

checkProducts();
