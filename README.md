# 🛠️ Ferremas - Sistema de Gestión de Ferretería

## 📋 Descripción del Proyecto

**Ferremas** es un sistema integral de gestión para ferreterías que incluye funcionalidades completas de administración de productos, usuarios, inventario y ventas. Este proyecto está desarrollado con una arquitectura moderna que combina un backend robusto en Node.js con un frontend intuitivo en Django.

## 🏗️ Arquitectura del Sistema

### 🔧 Backend (Node.js + Express)
- **API RESTful** con autenticación JWT
- **Base de datos** MySQL con modelos relacionales
- **Middleware** de seguridad y validación
- **Sistema de roles** (Administrador, Bodeguero, Cliente)
- **Gestión completa** de productos, usuarios y transacciones

### 🎨 Frontend (Django + Python)
- **Interfaz web** responsive y moderna
- **Gestión de usuarios** y perfiles
- **Catálogo de productos** con búsqueda avanzada
- **Sistema de pedidos** y carrito de compras
- **Panel administrativo** para gestión de inventario

## 🚀 Características Principales

### 👥 Gestión de Usuarios
- ✅ Registro y autenticación de usuarios
- ✅ Perfiles diferenciados (Cliente, Bodeguero, Administrador)
- ✅ Validación de datos y seguridad
- ✅ Gestión de sesiones

### 📦 Gestión de Productos
- ✅ CRUD completo de productos
- ✅ Categorización y marcas
- ✅ Control de stock e inventario
- ✅ Búsqueda y filtrado avanzado

### 🛒 Sistema de Ventas
- ✅ Carrito de compras dinámico
- ✅ Proceso de checkout
- ✅ Gestión de pedidos
- ✅ Historial de transacciones

### 📊 Reportes y Análisis
- ✅ Reportes de ventas
- ✅ Análisis de inventario
- ✅ Estadísticas de usuarios
- ✅ Dashboard administrativo

## 🧪 Sistema de Pruebas Automatizadas

Este proyecto incluye un **sistema completo de pruebas automatizadas** usando:

- **🥒 Cucumber (BDD)** - Pruebas de comportamiento
- **🔍 Selenium WebDriver** - Automatización de navegador
- **📊 Reportes automáticos** - Excel, HTML y Markdown
- **📸 Captura de evidencias** - Screenshots y HTML

### Casos de Prueba Implementados (41 casos)
- **CP01a-CP04**: Registro de usuarios
- **CP05a-CP07**: Autenticación y login
- **CP08a-CP10**: Gestión de productos
- **CP11a-CP14**: Modificación de productos
- **Y muchos más...**

## 📁 Estructura del Proyecto

```
Ferremas/
├── 📊 FerremasDDBB.sql          # Base de datos
├── 📖 README.md                 # Este archivo
├── 🔧 Backend_Ferremas/         # API y lógica de negocio
│   ├── 🧪 features/             # Pruebas BDD (Cucumber)
│   ├── 📜 scripts/              # Scripts de automatización
│   ├── 💻 src/                  # Código fuente del backend
│   └── 📊 _informes/            # Reportes generados
└── 🎨 Frontend_Ferremas/        # Interfaz de usuario
    ├── 🐍 ferremas_frontend/    # Aplicación Django
    ├── 📋 requirements.txt      # Dependencias Python
    └── 🗃️ db.sqlite3           # Base de datos local
```

## 🛠️ Tecnologías Utilizadas

### Backend
- ![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
- ![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
- ![MySQL](https://img.shields.io/badge/MySQL-8.x-blue)
- ![JWT](https://img.shields.io/badge/JWT-Auth-orange)

### Frontend
- ![Django](https://img.shields.io/badge/Django-4.x-darkgreen)
- ![Python](https://img.shields.io/badge/Python-3.8+-blue)
- ![SQLite](https://img.shields.io/badge/SQLite-Local-lightblue)

### Testing
- ![Cucumber](https://img.shields.io/badge/Cucumber-9.6.0-brightgreen)
- ![Selenium](https://img.shields.io/badge/Selenium-4.11.3-yellow)
- ![Chrome](https://img.shields.io/badge/Chrome-Driver-red)

## 📊 Estado del Proyecto

| Componente | Estado | Cobertura |
|------------|--------|-----------|
| 🔧 Backend API | ✅ Completo | 100% |
| 🎨 Frontend Web | ✅ Completo | 100% |
| 🧪 Pruebas Auto | ✅ Completo | 41 casos |
| 📊 Reportes | ✅ Completo | 100% |
| 📖 Documentación | ✅ Completo | 100% |

## 🤝 Contribución

Este proyecto es parte del curso de **Automatización de Pruebas** - DUOC UC.

### Equipo de Desarrollo
- Implementación de arquitectura completa
- Sistema de pruebas automatizadas BDD
- Generación de reportes profesionales
- Documentación técnica completa

## 📄 Licencia

Proyecto educativo - DUOC UC © 2025

---

## 🚀 Guía paso a paso para usar el proyecto

### 1. Lo que necesitas instalar primero
Antes de comenzar, instala estas herramientas en tu computador:
- **Git** para descargar el proyecto desde GitHub.
- **Docker Desktop** para levantar la base de datos, el backend y el frontend con un solo comando.
- **Node.js 18 o superior** para ejecutar las pruebas del backend.
- **Python 3.8 o superior** para ejecutar el frontend Django.

Si no sabes si ya las tienes, abre una terminal y prueba:

```bash
git --version
docker --version
node --version
python --version
```

### 2. Descargar el proyecto desde GitHub
La carpeta donde lo guardes puede ser distinta a la mía. Elige cualquier carpeta vacía en tu computador y ejecuta los comandos desde ahí.

```bash
cd <ruta-donde-guardes-el-proyecto>
git clone https://github.com/USUARIO/REPOSITORIO.git Ferremas
cd Ferremas
code .
```

Reemplaza `https://github.com/USUARIO/REPOSITORIO.git` por la URL real del repositorio.

### 3. Correr todo el proyecto con Docker
Este es el camino más fácil para una persona que recién empieza.

1. Abre **Docker Desktop** y espera a que muestre que está listo.
2. Abre una terminal en la carpeta raíz del proyecto, la misma donde está `docker-compose.yml`.
3. Ejecuta:

```bash
docker compose up --build
```

4. Espera a que termine de construir las imágenes. La primera vez puede tardar varios minutos.
5. Cuando termine, abre estas direcciones en tu navegador:
    - Frontend: `http://localhost:8000`
    - Backend: `http://localhost:3000/api/status`

Para detener todo después, usa:

```bash
docker compose down
```

### 4. Ejecutar el proyecto sin Docker
Si no quieres usar Docker, también puedes correr el proyecto de forma manual. En este caso necesitas tener instalado **MySQL** en tu computador, porque el backend trabaja con una base de datos local.

Yo ya comprobé que las pruebas automáticas del backend con **Jest** sí se ejecutan sin Docker en modo local. Para levantar todo manualmente, sigue estos pasos:

1. Instala estas herramientas si todavía no las tienes:
    - Git
    - Node.js 18 o superior
    - Python 3.8 o superior
    - MySQL Server
    - Chrome, si vas a ejecutar pruebas con Selenium

2. Descarga el proyecto en la carpeta que tú prefieras:

```bash
cd <ruta-donde-guardes-el-proyecto>
git clone https://github.com/USUARIO/REPOSITORIO.git Ferremas
cd Ferremas
```

3. Crea las bases de datos locales en MySQL:
    - `ferremas`
    - `ferremas_test`

Si prefieres usar consola, puedes escribir:

```sql
CREATE DATABASE ferremas;
CREATE DATABASE ferremas_test;
```

4. Configura el backend:
    - Entra a la carpeta `Backend_Ferremas`.
    - Copia `.env.example` y guárdalo como `.env`.
    - Asegúrate de que estos valores apunten a tu MySQL local:
      - `DB_HOST=localhost`
      - `DB_PORT=3306`
      - `DB_USER=root` o tu usuario local
      - `DB_PASSWORD=tu_clave_mysql`
      - `DB_NAME=ferremas`
      - `NODE_ENV=development`

5. Instala las dependencias del backend:

```bash
cd Backend_Ferremas
npm install
```

6. Ejecuta el backend manualmente:

```bash
cd Backend_Ferremas
npm start
```

7. Ejecuta el frontend manualmente:

```bash
cd ferremas_frontend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python manage.py runserver 0.0.0.0:8000
```

8. Abre el navegador en `http://localhost:8000` para usar el frontend y en `http://localhost:3000/api/status` para comprobar el backend.

9. Si algo falla:
    - Revisa que MySQL esté encendido.
    - Revisa que el archivo `.env` tenga las credenciales correctas.
    - Revisa que existan las bases de datos `ferremas` y `ferremas_test`.
    - Si Windows no reconoce `python`, prueba con `py`.

### 5. Correr solo el backend si lo necesitas
Si quieres trabajar solo con la API del backend, entra a la carpeta del backend:

```bash
cd Backend_Ferremas
npm install
npm start
```

Eso levanta el backend en el puerto `3000`. Si vas a usar esta forma, asegúrate de tener configuradas las variables de entorno y la base de datos.

### 6. Ejecutar las pruebas que ya están hechas
El proyecto tiene varias pruebas documentadas y automatizadas. Estas son las principales:

```bash
# Ir al backend
cd Backend_Ferremas

# Pruebas unitarias e integración con Jest
npm test

# Ver cobertura de pruebas
npm run test:coverage

# Pruebas de comportamiento con Cucumber y Selenium
npm run features

# Ejecutar una feature específica
npm run features:single -- features/02_Login.feature

# Generar reportes de las features
npm run features:report

# Ejecutar el análisis de vulnerabilidades OWASP ZAP
npm run zap:scan
```

Los reportes y evidencias se guardan dentro de `Backend_Ferremas/_informes/` y la cobertura de Jest en `Backend_Ferremas/coverage/`.

### 7. Resumen rápido de lo que hace cada prueba
- **`npm test`**: ejecuta las pruebas automáticas de JavaScript con Jest.
- **`npm run features`**: ejecuta las pruebas de comportamiento del sistema.
- **`npm run features:report`**: genera reportes de las features.
- **`npm run zap:scan`**: revisa vulnerabilidades web con OWASP ZAP usando Docker.

## 📚 Documentación útil que se mantiene

- 📖 **[Backend README](Backend_Ferremas/README.md)** - Referencia técnica de la API y endpoints.
- 📖 **[Backend Development README](Backend_Ferremas/DEVELOPMENT_README.md)** - Configuración para desarrollo.
- 📖 **[Backend ENV README](Backend_Ferremas/ENV_README.md)** - Variables de entorno y configuración.
- 📖 **[Backend Pruebas README](Backend_Ferremas/PRUEBAS_README.md)** - Guía completa de pruebas automáticas.
- 📖 **[Backend Jest Best Practices](Backend_Ferremas/JEST_BEST_PRACTICES.md)** - Reglas y recomendaciones para Jest.
- 📖 **[Project Summary](PROJECT_SUMMARY.md)** - Resumen corto del proyecto y sus componentes.