const express = require('express');
const router = express.Router();
const { virtualTryOn } = require('../controllers/tryOn');
const { getMeasurements } = require('../controllers/measurements');
const { imageToModel } = require('../controllers/imageToModel');

router.post('/try-on', virtualTryOn);
router.post('/measurements', getMeasurements);
router.post('/imagetomodel', imageToModel);
console.log("In api.js, router: ");

module.exports = router;