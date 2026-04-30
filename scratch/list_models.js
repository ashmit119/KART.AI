const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log('Available models:');
    models.forEach(m => console.log(`- ${m.name}`));
  } catch (e) {
    console.error('Error listing models:', e);
  }
}

listModels();
