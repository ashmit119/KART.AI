const Product = require('../models/Product');
const { generateImageEmbedding } = require('../services/embeddingService');

const visualSearch = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Search image file is required.' });
    }

    console.log('Visual Search Step 1: Generating query vector...');
    // 1. Convert the image buffer to a vector embedding
    const queryVector = await generateImageEmbedding(req.file.buffer);
    console.log('Visual Search Step 1 OK — Vector length:', queryVector.length);

    // 2. Execute MongoDB $vectorSearch aggregation
    console.log('Visual Search Step 2: Querying MongoDB Atlas...');
    const pipeline = [
      {
        $vectorSearch: {
          index: 'vector_index',
          path: 'vector_embedding',
          queryVector: queryVector,
          numCandidates: 100,
          limit: 3,
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          price: 1,
          category: 1,
          imageUrl: 1,
          score: { $meta: 'vectorSearchScore' }
        }
      }
    ];

    const results = await Product.aggregate(pipeline);
    console.log('Visual Search Step 2 OK — Found matches:', results.length);

    res.status(200).json({
      success: true,
      data: results
    });

  } catch (error) {
    console.error('Error during visual search:', error);
    res.status(500).json({ error: 'Internal server error during search.', details: error.message });
  }
};

module.exports = {
  visualSearch,
};
