# 🏗️ Arquitectura del Backend - Ferremas

## 📁 Estructura de Carpetas

```
Backend_Ferremas/
├── 📄 .env                     # Variables de entorno (no versionar)
├── 📄 .env.example            # Ejemplo de configuración
├── 📄 .sequelizerc            # Configuración de Sequelize CLI
├── 📄 package.json            # Dependencias y scripts NPM
├── 📄 README.md               # Documentación principal
├── 📄 ENV_README.md           # Documentación de variables de entorno
├── 📄 PRUEBAS_README.md       # Documentación de pruebas
├── 📄 INFORMES_README.md      # Documentación de reportes
│
├── 🗄️ database/               # Estructura de base de datos
│   ├── migrations/            # Migraciones de Sequelize
│   │   ├── 001-create-roles.js
│   │   ├── 002-create-sucursales.js
│   │   └── 003-create-usuarios.js
│   └── seeders/               # Datos iniciales
│       ├── 001-roles-iniciales.js
│       ├── 002-sucursales-iniciales.js
│       └── 003-usuario-admin.js
│
├── 🧪 features/               # Pruebas BDD con Cucumber
│   ├── *.feature             # Archivos de características (13 archivos)
│   ├── step_definitions/     # Definiciones de pasos
│   ├── support/              # Configuración y hooks
│   ├── _debug/               # Screenshots finales
│   └── _evidencias/          # Evidencias detalladas por paso
│
├── 📜 scripts/                # Scripts de automatización
│   ├── ejecutar-feature.js   # Ejecutor de features individuales
│   ├── generar-informe.js    # Generador de reportes
│   ├── validate-env.js       # Validador de configuración
│   └── ...
│
├── 💻 src/                    # Código fuente principal
│   ├── 🚀 server.js          # Punto de entrada de la aplicación
│   │
│   ├── ⚙️ config/            # Configuraciones
│   │   ├── api.config.js     # Configuración de API
│   │   ├── auth.config.js    # Configuración de autenticación
│   │   ├── db.config.js      # Configuración de base de datos
│   │   ├── database.json     # Configuración para Sequelize CLI
│   │   ├── roles.config.js   # Definición de roles
│   │   └── server.config.js  # Configuración del servidor
│   │
│   ├── 📊 constants/         # Constantes de la aplicación
│   │   ├── index.js          # Exportador principal
│   │   ├── httpStatus.js     # Códigos de estado HTTP
│   │   ├── messages.js       # Mensajes estándar
│   │   └── business.js       # Constantes de negocio
│   │
│   ├── 🎮 controllers/       # Controladores de rutas
│   │   ├── auth.controller.js
│   │   ├── producto.controller.js
│   │   ├── usuario.controller.js
│   │   └── ...              # (11 controladores)
│   │
│   ├── 🛡️ middlewares/       # Middlewares personalizados
│   │   ├── auth.jwt.js       # Verificación de JWT
│   │   ├── errorHandler.js   # Manejo centralizado de errores
│   │   ├── logger.js         # Logging personalizado
│   │   ├── ownership.js      # Control de propiedad de recursos
│   │   └── validators.js     # Validaciones comunes
│   │
│   ├── 🗃️ models/            # Modelos de Sequelize
│   │   ├── index.js          # Configuración de modelos y asociaciones
│   │   ├── usuario.model.js
│   │   ├── producto.model.js
│   │   └── ...              # (11 modelos)
│   │
│   ├── 🛣️ routes/            # Definición de rutas
│   │   ├── auth.routes.js
│   │   ├── producto.routes.js
│   │   ├── usuario.routes.js
│   │   └── ...              # (12 archivos de rutas)
│   │
│   ├── 📋 schemas/           # Schemas de validación
│   │   ├── index.js          # Exportador principal
│   │   ├── auth.schema.js    # Validaciones de autenticación
│   │   ├── product.schema.js # Validaciones de productos
│   │   └── user.schema.js    # Validaciones de usuarios
│   │
│   ├── 🔧 services/          # Servicios de negocio
│   │   ├── cart.service.js   # Servicio de carrito
│   │   ├── email.service.js  # Servicio de emails
│   │   ├── transbank.service.js # Integración con Transbank
│   │   └── ...              # (5 servicios)
│   │
│   └── 🛠️ utils/             # Utilidades reutilizables
│       ├── index.js          # Exportador principal
│       ├── validators.js     # Funciones de validación
│       ├── responses.js      # Respuestas HTTP estandarizadas
│       └── dateHelpers.js    # Utilidades de fechas
│
├── 📧 templates/             # Plantillas de email
│   └── email/
│
├── 📊 _informes/             # Reportes generados
│   ├── .gitkeep
│   └── *.xlsx               # Informes Excel generados
│
└── 🔧 Archivos de configuración
    ├── run-tests.ps1         # Script PowerShell principal
    ├── run-tests.bat         # Script Batch alternativo
    └── kill-processes.bat    # Script para limpiar procesos
```

## 🎯 Principios de Arquitectura Aplicados

### 1. 🧩 **Separación de Responsabilidades (SoC)**
- **Controladores**: Solo manejan HTTP requests/responses
- **Servicios**: Contienen la lógica de negocio
- **Modelos**: Representan y validan datos
- **Middlewares**: Funcionalidades transversales
- **Utils**: Funciones reutilizables sin estado

### 2. 📦 **Organización Modular**
- Cada módulo tiene una responsabilidad específica
- Exportaciones claras desde archivos index.js
- Imports organizados y consistentes
- Dependencias bien definidas

### 3. 🔒 **Principio de Responsabilidad Única (SRP)**
- Cada archivo/clase tiene una sola razón para cambiar
- Funciones pequeñas y enfocadas
- Configuraciones separadas por contexto
- Validaciones centralizadas por dominio

### 4. 🔄 **Inversión de Dependencias (DIP)**
- Controladores dependen de servicios abstractos
- Servicios no dependen de implementaciones específicas
- Configuraciones inyectadas desde el exterior
- Fácil testing y mocking

## 🚀 Flujo de Datos

```
Request → Middleware → Routes → Controller → Service → Model → Database
                ↓
Response ← Utils ← Controller ← Service ← Model ← Database
```

### 📝 **Descripción del Flujo:**

1. **Request** llega al servidor Express
2. **Middlewares** procesan la request (auth, validation, logging)
3. **Routes** dirigen a el controlador apropiado
4. **Controller** orquesta la operación y valida entrada
5. **Service** ejecuta lógica de negocio
6. **Model** interactúa con la base de datos
7. **Utils** proporcionan funciones auxiliares
8. **Response** se formatea y envía al cliente

## 🧪 Estrategia de Testing

### **BDD (Behavior Driven Development)**
- **Features**: Definición de comportamientos en Gherkin
- **Step Definitions**: Implementación de pasos de prueba
- **Hooks**: Configuración y limpieza de pruebas
- **Evidencias**: Captura automática de screenshots y HTML

### **Cobertura de Pruebas**
- ✅ 41 casos de prueba automatizados
- ✅ 13 features de funcionalidad completa
- ✅ Integración con Selenium WebDriver
- ✅ Reportes automáticos en múltiples formatos

## 📊 Patrones de Diseño Implementados

### 1. 🏭 **Factory Pattern**
- Creación de respuestas HTTP estandarizadas
- Instanciación de servicios con configuración

### 2. 🔧 **Strategy Pattern**
- Diferentes estrategias de autenticación
- Múltiples formatos de reporte

### 3. 🎭 **Facade Pattern**
- Interfaces simplificadas para servicios complejos
- Abstracción de integraciones externas

### 4. 🏗️ **Builder Pattern**
- Construcción de queries complejas
- Configuración de middlewares

## 🔍 Mejores Prácticas Implementadas

### **Seguridad**
- ✅ Validación de entrada en múltiples capas
- ✅ Sanitización de datos
- ✅ Rate limiting configurado
- ✅ JWT con expiración
- ✅ Bcrypt para hashing de contraseñas

### **Performance**
- ✅ Índices de base de datos optimizados
- ✅ Pooling de conexiones
- ✅ Paginación en listados
- ✅ Compresión de respuestas

### **Mantenibilidad**
- ✅ Código autodocumentado
- ✅ Logging estructurado
- ✅ Manejo centralizado de errores
- ✅ Configuración por entornos

### **Escalabilidad**
- ✅ Arquitectura modular
- ✅ Servicios desacoplados
- ✅ Middleware reutilizable
- ✅ Base de datos normalizada

## 📈 Métricas de Calidad

| Aspecto | Estado | Cobertura |
|---------|--------|-----------|
| 🏗️ Arquitectura | ✅ Excelente | MVC + Services |
| 🧪 Testing | ✅ Completo | 41 casos BDD |
| 📚 Documentación | ✅ Completa | 100% |
| 🔒 Seguridad | ✅ Implementada | JWT + Validación |
| 📊 Logging | ✅ Estructurado | Winston + Morgan |
| 🚀 Performance | ✅ Optimizada | Índices + Pool |

## 🎯 Próximos Pasos Recomendados

1. **🔧 Implementar Cache**: Redis para sesiones y datos frecuentes
2. **📊 Monitoring**: Métricas de performance y health checks  
3. **🐳 Containerización**: Docker para despliegue consistente
4. **🔄 CI/CD**: Pipeline automático de testing y despliegue
5. **📈 Analytics**: Tracking de uso y performance
6. **🔐 Audit Trail**: Logging de cambios críticos

---

**Esta arquitectura sigue las mejores prácticas de desarrollo y está optimizada para mantenibilidad, escalabilidad y testing automatizado.** ✨