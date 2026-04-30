const express = require('express');
const multer = require('multer');
const { visualSearch } = require('../controllers/searchController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/visual', upload.single('image'), visualSearch);

module.exports = router;
