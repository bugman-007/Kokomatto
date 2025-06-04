const express = require('express');
const router = express.Router();
const { virtualTryOn } = require('../controllers/tryOn');
const { getMeasurements } = require('../controllers/measurements');
const { imageToModel, proxyGLB } = require('../controllers/imageToModel');
const { downloadGLB } = require('../controllers/downloadGLB');

router.post('/try-on', virtualTryOn);
router.post('/measurements', getMeasurements);
router.post('/imagetomodel', imageToModel);
router.get('/proxy-glb', proxyGLB);
router.post('/download-glb', downloadGLB)

module.exports = router;