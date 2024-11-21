const conexion = require('../database');

const authCajeroLogin = (req, res) => {
  const { correo_electronico, contrasena } = req.body;

  // Validar campos vacíos
  if (!correo_electronico || !contrasena) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }

  console.log('Correo recibido:', correo_electronico);

  // Consulta en la base de datos
  conexion.query(
    'SELECT * FROM cajeros WHERE correo_electronico = ?',
    [correo_electronico],
    (error, results) => {
      if (error) {
        console.error('Error en la consulta:', error);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
      }

      if (results.length === 0) {
        console.log('Usuario no encontrado');
        return res.status(404).json({ mensaje: 'Usuario o contraseña incorrectos' });
      }

      const cajero = results[0];

      // Comparar contraseñas en texto plano
      if (contrasena !== cajero.contrasena) {
        console.log('Contraseña incorrecta');
        return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
      }
      // Login exitoso
      console.log('Inicio de sesión (Cajero) exitoso');
      res.status(200).json({
        mensaje: 'Inicio de sesión exitoso',
        cajero: {
          id: cajero.id,
          nombre: cajero.nombre,
          apellido: cajero.apellido,
          correo_electronico: cajero.correo_electronico,
        },
      });
    }
  );
};

module.exports = { authCajeroLogin };
