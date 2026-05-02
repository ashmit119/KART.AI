const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');
const { generateImageEmbedding } = require('../services/embeddingService');

const createProduct = async (req, res) => {
  try {
    const { name, description, price, category } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    // Step 1: Generate vector embedding using the BUFFER (Before uploading to Cloudinary)
    console.log('Step 1: Generating image embedding...');
    let vector_embedding = [];
    try {
      // Pass the buffer directly to our new Hugging Face service
      vector_embedding = await generateImageEmbedding(req.file.buffer);
      console.log('Step 1 OK — Embedding length:', vector_embedding.length);
    } catch (embErr) {
      console.warn('Step 1 SKIPPED — Could not generate embedding:', embErr.message);
    }

    // Step 2: Upload image to Cloudinary
    console.log('Step 2: Uploading image to Cloudinary...');
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    const uploadResult = await cloudinary.uploader.upload(dataURI, {
      folder: 'kartai_products',
    });

    const imageUrl = uploadResult.secure_url;
    const cloudinaryId = uploadResult.public_id;
    console.log('Step 2 OK — Cloudinary URL:', imageUrl);

    // Step 3: Save to MongoDB
    console.log('Step 3: Saving product to MongoDB...');
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
    console.log('Step 3 OK — Product saved, ID:', newProduct._id);

    res.status(201).json({
      message: 'Product created successfully',
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

    // 1. Always delete from MongoDB first to ensure it disappears from the site
    await Product.findByIdAndDelete(productId);
    console.log('Product deleted from MongoDB');

    // 2. Try to delete from Cloudinary in the background
    if (product.cloudinaryId) {
      cloudinary.uploader.destroy(product.cloudinaryId).catch(err => {
        console.warn('Background Cloudinary cleanup failed:', err.message);
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
