const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

// Your new Hugging Face Space URL
const HF_SPACE_URL = 'https://ashmit119-kart-ai.hf.space/embed';

/**
 * Generates a vector embedding for a given image by calling your dedicated 
 * Hugging Face Space. This keeps your Render server under the memory limit.
 * @param {Buffer} imageBuffer - The image data.
 * @returns {Promise<number[]>} - The feature vector.
 */
const generateImageEmbedding = async (imageBuffer) => {
  try {
    const form = new FormData();
    form.append('image', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });

    const response = await axios.post(HF_SPACE_URL, form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    if (response.data && response.data.vector) {
      return response.data.vector;
    } else {
      throw new Error('Invalid response from Hugging Face Space');
    }
  } catch (error) {
    console.error('Error calling Hugging Face AI Space:', error.message);
    throw new Error('AI Search service is currently unavailable.');
  }
};

module.exports = {
  generateImageEmbedding,
};
