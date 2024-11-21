const conexion = require('../database');

const registrarVenta = (req, res) => {
  const { id_cajero, detalles } = req.body;

  // Validar que el cajero exista
  conexion.query('SELECT * FROM cajeros WHERE id = ?', [id_cajero], (error, results) => {
    if (error) {
      return res.status(500).json({ mensaje: 'Error en el servidor' });
    }
    if (results.length === 0) {
      return res.status(400).json({ mensaje: 'El cajero no existe' });
    }

    // Insertar venta
    const total = detalles.reduce((acc, item) => acc + item.subtotal, 0);
    conexion.query(
      'INSERT INTO ventas (id_cajero, total) VALUES (?, ?)',
      [id_cajero, total],
      (error, results) => {
        if (error) {
          return res.status(500).json({ mensaje: 'Error al registrar la venta' });
        }
        const id_venta = results.insertId;

        // Insertar detalles de la venta
        const valores = detalles.map((item) => [
          id_venta,
          item.id_producto,
          item.cantidad,
          item.precio,
          item.subtotal,
        ]);

        conexion.query(
          'INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio, subtotal) VALUES ?',
          [valores],
          (error) => {
            if (error) {
              return res.status(500).json({ mensaje: 'Error al registrar los detalles de la venta' });
            }
            res.status(201).json({ mensaje: 'Venta registrada con éxito' });
          }
        );
      }
    );
  });
};

module.exports = { registrarVenta };
