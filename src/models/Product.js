const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  cloudinaryId: {
    type: String,
  },
  vector_embedding: {
    type: [Number],
    index: false,
  },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
