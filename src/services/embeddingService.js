const { AutoProcessor, CLIPVisionModelWithProjection, RawImage, env } = require('@huggingface/transformers');
require('dotenv').config();

// Apply memory-saving ONNX configurations to restrict threads and memory pre-allocation
env.backends.onnx.sessionOptions = {
  use_memory_arena: false,
  intra_op_num_threads: 1,
  inter_op_num_threads: 1,
};

/**
 * Generates a vector embedding for an image.
 * To keep memory usage under 512MB, the model is loaded on demand
 * and its ONNX runtime session is immediately released after inference.
 * @param {Buffer} imageBuffer - The image data (JPEG/PNG)
 * @returns {Promise<number[]>} - The 512-dimension feature vector
 */
const generateImageEmbedding = async (imageBuffer) => {
  let clipModel = null;
  try {
    // 1. Load the model and processor on demand
    clipModel = await CLIPVisionModelWithProjection.from_pretrained(
      'Xenova/clip-vit-base-patch32',
      { quantized: true }
    );
    const clipProcessor = await AutoProcessor.from_pretrained('Xenova/clip-vit-base-patch32');

    // 2. Read the image and generate embedding
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
  } finally {
    // 3. Explicitly release memory from ONNX Runtime sessions
    if (clipModel && clipModel.sessions) {
      for (const key in clipModel.sessions) {
        try {
          await clipModel.sessions[key].release();
        } catch (releaseErr) {
          console.warn('Failed to release session:', releaseErr.message);
        }
      }
    }
    // 4. Force V8 garbage collection if run with --expose-gc
    if (global.gc) {
      global.gc();
    }
  }
};

module.exports = { 
  generateImageEmbedding 
};


