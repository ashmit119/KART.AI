const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const { generateImageEmbedding } = require('../services/embeddingService');

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    // Generate vector embedding using the buffer
    let vector_embedding = [];
    try {
      vector_embedding = await generateImageEmbedding(req.file.buffer);
    } catch (embErr) {
      console.warn('Embedding skipped:', embErr.message);
    }

    // Upload image to Cloudinary
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'kartai_products',
    });

    const imageUrl = uploadResult.secure_url;
    const cloudinaryId = uploadResult.public_id;

    // Save product to database
    const newProduct = new Product({
      name,
      description,
      price: Number(price),
      category,
      imageUrl,
      cloudinaryId,
      vector_embedding,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      product: {
        _id: newProduct._id,
        name: newProduct.name,
        price: newProduct.price,
        imageUrl: newProduct.imageUrl,
      },
    });

  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ error: 'Internal server error while creating product.' });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { categorySlug } = req.query;
    const filter = categorySlug ? { category: categorySlug } : {};
    
    const products = await Product.find(filter, { vector_embedding: 0 }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, products });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'Internal server error fetching products.' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Delete from database
    await Product.findByIdAndDelete(productId);

    // Background cleanup of Cloudinary assets
    if (product.cloudinaryId) {
      cloudinary.uploader.destroy(product.cloudinaryId).catch(err => {
        console.warn('Cloudinary cleanup failed:', err.message);
      });
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ error: 'Internal server error deleting product.' });
  }
};

module.exports = {
  createProduct,
  getAllProducts,
  deleteProduct,
};
