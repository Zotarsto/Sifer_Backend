const express = require('express');
const router = express.Router();
const conexion = require('../database');

// Endpoint para agregar un producto y su stock
router.post('/productos', (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;

  if (!nombre || !precio || stock == null) {
    return res.status(400).json({ mensaje: 'Nombre, precio y stock son obligatorios' });
  }

  conexion.query(
    'INSERT INTO productos (nombre, descripcion, precio) VALUES (?, ?, ?)',
    [nombre, descripcion, precio],
    (error, results) => {
      if (error) {
        console.error('Error al insertar el producto:', error);
        return res.status(500).json({ mensaje: 'Error en el servidor al agregar el producto' });
      }

      const productoId = results.insertId;

      conexion.query(
        'INSERT INTO inventario (id_producto, stock) VALUES (?, ?)',
        [productoId, stock],
        (error) => {
          if (error) {
            console.error('Error al insertar el stock:', error);
            return res.status(500).json({ mensaje: 'Error en el servidor al agregar el stock' });
          }

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

// Endpoint para actualizar un producto y su stock
router.put('/productos/:id', (req, res) => {
  const productoId = req.params.id;
  const { nombre, descripcion, precio, stock } = req.body;

  if (!nombre || !precio || stock == null) {
    return res.status(400).json({ mensaje: 'Nombre, precio y stock son obligatorios' });
  }

  conexion.query(
    'UPDATE productos SET nombre = ?, descripcion = ?, precio = ? WHERE id = ?',
    [nombre, descripcion, precio, productoId],
    (error) => {
      if (error) {
        console.error('Error al actualizar el producto:', error);
        return res.status(500).json({ mensaje: 'Error en el servidor al actualizar el producto' });
      }

      conexion.query(
        'UPDATE inventario SET stock = ? WHERE id_producto = ?',
        [stock, productoId],
        (error) => {
          if (error) {
            console.error('Error al actualizar el stock:', error);
            return res.status(500).json({ mensaje: 'Error en el servidor al actualizar el stock' });
          }

          res.status(200).json({ mensaje: 'Producto y stock actualizados con éxito' });
        }
      );
    }
  );
});

// Endpoint para eliminar un producto y su stock asociado
router.delete('/productos/:id', (req, res) => {
  const productoId = req.params.id;

  conexion.query(
    'DELETE FROM inventario WHERE id_producto = ?',
    [productoId],
    (error) => {
      if (error) {
        console.error('Error al eliminar el stock:', error);
        return res.status(500).json({ mensaje: 'Error en el servidor al eliminar el stock' });
      }

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