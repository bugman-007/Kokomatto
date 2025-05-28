require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY || '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',
    apiUrl: 'https://api-inference.huggingface.co/models/sayakpaul/stable-diffusion-2-1-unclip'
  },
  corsOptions: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    optionsSuccessStatus: 200
  }
};