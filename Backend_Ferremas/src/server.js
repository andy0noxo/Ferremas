require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./models');
const serverConfig = require('./config/server.config');
const errorHandler = require('./middlewares/errorHandler');
const logger = require('./middlewares/logger');
const bodyParser = require('body-parser');

// Inicializar aplicación Express
const app = express();

// ======================
// Configuración Middlewares
// ======================

// Logging de solicitudes HTTP
app.use(morgan(serverConfig.morganFormat, { 
  stream: { write: message => logger.http(message.trim()) },
  skip: () => process.env.NODE_ENV === 'test'
}));

// Configuración CORS
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc)
    if(!origin) return callback(null, true);
    
    // Allow all localhost origins
    if(origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  methods: serverConfig.cors.methods,
  allowedHeaders: serverConfig.cors.allowedHeaders,
  credentials: serverConfig.cors.credentials
}));

// Parseo de cuerpos HTTP
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middlewares generales
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ======================
// Configuración de Rutas
// ======================

// Importar rutas
const authRoutes = require('./routes/auth.routes');
const productoRoutes = require('./routes/producto.routes');
const stockRoutes = require('./routes/stock.routes');
const pedidoRoutes = require('./routes/pedido.routes');
const pagoRoutes = require('./routes/pago.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const sucursalRoutes = require('./routes/sucursal.routes');
const categoriaRoutes = require('./routes/categoria.routes');
const marcaRoutes = require('./routes/marca.routes');
const rolRoutes = require('./routes/rol.routes');
const ventaRoutes = require('./routes/venta.routes');
const infoRoutes = require('./routes/info.routes');

// Registrar rutas
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/pagos', pagoRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/sucursales', sucursalRoutes);
app.use('/api/categorias', categoriaRoutes);
app.use('/api/marcas', marcaRoutes);
app.use('/api/roles', rolRoutes);
app.use('/api/ventas', ventaRoutes);
app.use('/api', infoRoutes);

// Ruta de estado del servidor
app.get('/api/status', (req, res) => {
  res.json({
    status: 'OK',
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    timestamp: new Date().toISOString()
  });
});

// Ruta para manejar solicitudes a /.well-known/appspecific/com.chrome.devtools.json
app.get('/.well-known/appspecific/com.chrome.devtools.json', (req, res) => {
    res.status(204).send(); // Respuesta sin contenido
});

// ======================
// Manejo de Errores
// ======================

// Ruta no encontrada (404)
app.use((req, res) => {
  res.status(404).json({ 
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl
  });
});

// Manejo centralizado de errores
app.use(errorHandler);

// ======================
// Inicialización Servidor
// ======================

const iniciarServidor = async () => {
  try {
    // Sincronizar modelos con la base de datos
    await db.sequelize.sync({
      force: process.env.DB_FORCE_SYNC === 'true', // ¡Peligroso en producción!
      alter: process.env.DB_ALTER_SYNC === 'true'
    });
    
    // Iniciar servidor HTTP
    app.listen(serverConfig.port, () => {
      logger.info(`
      ███████╗███████╗██████╗ ██████╗ ███████╗███╗   ███╗ █████╗ ███████╗
      ██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝████╗ ████║██╔══██╗██╔════╝
      █████╗  █████╗  ██████╔╝██████╔╝█████╗  ██╔████╔██║███████║███████╗
      ██╔══╝  ██╔══╝  ██╔══██╗██╔══██╗██╔══╝  ██║╚██╔╝██║██╔══██║╚════██║
      ██║     ███████╗██║  ██║██║  ██║███████╗██║ ╚═╝ ██║██║  ██║███████║
      ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚══════╝
      
      🚀 Servidor listo en puerto ${serverConfig.port}
      ⚙️  Entorno: ${serverConfig.environment}
      🗄️  Base de datos: ${db.sequelize.config.host}/${db.sequelize.config.database}
      `);
    });

  } catch (error) {
    logger.error('Error al iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar en modo producción/desarrollo
if (process.env.NODE_ENV !== 'test') {
  iniciarServidor();
}

module.exports = app; // Para testing