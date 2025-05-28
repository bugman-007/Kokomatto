const { createCanvas, loadImage } = require('canvas');
const { Buffer } = require('buffer');

const imageToBase64 = (imageBuffer) => {
  try {
    const base64String = imageBuffer.toString('base64');
    return `data:image/png;base64,${base64String}`;
  } catch (error) {
    throw new Error(`Image to base64 conversion failed: ${error.message}`);
  }
};

const base64ToImage = (base64String) => {
  try {
    if (base64String.includes('base64,')) {
      base64String = base64String.split('base64,')[1];
    }
    return Buffer.from(base64String, 'base64');
  } catch (error) {
    throw new Error(`Base64 to image conversion failed: ${error.message}`);
  }
};

module.exports = {
  imageToBase64,
  base64ToImage
};