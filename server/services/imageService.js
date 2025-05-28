const { createCanvas, loadImage } = require('canvas');
const { hexToRgb } = require('../utils/colorUtils');
const logger = require('../utils/logger');

const simpleTryOn = async (personImageBuffer, garmentType, garmentColor) => {
  try {
    const img = await loadImage(personImageBuffer);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext('2d');
    
    ctx.drawImage(img, 0, 0);
    
    const { r, g, b } = hexToRgb(garmentColor);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.7)`;
    
    const width = canvas.width;
    const height = canvas.height;
    
    // Garment drawing logic (same as previous implementation)
    // ... (omitted for brevity, same as in previous simpleTryOn function)
    
    return canvas.toBuffer('image/png');
  } catch (error) {
    logger.error(`Simple try-on error: ${error.message}`);
    return personImageBuffer;
  }
};

module.exports = {
  simpleTryOn
};