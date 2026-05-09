# 🔧 Ferremas Backend API

## 📋 Descripción

**API REST completa** para el sistema Ferremas, construida con Node.js, Express y Sequelize. Incluye **sistema de autenticación JWT**, **gestión de roles** y **arquitectura escalable** con middlewares de seguridad.

## 🏗️ Arquitectura y Tecnologías

### Stack Tecnológico
- **🟢 Node.js** - Runtime de JavaScript
- **⚡ Express** - Framework web minimalista
- **🗄️ Sequelize** - ORM para base de datos
- **🔐 JWT** - Autenticación y autorización
- **🛡️ bcrypt** - Encriptación de contraseñas
- **💳 Transbank** - Integración de pagos
- **💱 API Dólar** - Conversión de monedas

### Características Principales
- ✅ **Autenticación JWT** con refresh tokens
- ✅ **Sistema de roles** (Administrador, Bodeguero, Cliente)
- ✅ **ORM Sequelize** para gestión de base de datos
- ✅ **CRUD completo** para todas las entidades
- ✅ **Integración Transbank** para pagos
- ✅ **API de conversión** de monedas
- ✅ **Middleware de seguridad** y validación
- ✅ **Logging** detallado para debugging

## 📡 Endpoints de la API

### 🔐 Autenticación (`/api/auth/`)
```http
POST /api/auth/login          # Iniciar sesión
POST /api/auth/register       # Registrar nuevo usuario
GET  /api/auth/profile        # Obtener perfil del usuario actual
PUT  /api/auth/profile        # Actualizar perfil propio
POST /api/logout              # Cerrar sesión (dummy endpoint)
```

### 👥 Gestión de Usuarios (`/api/usuarios/`)
```http
GET    /api/usuarios          # Listar todos los usuarios (Admin)
POST   /api/usuarios          # Crear nuevo usuario (Admin)
GET    /api/usuarios/:id      # Obtener usuario específico
PUT    /api/usuarios/:id      # Actualizar usuario
DELETE /api/usuarios/:id      # Eliminar usuario (Admin)
```

### 📦 Gestión de Productos (`/api/productos/`)
```http
GET    /api/productos         # Listar productos (con filtros)
POST   /api/productos         # Crear nuevo producto (Bodeguero/Admin)
GET    /api/productos/:id     # Obtener producto específico
PUT    /api/productos/:id     # Actualizar producto (Bodeguero/Admin)
DELETE /api/productos/:id     # Eliminar producto (Admin)
```

### 📊 Gestión de Stock (`/api/stock/`)
```http
GET    /api/stock             # Consultar stock general
GET    /api/stock/:id         # Consultar stock de producto específico
PUT    /api/stock/:id         # Actualizar stock de producto (Bodeguero/Admin)
POST   /api/stock/movement    # Registrar movimiento de stock
```

### 🏢 Sucursales (`/api/sucursales/`)
```http
GET    /api/sucursales        # Listar todas las sucursales
POST   /api/sucursales        # Crear nueva sucursal (Admin)
GET    /api/sucursales/:id    # Obtener sucursal específica
PUT    /api/sucursales/:id    # Actualizar sucursal (Admin)
DELETE /api/sucursales/:id    # Eliminar sucursal (Admin)
```

### 🏷️ Categorías (`/api/categorias/`)
```http
GET    /api/categorias        # Listar todas las categorías
POST   /api/categorias        # Crear nueva categoría (Admin)
GET    /api/categorias/:id    # Obtener categoría específica
PUT    /api/categorias/:id    # Actualizar categoría (Admin)
DELETE /api/categorias/:id    # Eliminar categoría (Admin)
```

### 🏭 Marcas (`/api/marcas/`)
```http
GET    /api/marcas           # Listar todas las marcas
POST   /api/marcas           # Crear nueva marca (Admin)
GET    /api/marcas/:id       # Obtener marca específica
PUT    /api/marcas/:id       # Actualizar marca (Admin)
DELETE /api/marcas/:id       # Eliminar marca (Admin)
```

### 👤 Roles (`/api/roles/`) - Solo Admin
```http
GET    /api/roles            # Listar todos los roles disponibles
POST   /api/roles            # Crear nuevo rol (Solo Admin)
GET    /api/roles/:id        # Obtener rol específico
PUT    /api/roles/:id        # Actualizar rol (Solo Admin)
DELETE /api/roles/:id        # Eliminar rol (Solo Admin)
```

### 💰 Ventas (`/api/ventas/`)
```http
GET    /api/ventas           # Consultar historial de ventas
POST   /api/ventas           # Registrar nueva venta
GET    /api/ventas/:id       # Obtener venta específica
GET    /api/ventas/report    # Generar reporte de ventas
```

### 📋 Pedidos (`/api/pedidos/`)
```http
GET    /api/pedidos          # Listar pedidos del usuario
POST   /api/pedidos          # Crear nuevo pedido
GET    /api/pedidos/:id      # Obtener pedido específico
PUT    /api/pedidos/:id      # Actualizar estado del pedido
DELETE /api/pedidos/:id      # Cancelar pedido
```

### 💳 Pagos (`/api/pagos/`)
```http
POST   /api/pagos/process    # Procesar pago con Transbank
POST   /api/pagos/confirm    # Confirmar transacción
GET    /api/pagos/:id        # Consultar estado de pago
POST   /api/pagos/refund     # Solicitar reembolso
```

### 🏠 Información General (`/api/inicio`)
```http
GET    /api/inicio           # Obtener información general del sistema
                             # Incluye estadísticas, productos destacados, etc.
```

## 🛡️ Sistema de Seguridad

### Roles y Permisos
```javascript
// Roles disponibles en el sistema
const ROLES = {
  ADMIN: 'administrador',      // Acceso completo al sistema
  BODEGUERO: 'bodeguero',      // Gestión de productos e inventario
  CLIENTE: 'cliente'           // Compras y perfil personal
};
```

### Middleware de Autenticación
- **JWT Token** requerido para endpoints protegidos
- **Verificación de roles** para operaciones administrativas
- **Validación de datos** en todos los requests
- **Rate limiting** para prevenir abuso
- **Logging de seguridad** para auditoría

## 🧪 Sistema de Pruebas Automatizadas

### Cucumber BDD + Selenium
Este backend incluye un **sistema completo de pruebas automatizadas**:

```bash
# Ejecutar todas las pruebas BDD
npm run features

# Ejecutar feature específica
npm run features:single -- features/01_RegistrarUsuario.feature

# Ejecutar con reportes automáticos (PowerShell)
./run-tests.ps1

# Generar solo reportes de última ejecución
npm run features:report
```

### 📊 Casos de Prueba Implementados
- ✅ **41 casos de prueba** automatizados (CP01a - CP41)
- ✅ **13 features** completas de funcionalidad
- ✅ **Evidencias automáticas** (screenshots + HTML)
- ✅ **Reportes en Excel, HTML y Markdown**
- ✅ **Captura de terminal** y logs detallados

### 🛡️ Análisis de vulnerabilidades OWASP ZAP
Este backend también incluye un flujo automatizado de análisis de seguridad con **OWASP ZAP** en Docker.

```bash
# Ejecutar el baseline scan de seguridad
npm run zap:scan
```

El escaneo levanta `db` y `backend` con Docker Compose, espera a que `/api/status` responda y luego ejecuta ZAP contra `http://backend:3000`.

Política usada para la entrega:
- `10037` se considera falla real porque expone el encabezado `X-Powered-By`.
- `10049` se ignora porque en este proyecto sale por rutas 404 no relevantes para la evaluación.

Los reportes se guardan en:
- `Backend_Ferremas/_informes/zap/zap-baseline-report.html`
- `Backend_Ferremas/_informes/zap/zap-baseline-report.json`
- `Backend_Ferremas/_informes/zap/zap-baseline-warnings.md`

**Funcionalidades cubiertas:**
- **CP01a-CP04** - Registro de usuarios
- **CP05a-CP07** - Autenticación y login
- **CP08a-CP10** - Gestión de productos
- **CP11a-CP14** - Modificación de productos
- **CP15a-CP18** - Modificación de usuarios
- **CP19a-CP22** - Eliminación de usuarios
- **CP23a-CP26** - Eliminación de productos
- **CP27a-CP30** - Listado de usuarios
- **CP31a-CP34** - Listado de productos
- **CP35a-CP37** - Búsqueda de productos
- **CP38a-CP39** - Carrito de compras
- **CP40** - Modificación de stock
- **CP41** - Generación de reportes

Para más detalles: **[📖 Ver PRUEBAS_README.md](PRUEBAS_README.md)**

## 🚀 Instalación y Configuración

### 1. Prerrequisitos
```bash
# Verificar versiones mínimas
node --version    # >= 16.0.0
npm --version     # >= 8.0.0
```

### 2. Instalación
```bash
# Navegar al directorio del backend
cd Backend_Ferremas

# Instalar dependencias
npm install

# Verificar instalación
npm list --depth=0
```

### 3. Variables de Entorno
Crear archivo `.env` con las siguientes configuraciones:

```bash
# Base de datos
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=ferremas_db
DB_PORT=3306

# JWT
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=1h

# Email (para notificaciones)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_app_password

# Transbank (para pagos)
TRANSBANK_ENVIRONMENT=integration  # o 'production'
TRANSBANK_API_KEY=tu_api_key

# API Dólar (conversión de monedas)
DOLLAR_API_URL=https://api.exchangerate-api.com/v4/latest/USD

# Logs
LOG_LEVEL=info  # debug, info, warn, error

# Puerto del servidor
PORT=3000
```

### 4. Configurar Base de Datos
```bash
# Importar estructura de base de datos
mysql -u root -p < ../FerremasDDBB.sql

# O crear manualmente y usar migraciones de Sequelize
npx sequelize-cli db:create
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### 5. Iniciar el Servidor
```bash
# Modo desarrollo (con reinicio automático)
npm run dev

# Modo producción
npm start

# El servidor estará disponible en: http://localhost:3000
```

## 📜 Scripts NPM Disponibles

```json
{
  "start": "node src/server.js",              // Servidor en producción
  "dev": "nodemon src/server.js",             // Desarrollo con recarga automática
  "test": "echo \"No tests specified\"",      // Reservado para tests unitarios
  "features": "cucumber-js",                  // Ejecutar todas las pruebas BDD
  "features:single": "cucumber-js",           // Ejecutar feature específica
  "features:report": "node scripts/generar-informe.js", // Generar reportes
  "lint": "eslint src/",                      // Verificar código
  "format": "prettier --write src/"          // Formatear código
}
```

## 🔗 Integración con Frontend

### CORS Configurado
El backend está configurado para trabajar con el frontend Django:

```javascript
// Permitir requests desde el frontend
app.use(cors({
  origin: ['http://localhost:8000', 'http://127.0.0.1:8000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
```

### Formato de Respuesta Estándar
```javascript
// Respuestas exitosas
{
  "success": true,
  "message": "Operación exitosa",
  "data": { /* datos */ },
  "timestamp": "2025-01-22T10:30:00Z"
}

// Respuestas de error
{
  "success": false,
  "message": "Descripción del error",
  "error": "Código de error",
  "timestamp": "2025-01-22T10:30:00Z"
}
```

## 💳 Integración de Pagos

### Transbank
```javascript
// Configuración para pagos con tarjetas
const transbank = require('transbank-sdk');

// Ambiente de integración (testing)
transbank.Configuration.for(transbank.IntegrationTypes.WEBPAY_PLUS)
  .setEnvironment(transbank.Environments.INTEGRATION);

// Procesamiento de pagos
app.post('/api/pagos/process', async (req, res) => {
  // Lógica de procesamiento con Transbank
});
```

### API de Conversión de Monedas
```javascript
// Obtener tipo de cambio actualizado
const getDollarRate = async () => {
  const response = await fetch(process.env.DOLLAR_API_URL);
  const data = await response.json();
  return data.rates.CLP; // Pesos chilenos por dólar
};
```

## 🛠️ Solución de Problemas Comunes

### Error de Conexión a Base de Datos
```bash
# Verificar que el servicio esté corriendo
systemctl status mysql    # Linux
net start mysql           # Windows

# Verificar credenciales en .env
# Recrear base de datos si es necesario
```

### Error "Puerto en uso"
```bash
# Encontrar proceso usando el puerto 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Cambiar puerto en .env si es necesario
PORT=3001
```

### Errores de Dependencias
```bash
# Limpiar caché y reinstalar
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## 📊 Monitoreo y Logs

### Logging Integrado
```javascript
// Diferentes niveles de log disponibles
console.log('🟢 INFO:', message);      // Información general
console.warn('🟡 WARN:', message);     // Advertencias
console.error('🔴 ERROR:', message);   // Errores críticos
console.debug('🔵 DEBUG:', message);   // Información de debugging
```

### Métricas del Sistema
- **Tiempo de respuesta** de endpoints
- **Número de requests** por minuto
- **Errores 4xx/5xx** categorizados
- **Uso de memoria** y CPU
- **Conexiones de base de datos** activas

## 📞 Soporte y Documentación

Para más información específica:
- **🧪 [Pruebas Automatizadas](PRUEBAS_README.md)** - Testing BDD completo con Cucumber
- **📖 [README Principal](../README.md)** - Visión general del proyecto completo

## 💡 Notas de Desarrollo

- **Backend completo** listo para consumir desde cualquier frontend
- **Arquitectura escalable** con patrones de diseño bien definidos
- **Integración real** con servicios de pago y APIs externas
- **Sistema de pruebas robusto** con 41 casos automatizados
- **Documentación completa** para facilitar el mantenimiento

---

## 🚀 ¡Empezar Desarrollo!

```bash
# Setup completo en 4 pasos
cd Backend_Ferremas
npm install

# Configurar variables de entorno
cp .env.example .env  # y editar con tus valores

# Configurar base de datos
mysql -u root -p < ../FerremasDDBB.sql

# Iniciar desarrollo
npm run dev

# ¡El servidor estará corriendo en http://localhost:3000! 🎉
```

**API REST completa lista para producción** ✨
