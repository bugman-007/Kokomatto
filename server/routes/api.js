const express = require('express');
const router = express.Router();
const { virtualTryOn } = require('../controllers/tryOn');
const { getMeasurements } = require('../controllers/measurements');

router.post('/try-on', virtualTryOn);
router.post('/measurements', getMeasurements);

module.exports = router;