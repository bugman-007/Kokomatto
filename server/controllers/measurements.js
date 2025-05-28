const getMeasurements = (req, res, next) => {
    try {
      if (!req.body.person_image) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      
      const measurements = {
        height: 175,
        weight: 70,
        chest: 95,
        waist: 80,
        hips: 95,
        inseam: 80
      };
      
      res.json({ success: true, measurements });
    } catch (error) {
      next(error);
    }
  };
  
  module.exports = {
    getMeasurements
  };