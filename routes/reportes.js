const express = require('express');
const router = express.Router();
const conexion = require('../database');

// Ruta para obtener el reporte mensual de ventas
router.get('/', (req, res) => {
  const mes = parseInt(req.query.mes); // Obtiene el mes desde los parámetros de la URL

  if (!mes || mes < 1 || mes > 12) {
    return res.status(400).json({ mensaje: 'El mes es obligatorio y debe estar entre 1 y 12' });
  }

  // Consulta para calcular las estadísticas del mes
  const queryVentasTotales = `
    SELECT 
        SUM(dv.subtotal) AS ventasTotales,
        MONTH(v.fecha_venta) AS mes,
        YEAR(v.fecha_venta) AS anio
    FROM 
        detalle_venta dv
    JOIN 
        ventas v ON dv.id_venta = v.id
    WHERE 
        MONTH(v.fecha_venta) = ? AND YEAR(v.fecha_venta) = YEAR(CURDATE())
    GROUP BY 
        MONTH(v.fecha_venta), YEAR(v.fecha_venta);
  `;

  const queryArticulosMasVendidos = `
    SELECT 
        p.nombre AS producto,
        SUM(dv.cantidad) AS cantidadVendida,
        SUM(dv.subtotal) AS totalVentas
    FROM 
        detalle_venta dv
    JOIN 
        productos p ON dv.id_producto = p.id
    JOIN 
        ventas v ON dv.id_venta = v.id
    WHERE 
        MONTH(v.fecha_venta) = ? AND YEAR(v.fecha_venta) = YEAR(CURDATE())
    GROUP BY 
        p.id
    ORDER BY 
        cantidadVendida DESC
    LIMIT 5; -- Los 5 artículos más vendidos
  `;

  const queryCantidadProductos = `
    SELECT 
        SUM(dv.cantidad) AS totalProductosVendidos
    FROM 
        detalle_venta dv
    JOIN 
        ventas v ON dv.id_venta = v.id
    WHERE 
        MONTH(v.fecha_venta) = ? AND YEAR(v.fecha_venta) = YEAR(CURDATE());
  `;

  // Ejecutar todas las consultas en paralelo
  Promise.all([
    new Promise((resolve, reject) => conexion.query(queryVentasTotales, [mes], (error, results) => error ? reject(error) : resolve(results[0]))),
    new Promise((resolve, reject) => conexion.query(queryArticulosMasVendidos, [mes], (error, results) => error ? reject(error) : resolve(results))),
    new Promise((resolve, reject) => conexion.query(queryCantidadProductos, [mes], (error, results) => error ? reject(error) : resolve(results[0]))),
  ])
    .then(([ventasTotales, articulosMasVendidos, cantidadProductos]) => {
      if (!ventasTotales) {
        return res.status(404).json({ mensaje: 'No hay datos para el mes seleccionado' });
      }

      res.status(200).json({
        ventasTotales: ventasTotales.ventasTotales,
        mes: ventasTotales.mes,
        anio: ventasTotales.anio,
        articulosMasVendidos,
        totalProductosVendidos: cantidadProductos.totalProductosVendidos,
      });
    })
    .catch((error) => {
      console.error('Error al obtener el reporte mensual:', error);
      res.status(500).json({ mensaje: 'Error al obtener el reporte mensual' });
    });
});

module.exports = router;