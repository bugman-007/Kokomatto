require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  huggingface: {
    apiKey: process.env.HUGGINGFACE_API_KEY || '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',
    apiUrl: 'https://api-inference.huggingface.co/models/sayakpaul/stable-diffusion-2-1-unclip'
  },
  corsOptions: {
    origin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',') 
      : ['http://localhost:3000', 'https://localhost:3000'], // Allow both HTTP and HTTPS for local dev
    optionsSuccessStatus: 200
  }
};