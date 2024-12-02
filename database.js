var mysql = require('mysql');

const conexion = mysql.createConnection({
    host: 'databaseingsoft.crygkgmoihut.us-east-2.rds.amazonaws.com',
    database: 'DBSIFER',
    user: 'admin',
    password: 'rootFCCingsoft',
    timezone: 'America/Mexico_City' // Configura tu zona horaria local

});

conexion.connect((error) => {
    if (error) {
        console.error('Error de conexión: ' + error.stack);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');
});

module.exports = conexion;
