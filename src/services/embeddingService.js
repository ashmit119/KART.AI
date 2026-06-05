const axios = require('axios');
const FormData = require('form-data');

/**
 * Generates a vector embedding for an image by sending it to the custom
 * Hugging Face Space Python API. This offloads model inference to the cloud,
 * ensuring zero local RAM consumption (perfect for 512MB memory limits).
 * @param {Buffer} imageBuffer - The image data (JPEG/PNG)
 * @returns {Promise<number[]>} - The 512-dimension feature vector
 */
const generateImageEmbedding = async (imageBuffer) => {
  try {
    const formData = new FormData();
    formData.append('image', imageBuffer, {
      filename: 'search.png',
      contentType: 'image/png'
    });

    const response = await axios.post('https://ashmit119-kart-ai.hf.space/embed', formData, {
      headers: formData.getHeaders()
    });

    if (response.data && response.data.vector) {
      return response.data.vector;
    } else if (response.data && response.data.error) {
      throw new Error(response.data.error);
    } else {
      throw new Error('Invalid response from AI Space.');
    }
  } catch (error) {
    console.error('Image Embedding Error:', error.message);
    throw new Error(`Failed to generate image embedding: ${error.message}`);
  }
};

module.exports = { 
  generateImageEmbedding 
};



