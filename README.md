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

## 🚀 Inicio Rápido

### 1. Prerrequisitos
```bash
# Verificar versiones
node --version    # >= 18.x
npm --version     # >= 9.x
python --version  # >= 3.8
```

### 2. Configuración del Backend
```bash
cd Backend_Ferremas
npm install
npm start
```

### 3. Configuración del Frontend
```bash
cd Frontend_Ferremas
pip install -r requirements.txt
python manage.py runserver
```

### 4. Ejecutar Pruebas Automatizadas
```bash
cd Backend_Ferremas
# Ejecutar todas las pruebas
npm run features

# Ejecutar con reportes automáticos
./run-tests.ps1
```

## 📚 Documentación Detallada

Para información específica de cada componente:

- 📖 **[Backend README](Backend_Ferremas/README.md)** - API, configuración y desarrollo
- 📖 **[Pruebas README](Backend_Ferremas/PRUEBAS_README.md)** - Sistema de testing completo
- 📖 **[Informes README](Backend_Ferremas/INFORMES_README.md)** - Reportes y evidencias

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

## 🚀 ¡Empezar Ahora!

```bash
# Clonar y configurar
git clone <repository>
cd Ferremas

# Backend
cd Backend_Ferremas
npm install && npm start

# Frontend (nueva terminal)
cd Frontend_Ferremas
pip install -r requirements.txt
python manage.py runserver

# Pruebas (nueva terminal)
cd Backend_Ferremas
./run-tests.ps1 -AbrirInforme
```

**¡El sistema estará corriendo en minutos!** 🎉