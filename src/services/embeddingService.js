const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();

const HF_SPACE_URL = process.env.HF_SPACE_URL || 'https://ashmit119-kart-ai.hf.space/embed';

/**
 * Generates a vector embedding for an image using the Hugging Face microservice.
 * @param {Buffer} imageBuffer - The image data.
 * @returns {Promise<number[]>} - The 512-dimension feature vector.
 */
const generateImageEmbedding = async (imageBuffer) => {
  try {
    const form = new FormData();
    form.append('image', imageBuffer, {
      filename: 'image.jpg',
      contentType: 'image/jpeg',
    });

    const response = await axios.post(HF_SPACE_URL, form, {
      headers: { ...form.getHeaders() },
    });

    if (response.data?.vector) {
      return response.data.vector;
    }
    throw new Error('Invalid response from AI service');
  } catch (error) {
    console.error('AI Service Error:', error.message);
    throw new Error('AI Search service unavailable.');
  }
};

module.exports = { generateImageEmbedding };
