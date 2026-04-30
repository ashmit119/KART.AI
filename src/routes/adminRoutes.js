const express = require('express');
const multer = require('multer');
const { createProduct, getAllProducts, deleteProduct } = require('../controllers/productController');

const router = express.Router();

// Setup multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Get all products (Public route for frontend catalog)
router.get('/products', getAllProducts);

// Admin route to create a product with an image
// NOTE: Auth middleware temporarily removed for testing. Re-add protect + admin once you have an admin user.
router.post('/products', upload.single('image'), createProduct);

// Admin route to delete a product
router.delete('/products/:id', deleteProduct);

module.exports = router;
