const { pipeline, RawImage } = require('@huggingface/transformers');

let extractorPipeline = null;

/**
 * Initialize the pipeline. This downloads the model on the first run.
 */
const getEmbeddingPipeline = async () => {
  if (!extractorPipeline) {
    console.log('Loading HuggingFace transformer model (Xenova/clip-vit-base-patch32)...');
    // We use the image-feature-extraction pipeline for extracting visual features
    extractorPipeline = await pipeline('image-feature-extraction', 'Xenova/clip-vit-base-patch32');
    console.log('Model loaded successfully.');
  }
  return extractorPipeline;
};

/**
 * Generates a 512-dimension vector embedding for a given image.
 * @param {string|Buffer} imageSource - The URL or Buffer of the image.
 * @returns {Promise<number[]>} - The 512-d feature vector.
 */
const generateImageEmbedding = async (imageSource) => {
  try {
    const extractor = await getEmbeddingPipeline();
    
    let image;
    if (typeof imageSource === 'string') {
      // It's a URL
      image = await RawImage.read(imageSource);
    } else if (Buffer.isBuffer(imageSource)) {
      // It's a Buffer, in v3 you can read from buffer using Blob or directly in some methods.
      // Assuming we pass it to RawImage
      const blob = new Blob([imageSource]);
      image = await RawImage.read(blob);
    } else {
      throw new Error('Unsupported image source type');
    }

    // Extract features
    const output = await extractor(image);
    
    // Output is a Tensor. We convert its data to a standard JS array.
    // CLIP outputs a 512-dimension array for pooler_output.
    const vector = Array.from(output.data);
    
    return vector;
  } catch (error) {
    console.error('Error generating image embedding:', error);
    throw error;
  }
};

module.exports = {
  generateImageEmbedding,
};
