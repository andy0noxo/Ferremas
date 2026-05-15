# 🔧 Configuración de Desarrollo - Ferremas Backend

## 📋 Configuración del IDE (VS Code)

### Extensiones Recomendadas
```json
{
  "recommendations": [
    "ms-vscode.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-typescript-next",
    "alexcvzz.vscode-sqlite",
    "ms-vscode.vscode-node-debug2"
  ]
}
```

### Configuración de Workspace (.vscode/settings.json)
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.workingDirectories": ["Backend_Ferremas"],
  "files.associations": {
    "*.env": "dotenv"
  },
  "javascript.preferences.includePackageJsonAutoImports": "auto",
  "typescript.preferences.includePackageJsonAutoImports": "auto"
}
```

## 🚀 Scripts de Desarrollo

### Inicialización del Proyecto
```bash
# Instalación completa
npm install

# Configurar base de datos
npm run db:create
npm run db:migrate
npm run db:seed

# Validar configuración
npm run validate-env

# Setup completo
npm run setup
```

### Desarrollo Diario
```bash
# Iniciar servidor en modo desarrollo
npm run dev

# Ejecutar linting
npm run lint
npm run lint:fix

# Pruebas BDD
npm run features
./run-tests.ps1
```

### Base de Datos
```bash
# Migrar base de datos
npm run db:migrate

# Revertir migraciones
npm run db:migrate:undo

# Sembrar datos iniciales
npm run db:seed

# Reset completo de BD
npm run db:reset
```

## 🧪 Configuración de Testing

### Variables de Entorno para Testing
```bash
# .env.test
NODE_ENV=test
DB_NAME=ferremas_test
LOG_LEVEL=warn
MOCK_PAYMENT=true
```

### Ejecutar Pruebas
```bash
# Todas las pruebas
npm run features

# Prueba específica
npm run features:single -- features/01_RegistrarUsuario.feature

# Con reportes
npm run features:excel
```

## 🐳 Configuración Docker

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY src/ ./src/
COPY features/ ./features/
COPY scripts/ ./scripts/
COPY database/ ./database/

EXPOSE 3000

CMD ["npm", "start"]
```

### docker-compose.yml
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DB_HOST=mysql
    depends_on:
      - mysql
  
  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

## 📊 Monitoring y Logging

### Configuración de Winston
```javascript
// src/config/logger.config.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

### Health Checks
```javascript
// Endpoint de salud
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: process.env.npm_package_version
  });
});
```

## 🔒 Configuración de Seguridad

### Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por ventana
  message: 'Demasiadas peticiones desde esta IP'
});

app.use('/api/', limiter);
```

### Helmet para Headers de Seguridad
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"]
    }
  }
}));
```

## 📈 Performance

### Compresión
```javascript
const compression = require('compression');
app.use(compression());
```

### Cache Headers
```javascript
app.use('/api/', (req, res, next) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});
```

## 🔧 Herramientas de Desarrollo

### Nodemon Configuración
```json
// nodemon.json
{
  "watch": ["src", "features"],
  "ext": "js,json",
  "ignore": ["node_modules", "_informes", "_evidencias"],
  "exec": "node src/server.js",
  "env": {
    "NODE_ENV": "development"
  }
}
```

### ESLint Configuración
```json
// .eslintrc.js
module.exports = {
  env: {
    node: true,
    es2021: true
  },
  extends: [
    'eslint:recommended',
    'airbnb-base'
  ],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn',
    'no-unused-vars': 'error'
  }
};
```

## 🚀 Despliegue

### Variables de Entorno Producción
```bash
NODE_ENV=production
DB_HOST=production-host
DB_PASSWORD=secure-password
JWT_SECRET=super-secure-jwt-secret
LOG_LEVEL=error
MOCK_PAYMENT=false
```

### PM2 Configuration
```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'ferremas-backend',
    script: 'src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log'
  }]
};
```

## 🧪 Pruebas de Carga y Estrés con JMeter

### Instalación

#### Local (Linux/Mac)
```bash
# Primera vez
npm run jmeter:install

# Luego, recargar el shell
source ~/.bash_profile  # o ~/.bashrc o ~/.zshrc según tu shell
```

#### Windows
1. Descargar JMeter desde https://jmeter.apache.org/download_jmeter.cgi
2. Extraer a una ubicación conocida
3. Agregar `{ruta-jmeter}/bin` al PATH
4. Verificar: `jmeter -v`

### Configuración de Datos de Prueba

Antes de ejecutar tests, generar datos limpios:
```bash
npm run jmeter:setup-data
```

Esto:
- Limpia tablas de BD (usuarios, productos)
- Crea usuarios y productos de prueba reproducibles
- Exporta datos a CSVs en `jmeter/data/`

### Ejecutar Tests Localmente

**Smoke Test (validación rápida):**
```bash
npm run jmeter:local:smoke
```
- 10 usuarios, 1 minuto
- Ideal para CI/CD

**Load Test (carga normal):**
```bash
npm run jmeter:local:carga
```
- 100 usuarios, 5 minutos
- Mide performance en pico normal

**Stress Test (carga máxima):**
```bash
npm run jmeter:local:estres
```
- 500 usuarios, 6 minutos totales
- Identifica puntos de quiebre

**Resistance Test (resistencia):**
```bash
npm run jmeter:local:resistencia
```
- 50 usuarios durante 30 minutos
- Detecta memory leaks

### Ejecutar Tests en Docker

Docker proporciona aislamiento y reproducibilidad:

```bash
# Smoke test en Docker
npm run jmeter:docker:smoke

# Load test en Docker
npm run jmeter:docker:carga

# Stress test en Docker
npm run jmeter:docker:estres
```

### Interpretar Resultados

Los reports se generan en `jmeter/reports/html-report-{timestamp}/`:

**Abrir report:**
```bash
# Linux/Mac
open jmeter/reports/html-report-*/index.html

# Windows
start jmeter\reports\html-report-*\index.html
```

**Métricas importantes:**

| Métrica | Objetivo | Acción si falla |
|---------|----------|-----------------|
| Throughput > 100 req/s | Mínimo aceptable | Verificar BD, aumentar recursos |
| p95 latency < 1000ms | Aceptable | Revisar queries lentas |
| p99 latency < 2000ms | Aceptable | Revisar queries lentas |
| Error % < 1% | Mínimo | Revisar logs del backend |
| CPU < 80% | Normal | Aceptable durante test |
| Memory < 85% | Normal | Revisar memory leaks |

### Archivos de Configuración

**Ubicación:** `jmeter/`

- `testplans/` - Planes de prueba (.jmx)
  - `scenario_smoke.jmx` - Validación rápida
  - `scenario_carga.jmx` - Carga sostenida (100 users)
  - `scenario_estres.jmx` - Stress máximo (500 users)
  - `scenario_resistencia.jmx` - Resistencia 30 min (50 users)

- `data/` - Datos de prueba
  - `usuarios.csv` - Credenciales de prueba
  - `productos.csv` - Productos de prueba

- `config/environment.properties` - Configuración global
  - HOST, PORT, timeouts
  - Parámetros por escenario

- `reports/` - Resultados
  - HTML reports auto-generados
  - .jtl result files

### Limpieza

Mantener reports bajo control:
```bash
npm run jmeter:cleanup
```

Esto elimina reports antiguos (mantiene últimos 5).

### Documentación Detallada

Para guía completa: `jmeter/README_JMETER.md`

Para técnicas avanzadas: `jmeter/JMETER_GUIDE.md`

---

**Esta configuración asegura un entorno de desarrollo robusto y productivo** ⚡