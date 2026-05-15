# JMeter Load & Stress Testing - Ferremas Project

## 📋 Overview

This directory contains Apache JMeter configurations for load and stress testing the Ferremas backend API. JMeter allows us to simulate multiple concurrent users accessing the system to measure performance under various conditions.

## 🗂️ Directory Structure

```
jmeter/
├── testplans/           # JMeter test plans (.jmx files)
│   ├── 01_autenticacion.jmx        # Login and token generation
│   ├── 02_usuarios.jmx              # User CRUD operations
│   ├── 03_productos.jmx             # Product CRUD and search
│   ├── 04_carrito_compras.jmx       # Shopping cart flow
│   ├── 05_reportes.jmx              # Report generation
│   ├── scenario_smoke.jmx           # Quick validation (10 users, 1 min)
│   ├── scenario_carga.jmx           # Sustained load (100 users, 5 min)
│   ├── scenario_estres.jmx          # Peak stress (500 users, 3 min)
│   └── scenario_resistencia.jmx     # Long duration (50 users, 30 min)
│
├── data/                # Test data fixtures (CSV files)
│   ├── usuarios.csv     # Pre-configured test users (email, password)
│   └── productos.csv    # Pre-configured test products
│
├── config/              # Configuration files
│   └── environment.properties  # Host, ports, scenario parameters
│
├── scripts/             # Supporting scripts
│   ├── setup-fixtures.js       # Initialize test database
│   ├── generar-datos.js        # Generate test data and export to CSV
│   ├── cleanup-reports.sh      # Clean old reports
│   ├── docker-entrypoint.sh    # Docker container entry point
│   ├── run-local.sh            # Execute tests locally (Linux/Mac)
│   ├── run-local.bat           # Execute tests locally (Windows)
│   ├── run-docker.sh           # Execute tests in Docker (Linux/Mac)
│   └── run-docker.bat          # Execute tests in Docker (Windows)
│
├── reports/             # Test result reports (auto-generated)
│   └── .gitkeep        # Placeholder (reports go here)
│
├── Dockerfile           # Docker image for JMeter
├── docker-compose.jmeter.yml  # Docker Compose configuration
├── README_JMETER.md     # This file
└── JMETER_GUIDE.md      # Detailed guide on using JMeter
```

## 🚀 Quick Start

### Prerequisites

#### Local Execution
- JMeter 5.5+ installed (`jmeter -v` should work)
- Node.js 18+ (for running setup-fixtures.js)
- MySQL running (Backend_Ferremas must be accessible at localhost:3000)

#### Docker Execution
- Docker and Docker Compose installed
- Backend service running in docker-compose.yml

### Installation (First Time)

#### Local JMeter Installation

**Linux/Mac:**
```bash
cd Backend_Ferremas/jmeter
bash scripts/install-jmeter.sh
```

**Windows (manual):**
1. Download JMeter from https://jmeter.apache.org/download_jmeter.cgi
2. Extract to a known location
3. Add `{jmeter-path}/bin` to your PATH environment variable
4. Test: Open PowerShell and run `jmeter -v`

### Running Tests

#### Option 1: Local Execution (Fastest for Development)

**Smoke Test (quick validation):**
```bash
npm run jmeter:local:smoke
```

**Load Test (sustained load):**
```bash
npm run jmeter:local:carga
```

**Stress Test (peak load):**
```bash
npm run jmeter:local:estres
```

**Resistance Test (long duration):**
```bash
npm run jmeter:local:resistencia
```

#### Option 2: Docker Execution (Reproducible & Isolated)

**Smoke Test:**
```bash
npm run jmeter:docker:smoke
```

**Load Test:**
```bash
npm run jmeter:docker:carga
```

**Stress Test:**
```bash
npm run jmeter:docker:estres
```

## 📊 Understanding the Results

### HTML Report Structure

After test execution, open the generated report:
```
jmeter/reports/html-report-YYYY-MM-DD_HH-MM-SS/index.html
```

**Key sections:**

1. **Summary Report**
   - Total requests sent
   - Success rate (%)
   - Average response time
   - Min/Max response times
   - 95th percentile (p95) latency
   - 99th percentile (p99) latency
   - Throughput (requests/second)

2. **Response Time Graph**
   - Visual representation of latency over time
   - Helps identify performance degradation

3. **Requests/Seconds**
   - Shows throughput consistency
   - Identifies bottlenecks

4. **Error Summary**
   - List of failed requests
   - HTTP error codes
   - Error messages

### Key Metrics Explained

| Metric | Meaning | Healthy Value |
|--------|---------|---------------|
| **Throughput (req/s)** | Requests processed per second | >100 for load test |
| **Avg Response Time** | Average time for requests | <500ms for most endpoints |
| **p95 Latency** | 95% of requests faster than this | <1000ms |
| **p99 Latency** | 99% of requests faster than this | <2000ms |
| **Error %** | Percentage of failed requests | <1% |
| **CPU/Memory** | Resource usage during test | CPU <80%, Memory <85% |

## 🔧 Scenario Descriptions

### Smoke Test (`scenario_smoke.jmx`)
- **Users:** 10 concurrent
- **Duration:** 1 minute
- **Ramp-up:** 30 seconds
- **Use case:** Quick validation before running full tests
- **Endpoints:** Basic authentication, product listing, user info

### Load Test (`scenario_carga.jmx`)
- **Users:** 100 concurrent
- **Ramp-up:** 2 minutes
- **Hold:** 5 minutes
- **Use case:** Sustained performance under normal peak load
- **Endpoints:** All CRUD operations (users, products, cart, orders)

### Stress Test (`scenario_estres.jmx`)
- **Users:** 500 concurrent
- **Ramp-up:** 3 minutes
- **Hold:** 3 minutes
- **Use case:** Identify breaking points and resource limits
- **Endpoints:** Heavy operations (reporting, bulk searches, payments)

### Resistance Test (`scenario_resistencia.jmx`)
- **Users:** 50 concurrent
- **Ramp-up:** 2 minutes
- **Hold:** 30 minutes
- **Use case:** Detect memory leaks and connection pool exhaustion
- **Endpoints:** Mix of all operations

## 📝 Test Plans Details

### 01_autenticacion.jmx
Tests JWT authentication flow:
- POST /auth/login (multiple users)
- Token extraction and reuse
- Token validation

### 02_usuarios.jmx
Tests user management:
- GET /usuarios (list with pagination)
- GET /usuarios/:id (retrieve specific user)
- POST /usuarios (create new user)
- PUT /usuarios/:id (update user)

### 03_productos.jmx
Tests product catalog:
- GET /productos (listing, filtering, pagination)
- GET /productos/:id (retrieve specific product)
- POST /productos (create, requires auth)
- PUT /productos/:id (update product)
- DELETE /productos/:id (delete product)

### 04_carrito_compras.jmx
Tests shopping cart flow:
1. User login → get token
2. Browse products
3. Add items to cart
4. View cart
5. Apply discount (if applicable)
6. Process checkout
7. Payment simulation

### 05_reportes.jmx
Tests report generation:
- GET /reportes (list available reports)
- POST /reportes/generate (generate PDF/Excel report)
- GET /reportes/:id/download (download generated report)

## 🔌 Test Data Management

### CSV Fixture Files

**usuarios.csv format:**
```csv
email,password,nombre
admin@ferremas.cl,Admin123!,Admin User
user1@ferremas.cl,User1234!,User One
user2@ferremas.cl,User2234!,User Two
...
```

**productos.csv format:**
```csv
nombre,categoria,precio,stock,sku
Martillo de Goma,Herramientas,15000,50,MART001
Destornillador Set,Herramientas,25000,30,DEST001
Taladro Eléctrico,Máquinas,85000,10,TAL001
...
```

### Generate/Reset Test Data

To initialize fresh test data in the database before running tests:

```bash
node jmeter/scripts/setup-fixtures.js
```

This script:
1. Connects to MySQL
2. Clears existing users and products
3. Creates reproducible test data
4. Exports to CSV files for JMeter

## 🐳 Docker Execution Details

### Running Tests in Docker

Docker execution provides:
- **Isolation:** Tests run in isolated containers
- **Reproducibility:** Consistent environment
- **Scalability:** Can easily add more JMeter agents

```bash
npm run jmeter:docker:carga
```

This will:
1. Build JMeter Docker image (if not exists)
2. Start MySQL and Backend services (if needed)
3. Run the specified scenario
4. Generate HTML report in `jmeter/reports/`
5. Clean up containers

### Viewing Logs

```bash
docker-compose -f docker-compose.jmeter.yml logs jmeter
```

### Stopping Tests

```bash
docker-compose -f docker-compose.jmeter.yml down
```

## 🐛 Troubleshooting

### Common Issues

**1. "Connection refused" errors**
```
Error: Failed to connect to backend:3000
```
**Solution:**
- Ensure backend service is running
- Check `config/environment.properties` HOST setting
- For local: ensure port 3000 is open
- For Docker: ensure services are in same network

**2. "Out of Memory" errors**
```
java.lang.OutOfMemoryError: Java heap space
```
**Solution:**
- Increase JMeter heap: `export HEAP="-Xmx4g -Xms2g"` before running
- Docker: Increase container memory in docker-compose.jmeter.yml

**3. Database connection errors**
```
Error: Too many connections
```
**Solution:**
- Run cleanup: `bash jmeter/scripts/cleanup-reports.sh`
- Reset test data: `node jmeter/scripts/setup-fixtures.js`
- Increase MySQL max_connections (FerremasDDBB.sql or docker-compose.yml)

**4. JWT token expiration**
```
401 Unauthorized
```
**Solution:**
- Tokens are automatically refreshed during tests
- If issues persist, reduce test duration or increase token TTL

See [TROUBLESHOOTING.md](TROUBLESHOOTING.md) for more details.

## 📚 Next Steps

1. **Read detailed guide:** [JMETER_GUIDE.md](JMETER_GUIDE.md)
2. **Understand test scenarios:** Review .jmx files in testplans/
3. **Run smoke test:** `npm run jmeter:local:smoke`
4. **Analyze results:** Open generated HTML report
5. **Adjust scenarios:** Modify load parameters as needed

## 🔄 CI/CD Integration (Optional)

To run JMeter tests automatically on each PR:

1. Create `.github/workflows/jmeter-tests.yml`
2. Configure smoke test to run on PR
3. Fail if latency p95 > threshold
4. See [DEVELOPMENT_README.md](../DEVELOPMENT_README.md) for setup

## 📞 Support

For issues or questions:
1. Check [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Review JMeter logs in `jmeter/reports/jmeter.log`
3. Consult [JMETER_GUIDE.md](JMETER_GUIDE.md)
4. Review backend logs in `Backend_Ferremas/_informes/`

---

**Last Updated:** May 2026
**JMeter Version:** 5.5+
**Status:** Ready for Load Testing
