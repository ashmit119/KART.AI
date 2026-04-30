const { GoogleGenAI } = require('@google/genai');
const Product = require('../models/Product');
require('dotenv').config();

// Initialize the client with your key
const client = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const handleChat = async (req, res) => {
  try {
    const { message } = req.body;

    // 1. Basic validation
    if (!message) {
      return res.status(400).json({ error: 'Message is required.' });
    }

    // 2. Database Fetch - Using your specific Product model logic
    const products = await Product.find({}, { name: 1, category: 1, price: 1, _id: 0 });
    const productList = products.length > 0
      ? products.map(p => `- ${p.name} (${p.category}): ₹${p.price}`).join('\n')
      : "Our catalog is currently being updated.";

    // 3. System Instructions formatted for the Gemini 3 Flash model
    const systemInstruction = `You are the KART.AI shopping assistant. 
    Role: Help users find products in our store. 
    Current Catalog:
    ${productList}

    Guidelines:
    - Be helpful, polite, and premium in your tone. 
    - Prices are in Rupees (₹).
    - If a product isn't in the list, politely inform the user.`;

    // 4. Stateless Generation - Avoiding session-related 500 errors
    const result = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `${systemInstruction}\n\nUser Question: ${message}` }],
        }
      ],
      config: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    });

    const text = result.text;

    res.status(200).json({
      success: true,
      reply: text
    });

  } catch (error) {
    // Audit Logging: Seeing the exact stack trace for the 500 error
    console.error('--- KART.AI CHAT SYSTEM AUDIT ERROR ---');
    console.error('Stack Trace:', error.stack);
    console.error('Message:', error.message);

    if (error.message.includes('401') || error.message.includes('API_KEY_INVALID')) {
      return res.status(500).json({ error: 'Gemini API Key is invalid or missing.' });
    }

    if (error.message.includes('404')) {
      return res.status(500).json({ error: 'Model not found. Try gemini-1.5-flash.' });
    }

    res.status(500).json({ error: 'The shopping assistant is temporarily unavailable. Please try again.' });
  }
};

module.exports = {
  handleChat,
};