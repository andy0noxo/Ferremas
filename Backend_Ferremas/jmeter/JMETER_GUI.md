# 🎨 JMeter GUI - Guía Completa de Visualización

## ✅ Respuesta Directa

**¿Puedo ver los planes en JMeter GUI?**

✅ **SÍ - 100% Compatible**. Los 4 planes `.jmx` se abrirán exactamente como se ve en tu imagen adjunta.

---

## 📋 Requisitos Previos

Antes de abrir, asegúrate de tener:

### 1. JMeter Instalado
```bash
# Verificar instalación
jmeter -v

# Si no está instalado:
npm run jmeter:install
```

### 2. Backend Corriendo
```bash
# Opción A: Docker
docker-compose up -d db backend

# Opción B: Local
npm run dev
```

**Verificar:**
```bash
curl http://localhost:3000/api/health
```

### 3. Datos de Prueba Inicializados
```bash
npm run jmeter:setup-data
```

**Verificar:**
```bash
ls Backend_Ferremas/jmeter/data/
# Deberías ver: usuarios.csv, productos.csv
```

---

## 🚀 3 FORMAS DE ABRIR LOS PLANES

### Opción 1: npm Scripts (Recomendado - Más Fácil)

#### Individual
```bash
npm run jmeter:gui:smoke       # Abre Smoke Test
npm run jmeter:gui:carga       # Abre Load Test
npm run jmeter:gui:estres      # Abre Stress Test
npm run jmeter:gui:resistencia # Abre Resistance Test
npm run jmeter:gui             # Default (smoke)
```

#### Todos en Paralelo (4 ventanas simultáneamente)
```bash
npm run jmeter:gui:all
```

Este es el **comando para visualizar todas las pruebas en GUI simultáneamente**.

---

### Opción 2: Scripts Directo

#### Windows:
```bash
# Todos en paralelo
bash jmeter/scripts/open-all-jmeter.bat

# Individual (por default abre smoke)
bash jmeter/scripts/open-jmeter.bat scenario_smoke
bash jmeter/scripts/open-jmeter.bat scenario_carga
bash jmeter/scripts/open-jmeter.bat scenario_estres
bash jmeter/scripts/open-jmeter.bat scenario_resistencia
```

#### Linux/Mac:
```bash
# Todos en paralelo
bash jmeter/scripts/open-all-jmeter.sh

# Individual
bash jmeter/scripts/open-jmeter.sh scenario_smoke
```

---

### Opción 3: Línea de Comandos JMeter

```bash
# Abrir plan específico
jmeter -t jmeter/testplans/scenario_smoke.jmx
jmeter -t jmeter/testplans/scenario_carga.jmx
jmeter -t jmeter/testplans/scenario_estres.jmx
jmeter -t jmeter/testplans/scenario_resistencia.jmx
```

---

### Opción 4: Desde JMeter GUI

1. Abre JMeter:
   ```bash
   jmeter
   ```

2. Menú: `File` → `Open...` (o `Ctrl+O`)

3. Navega a: `jmeter/testplans/`

4. Selecciona: `scenario_smoke.jmx` (o el que quieras)

5. Click: `Open`

---

## 🎨 Lo Que Verás - Estructura de GUI

### Vista General
```
┌─────────────────────────────────────────────────────────────┐
│ JMeter GUI - Ferremas Load Testing                          │
├──────────────────────────┬──────────────────────────────────┤
│                          │                                  │
│   ÁRBOL (Izquierda)      │   DETALLES (Derecha)             │
│                          │                                  │
│ 📦 TestPlan              │  Test Plan: Smoke Test          │
│  ├─ 🔧 Config            │  Number of Threads: 10          │
│  ├─ ⚙️ HTTP Defaults     │  Ramp-Up: 30s                   │
│  ├─ 👥 Thread Group      │  Loop Count: 1                  │
│  │ ├─ 📡 GET /health     │                                 │
│  │ ├─ 📡 GET /productos  │  [✓] Serialize threads         │
│  │ └─ 📡 GET /usuarios   │                                 │
│  └─ 📊 Listener (si lo agregaste)                           │
│                          │                                  │
│ [▶️ Run] [⏹️ Stop]        │  [Add Listener ▼]              │
│ [Ctrl+R]  [Ctrl+.]      │                                 │
└──────────────────────────┴──────────────────────────────────┘
```

### Panel Izquierdo - Árbol de Componentes

Verás la estructura completa del plan:

#### scenario_smoke.jmx
```
📦 TestPlan: Ferremas - Smoke Test
├─ 🔧 Global Configuration
│  ├─ BACKEND_HOST: localhost
│  └─ BACKEND_PORT: 3000
├─ ⚙️ HTTP Request Defaults
│  ├─ Protocol: http
│  ├─ Timeout: 10000ms
│  └─ Keep-Alive: ✓
└─ 👥 Thread Group (10 usuarios)
   ├─ 📡 GET /productos
   │  └─ ✅ Assert 200
   ├─ 📡 GET /usuarios
   │  └─ ✅ Assert 200
   └─ 📡 GET /health
      └─ ✅ Assert 200
```

#### scenario_carga.jmx
```
📦 TestPlan: Ferremas - Load Test
├─ 🔧 Global Configuration
├─ 📋 CSVDataSet: usuarios.csv
├─ ⚙️ HTTP Request Defaults
└─ 👥 Thread Group (100 usuarios)
   ├─ 📡 POST /auth/login
   │  ├─ Body: {"email":"${email}","password":"${password}"}
   │  └─ 📤 JSONPostProcessor: Extract Token
   ├─ 📡 GET /productos
   │  ├─ Headers: Authorization: Bearer ${jwtToken}
   │  └─ ✅ Assert 200
   └─ 📡 GET /usuarios
      ├─ Headers: Authorization: Bearer ${jwtToken}
      └─ ✅ Assert 200
```

#### scenario_estres.jmx
```
📦 TestPlan: Ferremas - Stress Test
├─ 📋 CSVDataSet: usuarios.csv
├─ 📋 CSVDataSet: productos.csv
└─ 👥 Thread Group (500 usuarios)
   ├─ 📡 POST /auth/login (Stress)
   ├─ 📡 GET /productos (Filtered)
   │  ├─ Parameters: categoria, page (random), sort
   │  └─ ✅ Assert 200
   └─ 📡 GET /usuarios (Paginated)
      ├─ Parameters: page (random), limit
      └─ ✅ Assert 200
```

#### scenario_resistencia.jmx
```
📦 TestPlan: Ferremas - Resistance Test
├─ 📋 CSVDataSet: usuarios.csv
└─ 👥 Thread Group (50 usuarios)
   ├─ 📡 GET /productos (Loop Infinito)
   │  └─ Timer: ${__random(2000,4000)} ms
   └─ 📡 GET /usuarios (Loop Infinito)
      └─ Timer: ${__random(2000,4000)} ms
```

### Panel Derecho - Detalles del Elemento

Al seleccionar cualquier elemento del árbol, verás los detalles:

#### HTTP Request Details
```
HTTP Request: GET /productos

Protocol: http
Domain: ${BACKEND_HOST}
Port: ${BACKEND_PORT}
Path: /api/productos
Method: GET

Parameters:
  page: 1
  limit: 10

Headers:
  Content-Type: application/json

[✓] Follow Redirects
[✓] Use KeepAlive
[ ] Use multipart/form-data

Connect Timeout: 10000 ms
Response Timeout: 30000 ms
```

#### Thread Group Details
```
Thread Group: Load Test Users

Number of Threads: 100
Ramp-Up Period (seconds): 120
Loop Count: 1

On Sample Error:
  (•) Continue
  ( ) Start Next Loop
  ( ) Stop Thread
  ( ) Stop Test

[✓] Scheduler
```

---

## ▶️ EJECUTAR LOS TESTS

### Paso 1: Preparar (Antes de Ejecutar)

```bash
# Terminal 1: Inicializar datos
npm run jmeter:setup-data

# Terminal 2: Asegurar backend corriendo
docker-compose up -d db backend

# Terminal 3: Abrir GUI
npm run jmeter:gui:all  # Para todos en paralelo
# O individual:
npm run jmeter:gui:smoke
```

### Paso 2: Agregar Visualización (En JMeter)

En cada ventana de JMeter:

```
1. Click derecho en "Thread Group"
2. Selecciona: Add
3. Selecciona: Listener
4. Selecciona: View Results Tree
```

**Resultado:** Se agrega un listener al árbol

### Paso 3: Ejecutar Test

```
Click en botón ▶️ Run
O presiona: Ctrl+R
```

### Paso 4: Ver Resultados en Tiempo Real

El listener mostrará cada request procesándose:
- ✅ Verde = Request exitoso
- ❌ Rojo = Request con error
- ⏱️ Latencia en ms
- 📊 Respuesta HTTP completa

---

## 📊 LISTENERS DISPONIBLES

Puedes agregar múltiples listeners para diferentes vistas:

### 1. View Results Tree (Recomendado)
```bash
# Click derecho en Thread Group
→ Add → Listener → View Results Tree
```

**Muestra:**
- Cada request individual
- Respuesta completa
- Latencia por request
- Status (OK/Error)

**Tabla:**
```
│ Sampler              │ Status │ Response Time │
├─────────────────────┼────────┼───────────────┤
│ GET /productos      │ ✅ OK  │ 45 ms         │
│ GET /usuarios       │ ✅ OK  │ 38 ms         │
│ GET /health         │ ✅ OK  │ 12 ms         │
```

### 2. Summary Report
```bash
→ Add → Listener → Summary Report
```

**Muestra:**
```
Sampler          │ # Samples │ Average │ Min │ Max │ Error%
─────────────────┼───────────┼─────────┼─────┼─────┼────────
GET /productos   │    10     │   47    │ 35  │ 120 │  0%
GET /usuarios    │    10     │   40    │ 28  │ 95  │  0%
GET /health      │    10     │   15    │ 10  │ 45  │  0%
```

### 3. Response Time Graph
```bash
→ Add → Listener → Response Time Graph
```

**Muestra:** Gráfico de latencia en vivo

### 4. Aggregate Report
```bash
→ Add → Listener → Aggregate Report
```

**Muestra:** Tabla con p50, p90, p99 latency

---

## 🔄 EJECUTAR TODOS LOS PLANES EN PARALELO

### Comando Único
```bash
npm run jmeter:gui:all
```

### Qué Sucede
1. Se abren 4 ventanas de JMeter (con 2 segundos de intervalo)
2. Cada una con un plan diferente cargado:
   - Ventana 1: Smoke Test (10 usuarios)
   - Ventana 2: Load Test (100 usuarios)
   - Ventana 3: Stress Test (500 usuarios)
   - Ventana 4: Resistance Test (50 usuarios)

### Workflow Paralelo

#### En cada ventana:
1. Agregar listener (igual que antes)
2. Click ▶️ Run
3. Observar resultados

**Ventaja:** Compara performance entre escenarios simultáneamente

#### Ejemplo de Comparación:
| Plan | Usuarios | Throughput | p95 Latency | Errors |
|------|----------|-----------|-------------|--------|
| Smoke | 10 | 300 req/s | 85ms | 0 |
| Load | 100 | 250 req/s | 150ms | 0 |
| Stress | 500 | 150 req/s | 250ms | <1% |
| Resistance | 50 | 100 req/s | 120ms | 0 |

---

## ✏️ PERSONALIZAR EN GUI

### Cambiar Número de Usuarios

1. Selecciona "Thread Group" en el árbol
2. En el panel derecho busca "Number of Threads"
3. Cambia el valor (ej: 10 → 50)
4. Click ▶️ Run para probar

### Cambiar Host/Puerto

1. Selecciona "HTTP Request Defaults"
2. Cambia "Domain" o "Port" en el panel derecho
3. Click ▶️ Run

### Agregar Nuevo Request

1. Click derecho en "Thread Group"
2. Add → Sampler → HTTP Request
3. Configura:
   - Path: `/api/nuevo-endpoint`
   - Method: GET o POST
   - Parameters, Headers, etc.
4. Click ▶️ Run

### Guardar Cambios

```bash
Ctrl+S
# O: File → Save
```

---

## 💾 GUARDAR/EXPORTAR RESULTADOS

### Guardar Resultados del Listener

```bash
1. Click derecho en Listener
2. Save results as...
3. Elige formato:
   - CSV
   - XML
   - JSON
4. Selecciona ubicación y click Save
```

### Guardar Plan Modificado

```bash
Ctrl+S
# Se guarda en el mismo archivo .jmx
```

---

## 🐛 TROUBLESHOOTING

### Problema: "Cannot find jmeter"
```bash
# Instalar
npm run jmeter:install

# Verificar
jmeter -v
```

### Problema: "Backend not reachable"
```bash
# Verificar que está corriendo
curl http://localhost:3000/api/health

# Si no:
docker-compose up -d db backend
```

### Problema: "No data in CSV files"
```bash
# Reinicializar datos
npm run jmeter:setup-data

# Verificar
ls jmeter/data/
```

### Problema: "Test plan opens but no data in listener"
```bash
# 1. Asegúrate que agregaste listener
#    (Click derecho Thread Group → Add → Listener → View Results Tree)

# 2. Asegúrate que ejecutaste con ▶️ Run

# 3. Si aún sin datos:
#    - Verifica backend está corriendo
#    - Verifica datos inicializados
#    - Revisa console para errores
```

### Problema: JMeter cierra inesperadamente
```bash
# Aumentar memoria
export JMETER_HOME=/path/to/jmeter
export HEAP="-Xmx2g -Xms1g"
jmeter

# O: editar bin/jmeter.properties
# Buscar: HEAP=-Xmx512m
# Cambiar a: HEAP=-Xmx2g -Xms1g
```

---

## 🎯 WORKFLOW COMPLETO (5 MINUTOS)

### Terminal 1: Inicializar
```bash
npm run jmeter:setup-data
docker-compose up -d db backend
```

### Terminal 2: Abrir GUI

#### Option A: Todos en paralelo (Recomendado)
```bash
npm run jmeter:gui:all
```

#### Option B: Individual
```bash
npm run jmeter:gui:smoke
```

### En cada ventana JMeter:

```
1. Click derecho en "Thread Group"
2. Add → Listener → View Results Tree
3. Click ▶️ Run (Ctrl+R)
4. ¡Observa resultados!
```

---

## 📋 RESUMEN DE COMANDOS

```bash
# GUI Individual
npm run jmeter:gui                # Default (smoke)
npm run jmeter:gui:smoke          # Smoke Test
npm run jmeter:gui:carga          # Load Test
npm run jmeter:gui:estres         # Stress Test
npm run jmeter:gui:resistencia    # Resistance Test

# GUI Paralelo (TODOS)
npm run jmeter:gui:all

# Scripts Directos
bash jmeter/scripts/open-jmeter.sh                    # Individual
bash jmeter/scripts/open-all-jmeter.sh                # Todos

# Línea de comandos
jmeter -t jmeter/testplans/scenario_smoke.jmx
```

---

## ✅ CHECKLIST ANTES DE EJECUTAR

```
☐ JMeter instalado: jmeter -v
☐ Backend corriendo: curl http://localhost:3000/api/health
☐ Datos inicializados: npm run jmeter:setup-data
☐ Archivos .jmx presentes: ls jmeter/testplans/
☐ Scripts presentes: ls jmeter/scripts/open*
```

---

## 🎉 ¡LISTO PARA USAR!

### Comando para Visualizar TODAS las Pruebas:
```bash
npm run jmeter:gui:all
```

Se abrirán 4 ventanas JMeter con todos los planes simultáneamente.

Luego:
1. En cada ventana: Agregar listener (Click derecho → Add → Listener → View Results Tree)
2. En cada ventana: Click ▶️ Run
3. ¡Observa los resultados en tiempo real!

---

## 📚 Documentos Relacionados

- [JMETER_GUIDE.md](JMETER_GUIDE.md) - Guía técnica detallada
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Solución de problemas
- [README_JMETER.md](README_JMETER.md) - Descripción general
