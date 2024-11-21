const conexion = require('../database');

// Agregar un producto
const agregarProducto = (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;

  if (!nombre || !precio || stock === undefined) {
    return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
  }

  // Insertar en la tabla productos
  conexion.query(
    'INSERT INTO productos (nombre, descripcion, precio) VALUES (?, ?, ?)',
    [nombre, descripcion, precio],
    (error, results) => {
      if (error) {
        console.error('Error al agregar producto:', error);
        return res.status(500).json({ mensaje: 'Error al agregar el producto' });
      }

      const productoId = results.insertId;

      // Insertar en la tabla inventario
      conexion.query(
        'INSERT INTO inventario (id_producto, stock) VALUES (?, ?)',
        [productoId, stock],
        (error) => {
          if (error) {
            console.error('Error al agregar al inventario:', error);
            return res.status(500).json({ mensaje: 'Error al agregar al inventario' });
          }

          res.status(201).json({ mensaje: 'Producto agregado con éxito' });
        }
      );
    }
  );
};

// Eliminar un producto
const eliminarProducto = (req, res) => {
  const { id } = req.params;

  if (!id) {
    return res.status(400).json({ mensaje: 'El ID del producto es obligatorio' });
  }

  // Eliminar de la tabla inventario primero debido a la clave foránea
  conexion.query(
    'DELETE FROM inventario WHERE id_producto = ?',
    [id],
    (error) => {
      if (error) {
        console.error('Error al eliminar del inventario:', error);
        return res.status(500).json({ mensaje: 'Error al eliminar del inventario' });
      }

      // Eliminar de la tabla productos
      conexion.query(
        'DELETE FROM productos WHERE id = ?',
        [id],
        (error) => {
          if (error) {
            console.error('Error al eliminar producto:', error);
            return res.status(500).json({ mensaje: 'Error al eliminar el producto' });
          }

          res.status(200).json({ mensaje: 'Producto eliminado con éxito' });
        }
      );
    }
  );
};

module.exports = { agregarProducto, eliminarProducto };
