const express = require('express');
const router = express.Router();
const conexion = require('../database');

// Ruta para registrar una venta
router.post('/ventas', async (req, res) => {
  const { id_cajero, total, productos } = req.body;

  if (!id_cajero || !total || !productos || productos.length === 0) {
    return res.status(400).json({ mensaje: 'Datos incompletos' });
  }

  console.log('Datos recibidos:', req.body);

  try {
    // Registrar la venta en la tabla `ventas`
    const queryVenta = 'INSERT INTO ventas (id_cajero, total) VALUES (?, ?)';
    conexion.query(queryVenta, [id_cajero, total], (error, results) => {
      if (error) {
        console.error('Error al registrar la venta:', error);
        return res.status(500).json({ mensaje: 'Error al registrar la venta' });
      }

      const id_venta = results.insertId;

      // Registrar los productos en `detalle_venta`
      const queryDetalle = `
        INSERT INTO detalle_venta (id_venta, id_producto, cantidad, precio, subtotal)
        VALUES ?
      `;
      const detalles = productos.map((p) => [
        id_venta,
        p.id_producto,
        p.cantidad,
        p.precio,
        p.cantidad * p.precio,
      ]);

      conexion.query(queryDetalle, [detalles], (error) => {
        if (error) {
          console.error('Error al registrar el detalle de venta:', error);
          return res
            .status(500)
            .json({ mensaje: 'Error al registrar el detalle de venta' });
        }

        // Resta el stock de cada producto
        const restarStockPromises = productos.map((p) => {
          return new Promise((resolve, reject) => {
            conexion.query(
              'UPDATE inventario SET stock = stock - ? WHERE id_producto = ? AND stock >= ?',
              [p.cantidad, p.id_producto, p.cantidad],
              (error, results) => {
                if (error) {
                  console.error(
                    `Error al restar stock para el producto ID ${p.id_producto}:`,
                    error
                  );
                  reject(error);
                } else if (results.affectedRows === 0) {
                  reject(
                    `Stock insuficiente para el producto ID ${p.id_producto}`
                  );
                } else {
                  resolve();
                }
              }
            );
          });
        });

        // Ejecuta todas las actualizaciones de stock
        Promise.all(restarStockPromises)
          .then(() => {
            res.status(201).json({ mensaje: 'Venta registrada con éxito' });
          })
          .catch((error) => {
            console.error('Error al actualizar el stock:', error);
            res.status(500).json({
              mensaje: 'Error al actualizar el stock de los productos',
              error,
            });
          });
      });
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

module.exports = router;
