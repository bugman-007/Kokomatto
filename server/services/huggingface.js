const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

const callHuggingfaceApi = async (imageBuffer, garmentType, garmentColor) => {
  try {
    const { getColorName } = require('../utils/colorUtils');
    const colorName = getColorName(garmentColor);
    
    let prompt;
    switch (garmentType) {
      case 'tshirt':
        prompt = `high quality photo of a person wearing a ${colorName} t-shirt, photorealistic, detailed clothing`;
        break;
      case 'pants':
        prompt = `high quality photo of a person wearing ${colorName} pants, photorealistic, detailed clothing`;
        break;
      case 'jacket':
        prompt = `high quality photo of a person wearing a ${colorName} jacket, photorealistic, detailed clothing`;
        break;
      case 'dress':
        prompt = `high quality photo of a person wearing a ${colorName} dress, photorealistic, detailed clothing`;
        break;
      default:
        prompt = `high quality photo of a person wearing ${colorName} ${garmentType}, photorealistic, detailed clothing`;
    }
    
    const headers = {
      "Authorization": `Bearer ${config.huggingface.apiKey}`,
      "Content-Type": "application/json"
    };
    
    const payload = {
      "inputs": {
        "image": imageBuffer.toString('base64'),
        "prompt": prompt,
        "negative_prompt": "bad quality, blurry, distorted body, unrealistic clothing"
      }
    };
    
    logger.info(`Calling Hugging Face API with prompt: ${prompt}`);
    
    const response = await axios.post(config.huggingface.apiUrl, payload, { 
      headers,
      responseType: 'arraybuffer',
      timeout: 60000
    });
    
    if (response.status === 200) {
      return Buffer.from(response.data, 'binary');
    }
    return null;
  } catch (error) {
    logger.error(`Hugging Face API error: ${error.message}`);
    return null;
  }
};

module.exports = {
  callHuggingfaceApi
};