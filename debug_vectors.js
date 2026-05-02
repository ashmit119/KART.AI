require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');

async function debugVectors() {
  await mongoose.connect(process.env.MONGO_URI);
  const products = await Product.find({}, { name: 1, vector_embedding: 1 }).limit(5);
  
  console.log("--- Vector Debug Report ---");
  products.forEach(p => {
    const vectorLength = p.vector_embedding ? p.vector_embedding.length : 0;
    console.log(`Product: ${p.name} | Vector Length: ${vectorLength}`);
  });
  
  if (products.length === 0) console.log("No products found in DB.");
  process.exit(0);
}

debugVectors();
