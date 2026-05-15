# 🚀 JMeter - Ejecución de Pruebas

## 🎯 Resumen Rápido

| Método | Comando | Durabilidad | Mejor Para |
|--------|---------|------------|-----------|
| **Local** | `npm run jmeter:local:smoke` | ~90 seg | Desarrollo |
| **Docker** | `npm run jmeter:docker:smoke` | ~90 seg | CI/CD |
| **GUI** | `npm run jmeter:gui:all` | Variable | Análisis interactivo |

---

## ⚡ INSTALACIÓN INICIAL

### JMeter Instalado Localmente (Primera Vez)

```bash
npm run jmeter:install
```

**Requisitos:**
- Java 11+ instalado
- ~100 MB de espacio

**Verificar:**
```bash
jmeter -v
```

---

## 🖥️ EJECUCIÓN LOCAL (SIN DOCKER)

### Requisitos

```bash
# 1. Backend corriendo
npm run dev

# 2. Datos inicializados
npm run jmeter:setup-data

# 3. JMeter instalado
jmeter -v
```

### Comandos Disponibles

#### Smoke Test (Rápido - ~90 segundos)
```bash
npm run jmeter:local:smoke
```

**Qué prueba:**
- 10 usuarios concurrentes
- 30 segundos ramp-up
- 60 segundos hold
- 3 endpoints básicos (health, productos, usuarios)

#### Load Test (Normal - ~7 minutos)
```bash
npm run jmeter:local:carga
```

**Qué prueba:**
- 100 usuarios concurrentes
- 120 segundos ramp-up (2 min)
- 300 segundos hold (5 min)
- Authentication + Product/User queries

#### Stress Test (Pesado - ~6 minutos)
```bash
npm run jmeter:local:estres
```

**Qué prueba:**
- 500 usuarios concurrentes (MÁXIMO)
- 180 segundos ramp-up (3 min)
- 180 segundos hold (3 min)
- Queries complejas con filtros

#### Resistance Test (Largo - ~32 minutos)
```bash
npm run jmeter:local:resistencia
```

**Qué prueba:**
- 50 usuarios
- 1800 segundos hold (30 minutos)
- Loop infinito de requests
- Detección de memory leaks

### Flujo Completo Local

```bash
# Terminal 1: Backend
cd Backend_Ferremas
npm run dev

# Terminal 2: Inicializar datos (una sola vez)
npm run jmeter:setup-data

# Terminal 3: Ejecutar pruebas
npm run jmeter:local:smoke   # Rápido
npm run jmeter:local:carga   # Normal
npm run jmeter:local:estres  # Pesado
```

### Resultados Local

Los reportes HTML se guardan en:
```
jmeter/reports/html-report-[scenario]-[timestamp]/index.html
```

**Abrir reporte:**
```bash
# Windows
start jmeter/reports/html-report-smoke-*/index.html

# Mac
open jmeter/reports/html-report-smoke-*/index.html

# Linux
firefox jmeter/reports/html-report-smoke-*/index.html
```

---

## 🐳 EJECUCIÓN EN DOCKER

### Requisitos

```bash
# 1. Docker corriendo
docker ps

# 2. Docker Compose instalado
docker-compose --version

# 3. Servicios disponibles
docker-compose up -d db backend
```

### Comandos Disponibles

#### Smoke Test
```bash
npm run jmeter:docker:smoke
```

#### Load Test
```bash
npm run jmeter:docker:carga
```

#### Stress Test
```bash
npm run jmeter:docker:estres
```

#### Resistance Test
```bash
npm run jmeter:docker:resistencia
```

### Flujo Completo Docker

```bash
# Terminal 1: Inicializar datos
npm run jmeter:setup-data

# Terminal 2: Iniciar servicios
docker-compose up -d db backend

# Terminal 3: Ejecutar en Docker
npm run jmeter:docker:smoke

# Terminal 4 (Opcional): Ver logs
docker logs -f jmeter-ferremas
```

### Resultados Docker

**Mientras se ejecuta:**
```bash
# Ver progreso
docker logs -f jmeter-ferremas

# Ver contenedores
docker ps
```

**Después de terminar:**
```bash
# Copiar resultados del contenedor
docker cp jmeter-ferremas:/home/jmeter/work/reports/. jmeter/reports/

# Ver reporte
open jmeter/reports/html-report-smoke-*/index.html
```

---

## 📊 INTERPRETACIÓN DE RESULTADOS

### Métricas Importantes

| Métrica | Bueno | Aceptable | Malo |
|---------|-------|-----------|------|
| **Throughput** | > 200 req/s | 100-200 | < 100 |
| **p95 Latency** | < 500 ms | 500-1000 | > 1000 ms |
| **p99 Latency** | < 1000 ms | 1000-2000 | > 2000 ms |
| **Error Rate** | 0% | < 1% | > 1% |

### Ejemplos de Resultados

#### Smoke Test (Esperado)
```
Sampler          │ # Samples │ Avg   │ p95  │ p99  │ Error%
─────────────────┼───────────┼───────┼──────┼──────┼────────
GET /health      │    10     │  15ms │  30  │  45  │  0%
GET /productos   │    10     │  47ms │  85  │ 110  │  0%
GET /usuarios    │    10     │  40ms │  75  │ 100  │  0%
─────────────────┴───────────┴───────┴──────┴──────┴────────
Throughput:       ~333 req/s
```

#### Load Test (Esperado)
```
Sampler          │ # Samples │ Avg    │ p95   │ p99   │ Error%
─────────────────┼───────────┼────────┼───────┼───────┼────────
POST /login      │   100     │  85ms  │  200  │  350  │  0%
GET /productos   │   100     │ 120ms  │  250  │  400  │  0%
GET /usuarios    │   100     │  95ms  │  220  │  380  │  0%
─────────────────┴───────────┴────────┴───────┴───────┴────────
Throughput:        ~250 req/s
```

#### Stress Test (Esperado)
```
Sampler          │ # Samples │ Avg     │ p95    │ p99    │ Error%
─────────────────┼───────────┼─────────┼────────┼────────┼────────
POST /login      │   500     │  250ms  │  500   │  900   │  0.5%
GET /productos   │   500     │  300ms  │  650   │ 1200   │  0.8%
GET /usuarios    │   500     │  280ms  │  600   │ 1100   │  0.3%
─────────────────┴───────────┴─────────┴────────┴────────┴────────
Throughput:         ~150 req/s
```

---

## 🔧 CONFIGURACIÓN AVANZADA

### Cambiar Parámetros

Editar: `jmeter/config/environment.properties`

```properties
# Hosts
BACKEND_HOST=localhost
BACKEND_PORT=3000

# Scenario parameters
SMOKE_USERS=10
LOAD_USERS=100
STRESS_USERS=500
RESISTENCIA_USERS=50

# Timeouts (ms)
CONNECTION_TIMEOUT=10000
RESPONSE_TIMEOUT=30000

# Ramp-up times (seconds)
SMOKE_RAMPUP=30
LOAD_RAMPUP=120
STRESS_RAMPUP=180
RESISTENCIA_RAMPUP=120
```

### Ejecutar con Parámetros Personalizados

```bash
# Local con parámetros personalizados
jmeter -Jusers=50 -Jrampup=60 -t jmeter/testplans/scenario_carga.jmx -e -o jmeter/reports/custom

# Docker con parámetros
docker run --env JMETER_USERS=200 jmeter-ferremas
```

---

## 📈 BATCH PROCESSING (Ejecutar Todos)

### Ejecutar Todos Secuencialmente

```bash
npm run jmeter:local:smoke && \
npm run jmeter:local:carga && \
npm run jmeter:local:estres && \
npm run jmeter:local:resistencia
```

**Duración Total:** ~45 minutos

### Ejecutar Todos en Docker

```bash
npm run jmeter:docker:smoke && \
npm run jmeter:docker:carga && \
npm run jmeter:docker:estres && \
npm run jmeter:docker:resistencia
```

---

## 📁 GESTIÓN DE REPORTES

### Ubicación de Reportes

```
Backend_Ferremas/jmeter/reports/
├── html-report-smoke-2026-05-15_10-30-45/
│  ├── index.html
│  ├── js/
│  └── css/
├── html-report-carga-2026-05-15_10-35-20/
├── html-report-estres-2026-05-15_11-00-00/
└── html-report-resistencia-2026-05-15_11-30-00/
```

### Limpiar Reportes Antiguos

```bash
npm run jmeter:cleanup
```

**Mantiene:** Últimos 5 reportes  
**Elimina:** Reportes más antiguos

---

## 🎯 MEJORES PRÁCTICAS

### 1. Orden de Ejecución Recomendado

```bash
# Primero: Validar rápido
npm run jmeter:local:smoke

# Segundo: Si smoke pasa, ejecutar carga
npm run jmeter:local:carga

# Tercero: Si load pasa, ejecutar stress
npm run jmeter:local:estres

# Cuarto: Para detección de leaks
npm run jmeter:local:resistencia
```

### 2. Validación Pre-Test

Antes de ejecutar siempre verificar:

```bash
# Backend corriendo
curl http://localhost:3000/api/health

# Datos inicializados
npm run jmeter:setup-data

# Sistema con recursos
# (Si Stress/Resistance: 4GB+ RAM, 2+ CPU)
```

### 3. Análisis de Resultados

**Guardar reportes para comparación:**

```bash
# Después de cada test
cp -r jmeter/reports/html-report-* /backups/jmeter-results/
```

---

## 🐛 TROUBLESHOOTING

### Error: "Backend not reachable"
```bash
# Verificar backend
curl http://localhost:3000/api/health

# Reiniciar si es necesario
docker-compose restart backend
```

### Error: "Out of memory"
```bash
# Aumentar memoria JVM
export JMETER_OPTS="-Xmx4g -Xms2g"
npm run jmeter:local:estres
```

### Error: "No test data"
```bash
npm run jmeter:setup-data
```

### Error: "Container already exists"
```bash
docker stop jmeter-ferremas
docker rm jmeter-ferremas
npm run jmeter:docker:smoke
```

---

## 📚 DOCUMENTOS RELACIONADOS

- [JMETER_GUI.md](JMETER_GUI.md) - Visualización interactiva
- [JMETER_GUIDE.md](JMETER_GUIDE.md) - Guía técnica detallada
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Problemas y soluciones
- [README_JMETER.md](README_JMETER.md) - Descripción general
