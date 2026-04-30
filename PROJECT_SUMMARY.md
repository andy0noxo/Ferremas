# Ferremas — Resumen del Proyecto

Este documento recopila lo trabajado en el repositorio Ferremas: propósito, características, prerequisitos, pasos para ejecutar la aplicación (backend + frontend), cómo ejecutar todas las pruebas automatizadas y pasos útiles para análisis de calidad (SonarQube).

**Última actualización:** 2026-04-30

**Contenido rápido**
- **Stack:** Node.js (Backend), Django (Frontend), MySQL, Selenium/Cucumber para pruebas.
- **Directorios clave:** Backend: [Backend_Ferremas](Backend_Ferremas/), Frontend: [ferremas_frontend](ferremas_frontend/)

**Características principales**
- API REST con autenticación JWT, roles y CRUD completo para usuarios/productos/pedidos.
- Integración Transbank para pagos (modo integración configurable).
- Pruebas automatizadas BDD (Cucumber + Selenium) y pruebas unitarias con Jest.
- Sistema de informes: HTML / Markdown / Excel y captura de evidencias (screenshots).

**Prerrequisitos (local / desarrollo)**
- Git
- Docker Desktop (WSL2 recomendado) — para levantar stack y SonarQube.
- Node.js >= 16 (recomendado 18) y npm >= 8
- Python >= 3.8 y virtualenv / pip (para frontend Django)
- MySQL client si trabajas fuera de Docker
- Chrome + chromedriver (para pruebas Selenium) — la suite incluye scripts para instalar chromedriver

**Resumen de archivos README útiles**
- [Backend_Ferremas/README.md](Backend_Ferremas/README.md) — API, endpoints, instalación y scripts.
- [Backend_Ferremas/DEVELOPMENT_README.md](Backend_Ferremas/DEVELOPMENT_README.md) — guía de desarrollo, Dockerfile y VS Code.
- [Backend_Ferremas/ENV_README.md](Backend_Ferremas/ENV_README.md) — variables `.env` necesarias.
- [Backend_Ferremas/PRUEBAS_README.md](Backend_Ferremas/PRUEBAS_README.md) — detalle de features Cucumber y casos.
- [Backend_Ferremas/INFORMES_README.md](Backend_Ferremas/INFORMES_README.md) — generación de informes y estructura de `_informes`.
- [Backend_Ferremas/TESTS_CONTROLLERS_SUMMARY.md](Backend_Ferremas/TESTS_CONTROLLERS_SUMMARY.md) — resumen de cobertura y mapeo de tests.

**Cómo obtener el repositorio**
```bash
git clone <repo_url>
cd Ferremas
```

**Levantar la aplicación con Docker (recomendado)**
1. En la raíz del repo hay un `docker-compose.yml` que levanta la base de datos, backend y frontend. Para levantar la aplicación:
```powershell
cd "D:\DUOC\semestre 6\Automatización de Pruebas\3\EA3\Entregable\Ferremas"
docker compose up -d
```
2. Verificar estado:
```powershell
docker ps
# Backend: http://localhost:3000
# Frontend: http://localhost:8000
```

Si necesitas SonarQube (análisis estático):
```powershell
docker compose -f docker-compose.sonarqube.yml up -d
# SonarQube: http://localhost:9000
```

**Instalación manual (sin Docker)**
1. Backend
```bash
cd Backend_Ferremas
npm install
# Crear .env a partir de .env.example y rellenar variables (ver ENV_README.md)
npm run db:create # o importar FerremasDDBB.sql
npm run db:migrate
npm start
# API: http://localhost:3000
```

2. Frontend (Django)
```bash
cd ferremas_frontend
python -m venv .venv
source .venv/Scripts/activate   # Windows PowerShell: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:8000
# Frontend: http://localhost:8000
```

**Ejecutar pruebas automatizadas (BDD & Jest)**

1. Generar cobertura (Jest)
```bash
cd Backend_Ferremas
npm run test:coverage
# Resultado: coverage/lcov.info y carpeta coverage/
```

2. Ejecutar pruebas Cucumber (BDD + Selenium)
```bash
cd Backend_Ferremas
# Ejecutar todas las features (usa Chromedriver)
npm run features
# O utilizar scripts para reportes y ejecución avanzada
./run-tests.ps1         # PowerShell (abre informe si se pide)
```

3. Visualizar informes
- HTML coverage: `coverage/lcov-report/index.html`
- Informes de pruebas: `_informes/*.html` y `_informes/*.md`

**Integración con SonarQube (análisis estático)**
1. Levantar SonarQube (comentar más arriba).
2. En SonarQube crear proyecto `ferremas-backend` y generar token.
3. Ejecutar scanner (ejemplo usando contenedor):
```powershell
cd Backend_Ferremas
# En Windows / Docker usar host.docker.internal para que el contenedor escanee el servidor local
docker run --rm -e SONAR_HOST_URL="http://host.docker.internal:9000" \
  -e SONAR_LOGIN="<PROJECT_TOKEN>" -v "${PWD}:/usr/src" sonarsource/sonar-scanner-cli
```
4. En SonarQube revisar dashboard del proyecto y las métricas.

**Variables importantes (.env)**
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
- `JWT_SECRET`, `JWT_EXPIRES_IN`
- `TRANSBANK_API_KEY`, `TRANSBANK_ENVIRONMENT`
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASS`
- `PORT` (backend)

Todos los detalles y valores recomendados están en `Backend_Ferremas/ENV_README.md`.

**Comandos útiles rápidos**
- Levantar app con Docker: `docker compose up -d`
- Levantar SonarQube: `docker compose -f docker-compose.sonarqube.yml up -d`
- Ejecutar coverage: `npm run test:coverage`
- Ejecutar BDD: `npm run features` o `./run-tests.ps1`
- Ejecutar scanner Sonar: ver sección SonarQube (usar token generado)

**Resumen de resultados actuales (último run)**
- Cobertura global (Jest): 90.51% statements (ver Backend_Ferremas/TESTS_CONTROLLERS_SUMMARY.md).
- Tests: 421 passed (30 suites) — ver `Backend_Ferremas/TESTS_CONTROLLERS_SUMMARY.md`.
- SonarQube: análisis enviado y dashboard actualizado (ejecución local completada).

**Siguientes pasos recomendados**
- Añadir `docker-compose` para SonarQube al CI/CD si se desea análisis automático.
- Añadir tareas de GitHub Actions / Jenkins para `npm run test:coverage` y envío a Sonar.
- Revisar y reasignar secretos (TRANSBANK, EMAIL, JWT) en un vault para producción.

---

Si quieres, adapto este `PROJECT_SUMMARY.md` (más breve o más detallado) o lo publico en la raíz del repo y añado enlaces directos a las secciones específicas que prefieras.
