const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// Importar rutas
const cajerosRoutes = require('./routes/cajeros');
const ventasRoutes = require('./routes/ventas');
const authAdminRoutes = require('./routes/authAdmin');
const authCajeroRoutes = require('./routes/authCajero');
const productosRoutes = require('./routes/productos');

const app = express();

// Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(express.json()); 

// Middleware para registrar todas las solicitudes
app.use((req, res, next) => {
    console.log(`Solicitud recibida: ${req.method} ${req.url}`);
    next();
  });
  

// Rutas principales
app.use('/api/cajeros', cajerosRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/admin', authAdminRoutes);
app.use('/api/cajero', authCajeroRoutes);
app.use('/api', productosRoutes);


// Configuración del servidor
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
