const express = require('express');
const router = express.Router();
const { authAdminLogin } = require('../controllers/adminAuthController');

// Ruta para login de administradores
router.post('/login', authAdminLogin);

module.exports = router;
