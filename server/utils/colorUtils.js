const getColorName = (hexCode) => {
    const colorMap = {
      '#1e40af': 'navy blue',
      '#334155': 'charcoal',
      '#166534': 'forest green',
      '#9f1239': 'burgundy',
      '#7e22ce': 'royal purple',
      '#c2410c': 'rust orange'
    };
    return colorMap[hexCode.toLowerCase()] || "colored";
  };
  
  const hexToRgb = (hex) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };
  
  module.exports = {
    getColorName,
    hexToRgb
  };