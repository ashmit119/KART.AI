const { AutoProcessor, CLIPVisionModelWithProjection, RawImage } = require('@huggingface/transformers');
require('dotenv').config();

/**
 * Global variable to cache the loaded CLIP model and processor
 */
let clipModel = null;
let clipProcessor = null;

/**
 * Initialize CLIP model and processor on demand (lazy loading)
 * This ensures the model is loaded once and reused for all searches
 * @returns {Promise<void>}
 */
const initializeModel = async () => {
  if (clipModel && clipProcessor) {
    return; // Already initialized, reuse cached model/processor
  }
  try {
    console.log('Loading AI model...');
    const startTime = Date.now();

    // Load the model
    clipModel = await CLIPVisionModelWithProjection.from_pretrained(
      'Xenova/clip-vit-base-patch32',
      {
        quantized: true, // Use quantized version for faster loading
        progress_callback: (data) => {
          if (data.status === 'downloading') {
            console.log(`  Downloading: ${(data.progress || 0).toFixed(1)}%`);
          }
        },
      }
    );

    // Load the processor
    clipProcessor = await AutoProcessor.from_pretrained('Xenova/clip-vit-base-patch32');

    const loadTime = Date.now() - startTime;
    console.log(`AI model ready (loaded in ${(loadTime / 1000).toFixed(2)}s)`);
  } catch (error) {
    console.error('Failed to initialize CLIP model:', error.message);
    throw new Error(`AI model initialization failed: ${error.message}`);
  }
};

/**
 * Generates a vector embedding for an image using the cached CLIP model
 * @param {Buffer} imageBuffer - The image data (JPEG/PNG)
 * @returns {Promise<number[]>} - The 512-dimension feature vector
 * @throws {Error} If model is not initialized or processing fails
 */
const generateImageEmbedding = async (imageBuffer) => {
  try {
    // Lazy initialize the model on first call
    await initializeModel();

    if (!clipModel || !clipProcessor) {
      throw new Error('CLIP model could not be initialized.');
    }

    // Convert Buffer to a Web Blob for RawImage parsing
    const imageBlob = new Blob([imageBuffer]);
    const image = await RawImage.read(imageBlob);

    // Create image tensor and process (processor handles scaling & normalization)
    const { pixel_values } = await clipProcessor(image);

    // Generate embeddings
    const { image_embeds } = await clipModel({ pixel_values });

    // Convert tensor to array
    const embedding = Array.from(image_embeds.data);

    return embedding;
  } catch (error) {
    console.error('Image Embedding Error:', error.message);
    throw new Error(`Failed to generate image embedding: ${error.message}`);
  }
};

module.exports = { 
  initializeModel,
  generateImageEmbedding 
};

