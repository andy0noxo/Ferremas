# 🔧 Configuración de Variables de Entorno (.env)

## 📋 Descripción

Este documento explica todas las variables de entorno necesarias para el correcto funcionamiento del backend de Ferremas.

## 🚀 Configuración Inicial

### 1. Crear archivo .env
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar con tus configuraciones
# Reemplazar todos los valores de placeholder
```

### 2. Validar configuración
```bash
# Validar que todas las variables estén correctas
npm run validate-env
```

## 📊 Variables de Entorno

### 🗄️ Base de Datos (REQUERIDAS)

| Variable | Descripción | Ejemplo | Notas |
|----------|-------------|---------|-------|
| `DB_HOST` | Host del servidor MySQL | `localhost` | Puede ser IP o dominio |
| `DB_PORT` | Puerto de MySQL | `3306` | Puerto estándar de MySQL |
| `DB_USER` | Usuario de base de datos | `root` | Usuario con permisos completos |
| `DB_PASSWORD` | Contraseña de MySQL | `tu_password` | ⚠️ **CAMBIAR VALOR POR DEFECTO** |
| `DB_NAME` | Nombre de la base de datos | `ferremas` | Debe existir en MySQL |
| `DB_DIALECT` | Dialecto de base de datos | `mysql` | Fijo para este proyecto |

#### Variables Adicionales de DB
| Variable | Descripción | Valor por defecto |
|----------|-------------|------------------|
| `DB_FORCE_SYNC` | Forzar recreación de tablas | `false` |
| `DB_ALTER_SYNC` | Permitir alteración de tablas | `false` |
| `DB_LOGGING` | Mostrar queries SQL en consola | `true` |

### 🔐 Autenticación JWT (REQUERIDAS)

| Variable | Descripción | Ejemplo | Notas |
|----------|-------------|---------|-------|
| `JWT_SECRET` | Clave secreta para JWT | `mi_clave_super_secreta_123!` | ⚠️ **Mínimo 32 caracteres** |
| `JWT_EXPIRATION` | Tiempo de expiración | `8h` | Formato: `1h`, `30m`, `7d` |

### 🌐 Configuración del Servidor (REQUERIDAS)

| Variable | Descripción | Ejemplo | Notas |
|----------|-------------|---------|-------|
| `PORT` | Puerto del servidor | `3000` | Puerto libre en tu sistema |
| `NODE_ENV` | Entorno de ejecución | `development` | `development`, `production`, `test` |
| `CORS_ORIGIN` | Dominios permitidos | `http://localhost:8000,http://127.0.0.1:8000` | Separar con comas |
| `MORGAN_FORMAT` | Formato de logs HTTP | `combined` | `combined`, `common`, `dev` |

### 💳 Transbank/Webpay (OPCIONALES)

| Variable | Descripción | Valor Integración | Notas |
|----------|-------------|------------------|-------|
| `TRANSBANK_API_KEY` | Clave API de Transbank | `579B532A7440BB0C...` | Clave oficial de integración |
| `TRANSBANK_COMMERCE_CODE` | Código de comercio | `597055555532` | Código oficial de integración |
| `TRANSBANK_RETURN_URL` | URL de retorno | `http://localhost:8000/confirmacion-pago` | Debe coincidir con frontend |
| `TRANSBANK_ENVIRONMENT` | Entorno de Transbank | `INTEGRATION` | `INTEGRATION` o `PRODUCTION` |
| `MOCK_PAYMENT` | Modo de pago simulado | `true` | `true` para pruebas, `false` para producción |

### 📧 Configuración de Email (OPCIONALES)

| Variable | Descripción | Ejemplo | Notas |
|----------|-------------|---------|-------|
| `EMAIL_HOST` | Servidor SMTP | `smtp.gmail.com` | Para Gmail |
| `EMAIL_PORT` | Puerto SMTP | `587` | 587 para TLS, 465 para SSL |
| `EMAIL_SECURE` | Usar SSL/TLS | `false` | `true` para puerto 465 |
| `EMAIL_USER` | Usuario de email | `ferremas@gmail.com` | Email completo |
| `EMAIL_PASSWORD` | Contraseña/App Password | `abcd efgh ijkl mnop` | ⚠️ **App Password para Gmail** |
| `EMAIL_FROM_NAME` | Nombre remitente | `Ferremas` | Nombre visible en emails |
| `EMAIL_FROM_ADDRESS` | Email remitente | `no-reply@ferremas.cl` | Email de respuesta |
| `EMAIL_SMTP_TIMEOUT` | Timeout SMTP | `10000` | Milisegundos |

### 💱 API de Conversión de Monedas (OPCIONALES)

| Variable | Descripción | Ejemplo | Notas |
|----------|-------------|---------|-------|
| `DOLLAR_API_URL` | URL de API del dólar | `https://mindicador.cl/api/dolar` | API chilena oficial |
| `DOLLAR_UPDATE_INTERVAL` | Intervalo de actualización | `3600000` | Milisegundos (1 hora) |

### 🔍 Logging y Debugging (OPCIONALES)

| Variable | Descripción | Valores | Notas |
|----------|-------------|---------|-------|
| `LOG_LEVEL` | Nivel de logging | `debug`, `info`, `warn`, `error` | `debug` para desarrollo |

### 🛡️ Seguridad Avanzada (OPCIONALES)

| Variable | Descripción | Ejemplo | Notas |
|----------|-------------|---------|-------|
| `RATE_LIMIT_WINDOW` | Ventana de rate limiting | `15` | Minutos |
| `RATE_LIMIT_MAX` | Máximo de requests | `100` | Por ventana de tiempo |

### 🌐 URLs del Frontend (OPCIONALES)

| Variable | Descripción | Ejemplo | Notas |
|----------|-------------|---------|-------|
| `FRONTEND_URL` | URL base del frontend | `http://localhost:8000` | Django development server |
| `FRONTEND_CONFIRM_URL` | URL de confirmación | `http://localhost:8000/confirmacion-pago` | Para pagos |

## 🚨 Configuraciones Críticas

### ⚠️ Seguridad
1. **NUNCA** commits el archivo `.env` al repositorio
2. **JWT_SECRET** debe tener al menos 32 caracteres aleatorios
3. **DB_PASSWORD** debe ser una contraseña fuerte
4. **EMAIL_PASSWORD** debe ser un App Password, no tu contraseña personal

### 🔄 Para Gmail
1. Activar verificación en 2 pasos
2. Generar App Password en configuración de Google
3. Usar el App Password de 16 caracteres en `EMAIL_PASSWORD`

### 🏦 Para Transbank
- **Integración**: Usar los valores proporcionados en la documentación
- **Producción**: Solicitar credenciales reales a Transbank
- **Testing**: Mantener `MOCK_PAYMENT=true`

## 🧪 Validación Automática

El sistema incluye validación automática de configuración:

```bash
# Validar configuración actual
npm run validate-env

# Ejemplo de salida exitosa:
✅ CONFIGURACIÓN COMPLETA: Todas las variables están correctamente definidas

# Ejemplo con advertencias:
⚠️  ADVERTENCIAS ENCONTRADAS: Configuración parcial
   Considera actualizar las variables con placeholders
```

## 🛠️ Solución de Problemas

### Error: "Variables requeridas sin definir"
```bash
# Verificar que el archivo .env existe
ls -la .env

# Verificar contenido
cat .env

# Copiar desde ejemplo si no existe
cp .env.example .env
```

### Error: "JWT_SECRET muy corto"
```bash
# Generar clave segura (Linux/Mac)
openssl rand -base64 48

# O usar una herramienta online para generar claves seguras
```

### Error de conexión a MySQL
```bash
# Verificar que MySQL esté corriendo
# Windows
net start mysql

# Linux
sudo systemctl start mysql

# Probar conexión manual
mysql -u root -p -h localhost
```

### Error de email/SMTP
```bash
# Para Gmail, verificar:
# 1. Verificación en 2 pasos activada
# 2. App Password generado
# 3. EMAIL_PORT=587 y EMAIL_SECURE=false
```

## 📚 Variables por Entorno

### 🔧 Desarrollo (`NODE_ENV=development`)
```bash
NODE_ENV=development
LOG_LEVEL=debug
MOCK_PAYMENT=true
DB_LOGGING=true
CORS_ORIGIN=http://localhost:8000,http://127.0.0.1:8000
```

### 🚀 Producción (`NODE_ENV=production`)
```bash
NODE_ENV=production
LOG_LEVEL=error
MOCK_PAYMENT=false
DB_LOGGING=false
CORS_ORIGIN=https://tudominio.com
# JWT_SECRET debe ser diferente y más seguro
# DB_PASSWORD debe ser una contraseña fuerte de producción
```

### 🧪 Pruebas (`NODE_ENV=test`)
```bash
NODE_ENV=test
LOG_LEVEL=warn
MOCK_PAYMENT=true
DB_NAME=ferremas_test
# Usar base de datos separada para pruebas
```

## 📞 Soporte

Si tienes problemas con la configuración:

1. **Ejecutar validación**: `npm run validate-env`
2. **Revisar logs**: Verificar la consola al iniciar el servidor
3. **Verificar servicios**: MySQL, conexiones de red
4. **Consultar documentación**: De los servicios externos (Gmail, Transbank)

---

*Documentación actualizada: 2025-01-22*  
*Para más información, consulta los READMEs del proyecto* 📚