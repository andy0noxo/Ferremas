# 🐛 Troubleshooting - Pruebas JMeter Ferremas

## Problemas Comunes y Soluciones

### 1. "Connection refused" - Backend no accesible

**Error:**
```
ERROR java.net.ConnectException: Connection refused
```

**Soluciones:**

a) Verificar que backend está corriendo:
```bash
# En otra terminal
npm run dev

# O verificar conectividad
curl http://localhost:3000/health
```

b) Verificar puerto correcto en config:
```bash
# config/environment.properties
HOST=localhost
PORT=3000
```

c) Si usas Docker, asegúrate que servicios están en la misma red:
```bash
docker-compose ps
# debe mostrar backend "Up"

docker network ls | grep ferremas
# debe existir red ferremas-network
```

---

### 2. "Out of Memory" - Heap insuficiente

**Error:**
```
java.lang.OutOfMemoryError: Java heap space
```

**Soluciones:**

a) Aumentar heap en ejecución local:
```bash
# Linux/Mac
export HEAP="-Xmx4g -Xms2g"
npm run jmeter:local:carga

# Windows PowerShell
$env:HEAP = "-Xmx4g -Xms2g"
npm run jmeter:local:carga
```

b) Reducir número de usuarios en test:
- Editar `jmeter/testplans/scenario_carga.jmx`
- Cambiar ThreadGroup > num_threads de 100 a 50

c) Reducir tiempo de hold:
- Cambiar ThreadGroup > ramp_time

---

### 3. "Too many connections" - Pool de conexiones MySQL agotado

**Error:**
```
ERROR: User 'ferremas' has already opened too many connections
```

**Soluciones:**

a) Resetear base de datos:
```bash
npm run jmeter:setup-data
```

b) Aumentar max_connections en MySQL:
```sql
-- Conectarse a MySQL como root
mysql -u root -p

-- Ver límite actual
SHOW VARIABLES LIKE 'max_connections';

-- Aumentar (ejemplo: 1000)
SET GLOBAL max_connections = 1000;
```

c) O editar docker-compose.yml:
```yaml
services:
  db:
    command: --max_connections=1000
```

d) Esperar a que se cierren conexiones:
```bash
# Esperar 30 segundos
sleep 30

# Reintentar test
npm run jmeter:local:smoke
```

---

### 4. "401 Unauthorized" - Token JWT expirado

**Error:**
```
Response code: 401
Response message: Unauthorized
```

**Soluciones:**

a) Verificar que archivos CSV existen:
```bash
ls jmeter/data/
# debe mostrar usuarios.csv y productos.csv
```

b) Regenerar datos de prueba:
```bash
npm run jmeter:setup-data
```

c) Reducir tiempo de test en scenario_.jmx:
- Cambiar `ThreadGroup.duration` a valor menor

d) Verificar tokens se extraen correctamente:
- Abrir jmeter report HTML
- View Results Tree
- Buscar "jwtToken"

---

### 5. "Test failed with exit code 1" - Test completó con errores

**Error:**
```
❌ Test failed with exit code 1
```

**Soluciones:**

a) Revisar logs detallados:
```bash
tail -f jmeter/reports/jmeter-*.log
```

b) Verificar respuestas:
- Abrir HTML report en `jmeter/reports/html-report-*/`
- Ver "Errors" tab
- Revisar qué endpoints fallaron

c) Ver requests/responses individuales:
```bash
# En JMeter GUI (para debugging)
jmeter

# File > Open > jmeter/testplans/scenario_smoke.jmx
# Agregar Listener > View Results Tree
# Run test
```

---

### 6. "No test data found" - CSVs de usuarios/productos no existen

**Error:**
```
❌ Test data not found. Generating...
```

**Soluciones:**

a) Generar datos:
```bash
npm run jmeter:setup-data
```

b) Si falla, verificar conectividad a BD:
```bash
# Probar conexión
mysql -h localhost -u ferremas -pferremas123 ferremas -e "SELECT COUNT(*) FROM usuarios;"
```

c) Usar datos manualmente:
```bash
# Crear usuarios.csv a mano en jmeter/data/
email,password,nombre
admin@ferremas.cl,Admin123!,Admin
```

---

### 7. "Docker image not found" - Imagen jmeter-ferremas no existe

**Error:**
```
❌ docker: Error response from daemon: reference to a non-existent image
```

**Soluciones:**

a) Construir imagen:
```bash
docker build -t jmeter-ferremas -f jmeter/Dockerfile jmeter/
```

b) O dejar que el script lo haga automáticamente:
```bash
npm run jmeter:docker:smoke
# Construirá imagen si no existe
```

---

### 8. "Network ferremas-network not found" - Red Docker no existe

**Error:**
```
Error: network ferremas-network not found
```

**Soluciones:**

a) Ejecutar servicios principales primero:
```bash
docker-compose up -d db backend
```

b) Verificar red:
```bash
docker network ls | grep ferremas
```

c) Recrear network manualmente:
```bash
docker network create ferremas-network
```

---

### 9. Reportes HTML no se generan

**Soluciones:**

a) Verificar JMeter ejecutó exitosamente:
```bash
# Ver archivo de log
cat jmeter/reports/jmeter-*.log | grep "Summariser"
# Debe mostrar resumen final
```

b) Verificar permisos en directorio reports:
```bash
ls -la jmeter/reports/
# Debe tener permisos de escritura
chmod 755 jmeter/reports/
```

c) Verificar archivo .jtl se creó:
```bash
ls -la jmeter/reports/*.jtl
```

d) Generar reporte manualmente:
```bash
jmeter -g jmeter/reports/results_*.jtl -o jmeter/reports/html-custom/
```

---

### 10. "HEAP variable not recognized" - Error de memoria en Windows

**Error:**
```
HEAP: command not found
```

**Soluciones (Windows PowerShell):**

a) Usar el .bat:
```bash
cmd
cd Backend_Ferremas\jmeter\scripts
run-local.bat scenario_smoke
```

b) O configurar manualmente:
```powershell
# PowerShell
$env:HEAP = "-Xmx2g"
jmeter.bat -n -t testplans\scenario_smoke.jmx
```

c) Configurar HEAP permanentemente:
```
Control Panel > System > Environment Variables
Nueva variable: HEAP = -Xmx2g -Xms1g
```

---

### 11. "Could not resolve host" - DNS/Network issue

**Error:**
```
ERROR java.net.UnknownHostException: backend: Name or service not known
```

**Soluciones:**

a) Si usas Docker, revisar network:
```bash
docker network inspect ferremas-network
# Debe mostrar backend en "Containers"
```

b) Reiniciar servicios:
```bash
docker-compose down
docker-compose up -d
```

c) Usar IP en lugar de hostname:
- Editar `config/environment.properties`
- Cambiar `BACKEND_HOST=backend` a `BACKEND_HOST=172.17.0.2` (obtener con `docker inspect backend`)

---

### 12. "Test results seem incorrect" - Resultados cuestionables

**Verificar:**

a) ¿Backend estaba bajo carga?
```bash
# Durante test, en otra terminal
docker stats

# Ver CPU/Memory usage
```

b) ¿BD estaba respondiendo?
```bash
# Revisar logs MySQL
docker logs ferremas-db | tail -20
```

c) ¿Datos de prueba eran válidos?
```bash
# Verificar datos
cat jmeter/data/usuarios.csv
cat jmeter/data/productos.csv
```

d) ¿Test completó? (No fue interrumpido)
- Revisar HTML report summary
- Debe haber "Total Samples" > 0

---

## 🔍 Comandos de Debugging

### Verificar Conectividad
```bash
# A backend local
curl -v http://localhost:3000/health

# A backend en Docker
curl -v http://backend:3000/health

# Test de login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ferremas.cl","password":"Admin123!"}'
```

### Revisar Estado de BD
```bash
# Listar usuarios de prueba
mysql -h localhost -u ferremas -pferremas123 ferremas \
  -e "SELECT email, nombre FROM usuarios LIMIT 5;"

# Contar registros
mysql -h localhost -u ferremas -pferremas123 ferremas \
  -e "SELECT COUNT(*) as total_usuarios FROM usuarios;"
```

### Monitorear Durante Test
```bash
# En terminal separada, mientras corre test
watch -n 1 'docker stats --no-stream'

# O en el host local
watch 'ps aux | grep node'
```

### Ver Logs en Tiempo Real
```bash
# Backend logs
docker logs -f ferremas-backend

# MySQL logs
docker logs -f ferremas-db

# JMeter logs (en otra terminal)
tail -f jmeter/reports/jmeter-*.log
```

---

## 📞 Soporte Adicional

Si el problema persiste:

1. **Verificar documentación principal:**
   - `jmeter/README_JMETER.md` - Overview y quick start
   - `jmeter/JMETER_GUIDE.md` - Técnicas avanzadas

2. **Revisar logs completos:**
   - `jmeter/reports/jmeter-{scenario}-{timestamp}.log`
   - `Backend_Ferremas/_informes/` (logs del backend)

3. **Contactar al equipo QA:**
   - Proporcionar:
     - Error exacto del log
     - Comando ejecutado
     - Output de `npm -v` y `node -v`
     - Output de `jmeter -v`
     - `docker -v` y `docker-compose -v`

---

**Última actualización:** May 2026
