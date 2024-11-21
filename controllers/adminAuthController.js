const conexion = require('../database'); // Importar la conexión

const authAdminLogin = (req, res) => {
  const { correo_electronico, contrasena } = req.body;

  if (!correo_electronico || !contrasena) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }
  console.log('Correo recibido:', correo_electronico);

  conexion.query(
    'SELECT * FROM administradores WHERE correo_electronico = ?',
    [correo_electronico],
    (error, results) => {
      if (error) {
        console.error('Error en la consulta:', error);
        return res.status(500).json({ mensaje: 'Error en el servidor' });
      }

      if (results.length === 0) {
        return res.status(404).json({ mensaje: 'Usuario o contraseña incorrectos' });
      }

      const admin = results[0];

      // Comparar contraseñas en texto plano (temporal)
      if (contrasena !== admin.contrasena) {
        return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos' });
      }

      // Login exitoso
      console.log('Inicio de sesión (Administrador) exitoso');
      res.status(200).json({
        mensaje: 'Inicio de sesión exitoso',
        administrador: {
          id: admin.id,
          nombre: admin.nombre,
          apellido: admin.apellido,
          correo_electronico: admin.correo_electronico,
        },
      });
    }
  );
};

module.exports = { authAdminLogin };
