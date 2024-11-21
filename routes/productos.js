const express = require('express');
const router = express.Router();
const conexion = require('../database');

// Endpoint para agregar un producto y su stock
router.post('/productos', (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;

  if (!nombre || !precio || stock == null) {
    return res.status(400).json({ mensaje: 'Nombre, precio y stock son obligatorios' });
  }

  // Paso 1: Insertar producto en la tabla `productos`
  conexion.query(
    'INSERT INTO productos (nombre, descripcion, precio) VALUES (?, ?, ?)',
    [nombre, descripcion, precio],
    (error, results) => {
      if (error) {
        console.error('Error al insertar el producto:', error);
        return res.status(500).json({ mensaje: 'Error en el servidor al agregar el producto' });
      }

      const productoId = results.insertId; // Recuperar el ID del producto recién insertado

      // Paso 2: Insertar stock en la tabla `inventario`
      conexion.query(
        'INSERT INTO inventario (id_producto, stock) VALUES (?, ?)',
        [productoId, stock],
        (error) => {
          if (error) {
            console.error('Error al insertar el stock:', error);
            return res.status(500).json({ mensaje: 'Error en el servidor al agregar el stock' });
          }

          // Éxito
          res.status(201).json({ mensaje: 'Producto y stock agregados con éxito' });
        }
      );
    }
  );
});

// Endpoint para obtener todos los productos junto con el stock
router.get('/productos', (req, res) => {
  const query = `
    SELECT 
      p.id,
      p.nombre,
      p.descripcion,
      p.precio,
      i.stock
    FROM 
      productos p
    LEFT JOIN 
      inventario i
    ON 
      p.id = i.id_producto
  `;

  conexion.query(query, (error, results) => {
    if (error) {
      console.error('Error al obtener productos:', error);
      return res.status(500).json({ mensaje: 'Error en el servidor al obtener los productos' });
    }

    res.status(200).json(results);
  });
});

// Endpoint para eliminar un producto y su stock asociado
router.delete('/productos/:id', (req, res) => {
  const productoId = req.params.id;

  // Paso 1: Eliminar el stock asociado al producto
  conexion.query(
    'DELETE FROM inventario WHERE id_producto = ?',
    [productoId],
    (error) => {
      if (error) {
        console.error('Error al eliminar el stock:', error);
        return res.status(500).json({ mensaje: 'Error en el servidor al eliminar el stock' });
      }

      // Paso 2: Eliminar el producto de la tabla `productos`
      conexion.query(
        'DELETE FROM productos WHERE id = ?',
        [productoId],
        (error) => {
          if (error) {
            console.error('Error al eliminar el producto:', error);
            return res.status(500).json({ mensaje: 'Error en el servidor al eliminar el producto' });
          }

          res.status(200).json({ mensaje: 'Producto y su stock eliminados con éxito' });
        }
      );
    }
  );
});
module.exports = router;