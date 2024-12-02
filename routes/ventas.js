const express = require('express');
const router = express.Router();
const conexion = require('../database');

// Ruta para registrar una venta
router.post('/ventas', async (req, res) => {
  const { id_cajero, total, productos } = req.body;

  if (!id_cajero || !total || !productos || productos.length === 0) {
    return res.status(400).json({ mensaje: 'Datos incompletos' });
  }

  try {
    const queryVenta = 'INSERT INTO ventas (id_cajero, total) VALUES (?, ?)';
    conexion.query(queryVenta, [id_cajero, total], (error, results) => {
      if (error) {
        console.error('Error al registrar la venta:', error);
        return res.status(500).json({ mensaje: 'Error al registrar la venta' });
      }

      const id_venta = results.insertId;

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
          return res.status(500).json({ mensaje: 'Error al registrar el detalle de venta' });
        }

        const restarStockPromises = productos.map((p) => {
          return new Promise((resolve, reject) => {
            conexion.query(
              'UPDATE inventario SET stock = stock - ? WHERE id_producto = ? AND stock >= ?',
              [p.cantidad, p.id_producto, p.cantidad],
              (error, results) => {
                if (error) {
                  console.error(`Error al restar stock para el producto ID ${p.id_producto}:`, error);
                  reject(error);
                } else if (results.affectedRows === 0) {
                  reject(`Stock insuficiente para el producto ID ${p.id_producto}`);
                } else {
                  resolve();
                }
              }
            );
          });
        });

        Promise.all(restarStockPromises)
          .then(() => res.status(201).json({ mensaje: 'Venta registrada con éxito' }))
          .catch((error) => {
            console.error('Error al actualizar el stock:', error);
            res.status(500).json({ mensaje: 'Error al actualizar el stock de los productos', error });
          });
      });
    });
  } catch (error) {
    console.error('Error en el servidor:', error);
    res.status(500).json({ mensaje: 'Error en el servidor' });
  }
});

// Ruta para consultar ventas
router.get('/ventas', (req, res) => {
  const intervalo = req.query.intervalo || 'todas'; // Valor por defecto
  let query = `
    SELECT v.id AS id_venta, v.fecha_venta, v.total, c.nombre AS cajero
    FROM ventas v
    JOIN cajeros c ON v.id_cajero = c.id
  `;

  // Filtros según el intervalo
  if (intervalo === 'diario') {
    query += `WHERE DATE(v.fecha_venta) = CURDATE() `;
  } else if (intervalo === 'mensual') {
    query += `WHERE MONTH(v.fecha_venta) = MONTH(CURDATE()) AND YEAR(v.fecha_venta) = YEAR(CURDATE()) `;
  } else if (intervalo === 'anual') {
    query += `WHERE YEAR(v.fecha_venta) = YEAR(CURDATE()) `;
  }

  query += `ORDER BY v.fecha_venta DESC`;

  conexion.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener ventas:', error);
      return res.status(500).json({ mensaje: 'Error al obtener ventas' });
    }

    const ventasFiltradas = results.map((venta) => ({
      id_venta: venta.id_venta || 'ID no disponible',
      fecha_venta: venta.fecha_venta || 'Fecha no disponible',
      total: venta.total || 0,
      cajero: venta.cajero || 'Cajero no identificado',
    }));

    res.status(200).json(ventasFiltradas);
  });
});

// Ruta para obtener detalles de una venta
router.get('/ventas/:id', (req, res) => {
  const ventaId = req.params.id;

  const query = `
    SELECT dv.id_producto, p.nombre, dv.cantidad, dv.precio, dv.subtotal
    FROM detalle_venta dv
    JOIN productos p ON dv.id_producto = p.id
    WHERE dv.id_venta = ?
  `;

  conexion.query(query, [ventaId], (error, results) => {
    if (error) {
      console.error('Error al obtener detalles de la venta:', error);
      return res.status(500).json({ mensaje: 'Error al obtener detalles de la venta' });
    }

    if (results.length === 0) {
      return res.status(404).json({ mensaje: 'No se encontraron detalles para esta venta' });
    }

    res.status(200).json(results);
  });
});

module.exports = router;