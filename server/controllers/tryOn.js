const { callHuggingfaceApi } = require('../services/huggingface');
const { simpleTryOn } = require('../services/imageService');
const { imageToBase64, base64ToImage } = require('../utils/imageUtils');
const logger = require('../utils/logger');

const virtualTryOn = async (req, res, next) => {
  try {
    const { person_image, garment_type = 'tshirt', garment_color = '#1e40af' } = req.body;
    
    if (!person_image) {
      return res.status(400).json({ error: "Missing required parameters" });
    }
    
    logger.info(`Processing try-on for ${garment_type} in color ${garment_color}`);
    
    const personImageBuffer = base64ToImage(person_image);
    
    // Try Hugging Face API first
    const apiResult = await callHuggingfaceApi(personImageBuffer, garment_type, garment_color);
    
    if (apiResult) {
      logger.info("Successfully used Hugging Face API");
      return res.json({
        success: true,
        result_image: imageToBase64(apiResult),
        method: "huggingface_api"
      });
    }
    
    // Fallback to simple overlay
    logger.info("Falling back to simple overlay");
    const resultImage = await simpleTryOn(personImageBuffer, garment_type, garment_color);
    
    return res.json({
      success: true,
      result_image: imageToBase64(resultImage),
      method: "fallback_overlay"
    });
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  virtualTryOn
};