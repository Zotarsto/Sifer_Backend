const express = require('express');
const { check } = require('express-validator');
const { registerCajero } = require('../controllers/cajerosController');

const router = express.Router();

router.post(
  '/registro',
  [
    check('nombre').notEmpty().withMessage('El nombre es obligatorio'),
    check('apellido').notEmpty().withMessage('El apellido es obligatorio'),
    check('correo_electronico')
      .isEmail()
      .withMessage('Debe ser un correo válido'),
    check('telefono')
      .isLength({ min: 10, max: 10 })
      .withMessage('El teléfono debe tener 10 dígitos'),
    check('contrasena')
      .isLength({ min: 6 })
      .withMessage('La contraseña debe tener al menos 6 caracteres'),
  ],
  registerCajero
);

module.exports = router;
