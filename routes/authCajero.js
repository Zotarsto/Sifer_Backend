const express = require('express');
const router = express.Router();
const { authCajeroLogin } = require('../controllers/cajeroAuthController');

// Ruta para login de cajeros
router.post('/login', authCajeroLogin);

module.exports = router;
