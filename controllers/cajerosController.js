const conexion = require('../database');
const { validationResult } = require('express-validator');

const registerCajero = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errores: errors.array() });
  }

  const { nombre, apellido, correo_electronico, telefono, contrasena } = req.body;

  // Validar si el correo ya existe
  conexion.query(
    'SELECT * FROM cajeros WHERE correo_electronico = ?',
    [correo_electronico],
    (error, results) => {
      if (error) {
        return res.status(500).json({ mensaje: 'Error en el servidor' });
      }
      if (results.length > 0) {
        return res.status(400).json({ mensaje: 'El correo ya está registrado' });
      }

      // Insertar cajero en la base de datos sin encriptar la contraseña
      conexion.query(
        'INSERT INTO cajeros (nombre, apellido, correo_electronico, telefono, contrasena) VALUES (?, ?, ?, ?, ?)',
        [nombre, apellido, correo_electronico, telefono, contrasena],
        (error) => {
          if (error) {
            return res.status(500).json({ mensaje: 'Error al registrar el cajero' });
          }
          res.status(201).json({ mensaje: 'Cajero registrado con éxito' });
        }
      );
    }
  );
};

module.exports = { registerCajero };
