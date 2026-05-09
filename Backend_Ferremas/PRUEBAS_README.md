# 🛠️ Sistema de Pruebas Automatizadas - Ferremas

## 📋 Descripción General

Este proyecto contiene un conjunto completo de pruebas automatizadas para el sistema **Ferremas**, desarrolladas con **Cucumber** y **Selenium WebDriver**. Las pruebas cubren todas las funcionalidades principales del sistema, desde el registro de usuarios hasta la generación de reportes.

## 📊 Resumen de Casos de Prueba

| Feature | Archivo | Casos de Prueba | Descripción |
|---------|---------|-----------------|-------------|
| F01 | `01_RegistrarUsuario.feature` | CP22, CP22b, CP23, CP24, CP25, CP26 | Registro de usuarios (cliente, bodeguero) y validaciones |
| F02 | `02_Login.feature` | CP01, CP02, CP03, CP04 | Autenticación con credenciales válidas e inválidas |
| F03 | `03_RegistrarProducto.feature` | CP05, CP06, CP07 | Registro de productos y validación de datos |
| F04 | `04_ModificarProducto.feature` | CP08, CP09 | Modificación de productos existentes |
| F05 | `05_ModificarUsuario.feature` | CP10, CP11 | Actualización de datos de usuario |
| F06 | `06_EliminarUsuario.feature` | CP12, CP13 | Eliminación y cancelación de usuarios |
| F07 | `07_EliminarProducto.feature` | CP14, CP15 | Eliminación y cancelación de productos |
| F08 | `08_ListarUsuario.feature` | CP16 | Visualización de lista de usuarios |
| F09 | `09_ListarProducto.feature` | CP17 | Visualización de catálogo de productos |
| F10 | `10_BusquedaProducto.feature` | CP18, CP19 | Búsqueda de productos (existentes y no existentes) |
| F11 | `11_CarritoCompras.feature` | CP20, CP21 | Gestión de carrito y finalización de compras |
| F12 | `12_ModificarStock.feature` | - | Control y actualización de inventario |
| F13 | `13_Reportes.feature` | - | Generación de reportes del sistema |

**Total: 13 Features | 21+ Casos de Prueba Identificados**

## 🏗️ Arquitectura del Sistema de Pruebas

### **Tecnologías Utilizadas:**
- **Cucumber.js** - Framework de BDD (Behavior Driven Development)
- **Selenium WebDriver** - Automatización de navegador web
- **Chrome/ChromeDriver** - Navegador para ejecución de pruebas
- **Node.js** - Entorno de ejecución
- **Gherkin** - Lenguaje para escribir casos de prueba

### **Estructura del Proyecto:**
```
Backend_Ferremas/
├── features/                    # Archivos de características (.feature)
│   ├── 01_RegistrarUsuario.feature
│   ├── 02_Login.feature
│   ├── 03_RegistrarProducto.feature
│   ├── 04_ModificarProducto.feature
│   ├── 05_ModificarUsuario.feature
│   ├── 06_EliminarUsuario.feature
│   ├── 07_EliminarProducto.feature
│   ├── 08_ListarUsuario.feature
│   ├── 09_ListarProducto.feature
│   ├── 10_BusquedaProducto.feature
│   ├── 11_CarritoCompras.feature
│   ├── 12_ModificarStock.feature
│   ├── 13_Reportes.feature
│   ├── step_definitions/        # Definiciones de pasos
│   └── support/                 # Configuración y hooks
├── _evidencias/                 # Evidencias automáticas generadas
├── _debug/                      # Capturas de depuración
└── package.json                 # Configuración del proyecto
```

## 🎯 Casos de Prueba Detallados

### **F01 - Registrar Usuario** 
*Archivo: `01_RegistrarUsuario.feature`*

#### **CP22: Registrar usuario correcto**
**Objetivo:** Validar el registro exitoso de un usuario con datos válidos
**Pasos:**
1. **Given** el usuario accede a la página de registro como administrador
2. **When** accede al formulario de registro de usuario
3. **And** ingreso nombre de usuario "Cliente"
4. **And** ingreso email de usuario "cliente@cliente.com"
5. **And** ingreso contraseña de usuario "Cliente.1234"
6. **And** ingreso rut de usuario "12345678-8"
7. **And** selecciono rol de usuario "Cliente"
8. **And** click en crear usuario
9. **Then** usuario se crea correctamente
10. **And** aparece en la lista de usuarios

#### **CP22b: Registrar usuario bodeguero correcto**
**Objetivo:** Validar el registro exitoso de un usuario con rol de bodeguero
**Pasos:**
1. **Given** el usuario accede a la página de registro como administrador
2. **When** accede al formulario de registro de usuario
3. **And** ingreso nombre de usuario "Bodeguero"
4. **And** ingreso email de usuario "bodeguero@bodeguero.com"
5. **And** ingreso contraseña de usuario "Bodeguero.1234"
6. **And** ingreso rut de usuario "12345678-6"
7. **And** selecciono rol de usuario "Bodeguero"
8. **And** click en crear usuario
9. **Then** usuario se crea correctamente
10. **And** aparece en la lista de usuarios

#### **CP23: Registrar usuario con mail duplicado**
**Objetivo:** Validar que el sistema no permita registrar usuarios con email duplicado
**Pasos:**
1. **Given** el usuario accede a la página de registro como administrador
2. **When** accede al formulario de registro de usuario
3. **And** ingreso nombre de usuario "mailduplicado"
4. **And** ingreso email de usuario "an.salcedo@duocuc.cl" *(email ya existente)*
5. **And** ingreso contraseña de usuario "Mailduplicado.1234"
6. **And** ingreso rut de usuario "12345678-5"
7. **And** selecciono rol de usuario "Vendedor"
8. **And** click en crear usuario
9. **Then** aparece mensaje de mail ya registrado

#### **CP24: Registrar usuario con mail vacío**
**Objetivo:** Validar que el sistema requiera email obligatorio
**Pasos:**
1. **Given** el usuario accede a la página de registro como administrador
2. **When** accede al formulario de registro de usuario
3. **And** ingreso nombre de usuario "mailvacio"
4. **And** ingreso email de usuario "" *(vacío)*
5. **And** ingreso contraseña de usuario "Mailvacio.1234"
6. **And** ingreso rut de usuario "12345678-3"
7. **And** selecciono rol de usuario "Vendedor"
8. **And** click en crear usuario
9. **Then** aparece mensaje de que falta ingresar email

#### **CP25: Registrar usuario con rut duplicado**
**Objetivo:** Validar que el sistema no permita RUT duplicados
**Pasos:**
1. **Given** el usuario accede a la página de registro como administrador
2. **When** accede al formulario de registro de usuario
3. **And** ingreso nombre de usuario "rutduplicado"
4. **And** ingreso email de usuario "rutduplicado@rutduplicado.com"
5. **And** ingreso contraseña de usuario "Rutduplicado.1234"
6. **And** ingreso rut de usuario "19134035-3" *(RUT ya existente)*
7. **And** selecciono rol de usuario "Vendedor"
8. **And** click en crear usuario
9. **Then** aparece mensaje de que el rut ya está registrado

#### **CP26: Registrar usuario con rut vacío**
**Objetivo:** Validar que el sistema requiera RUT obligatorio
**Pasos:**
1. **Given** el usuario accede a la página de registro como administrador
2. **When** accede al formulario de registro de usuario
3. **And** ingreso nombre de usuario "rutvacio"
4. **And** ingreso email de usuario "rutvacio@rutvacio.com"
5. **And** ingreso contraseña de usuario "Rutvacio.1234"
6. **And** ingreso rut de usuario "" *(vacío)*
7. **And** selecciono rol de usuario "Vendedor"
8. **And** click en crear usuario
9. **Then** aparece mensaje de que falta ingresar el rut

---

### **F02 - Login**
*Archivo: `02_Login.feature`*

#### **CP01: Login correcto**
**Objetivo:** Validar el acceso exitoso con credenciales válidas
**Pasos:**
1. **Given** el usuario accede a la página de login
2. **When** ingreso email de login "an.salcedo@duocuc.cl"
3. **And** ingreso contraseña de login "Admin.123456789"
4. **And** realizo el envío de los datos de login
5. **Then** aparece un mensaje de ingreso correcto

#### **CP02: Login vacío**
**Objetivo:** Validar que el sistema rechace credenciales vacías
**Pasos:**
1. **Given** el usuario accede a la página de login
2. **When** ingreso email de login "" *(vacío)*
3. **And** ingreso contraseña de login "" *(vacío)*
4. **And** realizo el envío de los datos de login
5. **Then** aparece un mensaje de datos equivocados

#### **CP03: Login user correcto, password incorrecto**
**Objetivo:** Validar que el sistema rechace credenciales con password incorrecto
**Pasos:**
1. **Given** el usuario accede a la página de login
2. **When** ingreso email de login "an.salcedo@duocuc.cl"
3. **And** ingreso contraseña de login "Contraseñamalo" *(incorrecta)*
4. **And** realizo el envío de los datos de login
5. **Then** aparece un mensaje de datos equivocados

#### **CP04: Login user incorrecto, password incorrecto**
**Objetivo:** Validar que el sistema rechace credenciales completamente incorrectas
**Pasos:**
1. **Given** el usuario accede a la página de login
2. **When** ingreso email de login "adminmalo" *(incorrecto)*
3. **And** ingreso contraseña de login "passwordmala" *(incorrecta)*
4. **And** realizo el envío de los datos de login
5. **Then** aparece un mensaje de datos equivocados

---

### **F03 - Registrar Producto**
*Archivo: `03_RegistrarProducto.feature`*

#### **CP05: Registrar producto correcto**
**Objetivo:** Validar el registro exitoso de un producto con datos válidos
**Pasos:**
1. **Given** el usuario accede a la página de registro de producto como administrador
2. **When** accede al formulario de registro de producto
3. **And** ingreso nombre de producto "Producto1"
4. **And** ingreso descripción de producto "Producto1"
5. **And** ingreso precio de producto "11000"
6. **And** selecciono marca de producto "Bosch"
7. **And** selecciono categoría de producto "Herramientas Eléctricas"
8. **Then** el sistema guarda el producto correctamente
9. **And** lo muestra en el catálogo de productos

#### **CP06: Registrar producto vacío**
**Objetivo:** Validar que el sistema requiera datos obligatorios del producto
**Pasos:**
1. **Given** el usuario accede a la página de registro de producto como administrador
2. **When** accede al formulario de registro de producto
3. **And** ingreso nombre de producto "" *(vacío)*
4. **And** ingreso descripción de producto "" *(vacío)*
5. **And** ingreso precio de producto "" *(vacío)*
6. **And** selecciono marca de producto "" *(vacío)*
7. **And** selecciono categoría de producto "" *(vacío)*
8. **Then** aparece mensaje de datos faltantes en producto

#### **CP07: Registrar producto con precio negativo**
**Objetivo:** Validar que el sistema no permita precios negativos
**Pasos:**
1. **Given** el usuario accede a la página de registro de producto como administrador
2. **When** accede al formulario de registro de producto
3. **And** ingreso nombre de producto "Producto2"
4. **And** ingreso descripción de producto "Producto2"
5. **And** ingreso precio de producto "-1" *(negativo)*
6. **And** selecciono marca de producto "Bosch"
7. **And** selecciono categoría de producto "Herramientas Eléctricas"
8. **Then** aparece mensaje de valor debe ser mayor a 0 en producto

#### **CP08: Registrar producto con precio 0**
**Objetivo:** Validar que el sistema no permita precio en 0
**Pasos:**
1. **Given** el usuario accede a la página de registro de producto como administrador
2. **When** accede al formulario de registro de producto
3. **And** ingreso nombre de producto "Producto2"
4. **And** ingreso descripción de producto "Producto2"
5. **And** ingreso precio de producto "0" *(cero)*
6. **And** selecciono marca de producto "Bosch"
7. **And** selecciono categoría de producto "Herramientas Eléctricas"
8. **Then** aparece mensaje de valor debe ser mayor a 0 en producto

---

### **F04 - Modificar Producto**
*Archivo: `04_ModificarProducto.feature`*

#### **CP09: Modificar producto correcto**
**Objetivo:** Validar la modificación exitosa de un producto
**Pasos:**
1. **Given** el usuario accede a la página de modificar producto como administrador
2. **When** accede al formulario de modificar producto
3. **And** ingreso nombre de producto modificado "Producto4"
4. **Then** el sistema guarda la modificación del producto correctamente
5. **And** lo muestra en el catálogo de productos

#### **CP10: Modificar producto vacío**
**Objetivo:** Validar que el sistema no permita campos vacíos en modificación
**Pasos:**
1. **Given** el usuario accede a la página de modificar producto como administrador
2. **When** accede al formulario de modificar producto
3. **And** ingreso nombre de producto modificado "" *(vacío)*
4. **And** ingreso descripción de producto modificado "" *(vacío)*
5. **And** ingreso precio de producto modificado "" *(vacío)*
6. **And** selecciono marca de producto modificado "" *(vacío)*
7. **And** selecciono categoría de producto modificado "" *(vacío)*
8. **Then** aparece mensaje de datos faltantes en producto modificado

#### **CP11: Modificar producto con precio negativo**
**Objetivo:** Validar que el sistema no permita precios negativos en modificación
**Pasos:**
1. **Given** el usuario accede a la página de modificar producto como administrador
2. **When** accede al formulario de modificar producto
3. **And** ingreso precio de producto modificado "-1" *(negativo)*
4. **Then** aparece mensaje de valor debe ser mayor a 0 en producto modificado

#### **CP12: Modificar producto con precio 0**
**Objetivo:** Validar que el sistema no permita precio 0 en modificación
**Pasos:**
1. **Given** el usuario accede a la página de modificar producto como administrador
2. **When** accede al formulario de modificar producto
3. **And** ingreso precio de producto modificado "0" *(cero)*
4. **Then** aparece mensaje de valor debe ser mayor a 0 en producto modificado

---

### **F05 - Modificar Usuario**
*Archivo: `05_ModificarUsuario.feature`*

#### **CP27: Modificar usuario correcto**
**Objetivo:** Validar la modificación exitosa de un usuario
**Pasos:**
1. **Given** el usuario accede a la página de modificar usuario como administrador
2. **When** accede al listado de usuario para modificar
3. **And** click en modificar usuario "Juan Pérez"
4. **And** ingreso nombre de usuario modificado "Juan Pérez 2"
5. **And** ingreso contraseña de usuario modificado "Contraseña.1234"
6. **And** selecciono rol de usuario modificado "Administrador"
7. **And** selecciono sucursal de usuario modificado "Sucursal Santiago Centro2"
8. **And** click en crear usuario modificado
9. **Then** aparece mensaje de que usuario modificado exitosamente
10. **And** muestra lista de usuarios modificados

#### **CP28: Modificar usuario con rut duplicado**
**Objetivo:** Validar que el sistema no permita RUT duplicado en modificación
**Pasos:**
1. **Given** el usuario accede a la página de modificar usuario como administrador
2. **When** accede al listado de usuario para modificar
3. **And** click en modificar usuario "Juan Pérez"
4. **And** ingreso contraseña de usuario modificado "Contraseña.1234"
5. **And** ingreso rut de usuario modificado "19134035-3" *(duplicado)*
6. **And** selecciono rol de usuario modificado "Administrador"
7. **And** selecciono sucursal de usuario modificado "Sucursal Santiago Centro2"
8. **And** click en crear usuario modificado
9. **Then** aparece mensaje de que el rut ya está registrado en usuario modificado

#### **CP29: Modificar usuario con rut vacío**
**Objetivo:** Validar que el sistema requiera RUT en modificación
**Pasos:**
1. **Given** el usuario accede a la página de modificar usuario como administrador
2. **When** accede al listado de usuario para modificar
3. **And** click en modificar usuario "Juan Pérez"
4. **And** ingreso contraseña de usuario modificado "Contraseña.1234"
5. **And** ingreso rut de usuario modificado "" *(vacío)*
6. **And** selecciono rol de usuario modificado "Administrador"
7. **And** selecciono sucursal de usuario modificado "Sucursal Santiago Centro"
8. **And** click en crear usuario modificado
9. **Then** aparece mensaje de que falta ingresar el rut en usuario modificado

#### **CP30: Modificar usuario con mail duplicado**
**Objetivo:** Validar que el sistema no permita email duplicado en modificación
**Pasos:**
1. **Given** el usuario accede a la página de modificar usuario como administrador
2. **When** accede al listado de usuario para modificar
3. **And** click en modificar usuario "Juan Pérez"
4. **And** ingreso contraseña de usuario modificado "Contraseña.1234"
5. **And** ingreso email de usuario modificado "an.salcedo@duocuc.cl" *(duplicado)*
6. **And** selecciono rol de usuario modificado "Administrador"
7. **And** selecciono sucursal de usuario modificado "Sucursal Santiago Centro"
8. **And** click en crear usuario modificado
9. **Then** aparece mensaje de que el email ya está registrado en usuario modificado

#### **CP31: Modificar usuario con mail vacío**
**Objetivo:** Validar que el sistema requiera email en modificación
**Pasos:**
1. **Given** el usuario accede a la página de modificar usuario como administrador
2. **When** accede al listado de usuario para modificar
3. **And** click en modificar usuario "Juan Pérez"
4. **And** ingreso contraseña de usuario modificado "Contraseña.1234"
5. **And** ingreso email de usuario modificado "" *(vacío)*
6. **And** selecciono rol de usuario modificado "Administrador"
7. **And** selecciono sucursal de usuario modificado "Sucursal Santiago Centro"
8. **And** click en crear usuario modificado
9. **Then** aparece mensaje de que falta ingresar el email en usuario modificado

---

### **F06 - Eliminar Usuario**
*Archivo: `06_EliminarUsuario.feature`*

#### **CP33: Eliminar usuario correcto**
**Objetivo:** Validar la eliminación exitosa de un usuario
**Pasos:**
1. **Given** el usuario accede a la página de eliminar usuario como administrador
2. **When** accede al listado de usuario para eliminar
3. **And** click en eliminar usuario "Juan Pérez"
4. **And** click en confirmar eliminación de usuario
5. **Then** aparece mensaje de usuario eliminado exitosamente
6. **And** el usuario es eliminado de la lista de usuarios registrados

#### **CP34: Cancelar eliminar usuario**
**Objetivo:** Validar que se pueda cancelar la eliminación de un usuario
**Pasos:**
1. **Given** el usuario accede a la página de eliminar usuario como administrador
2. **When** accede al listado de usuario para eliminar
3. **And** click en eliminar usuario "Juan Pérez"
4. **And** click en cancelar eliminación de usuario
5. **Then** muestra lista de usuarios tras cancelar eliminación
6. **And** el usuario no es eliminado de la lista de usuarios registrados

---

### **F07 - Eliminar Producto**
*Archivo: `07_EliminarProducto.feature`*

#### **CP16: Eliminar producto correcto**
**Objetivo:** Validar la eliminación exitosa de un producto
**Pasos:**
1. **Given** el usuario accede a la página de eliminar producto como administrador
2. **When** accede al listado de productos para eliminar
3. **And** selecciona eliminar producto "Taladro X200"
4. **And** confirma la eliminación de producto
5. **Then** el sistema elimina el registro de producto correctamente
6. **And** lo refleja en el catálogo de productos

#### **CP17: Cancelar eliminar producto**
**Objetivo:** Validar que se pueda cancelar la eliminación de un producto
**Pasos:**
1. **Given** el usuario accede a la página de eliminar producto como administrador
2. **When** accede al listado de productos para eliminar
3. **And** selecciona eliminar producto "Taladro X200"
4. **And** cancela la eliminación de producto
5. **Then** muestra lista de productos tras cancelar eliminación
6. **And** el producto no es eliminado del catálogo de productos

---

### **F08 - Listar Usuario**
*Archivo: `08_ListarUsuario.feature`*

#### **CP32: Listar usuario completo**
**Objetivo:** Validar que se muestren todos los usuarios registrados
**Pasos:**
1. **Given** el usuario accede a la página como administrador
2. **When** accede al listado de usuario
3. **Then** muestra listado de todos los usuarios registrados

---

### **F09 - Listar Producto**
*Archivo: `09_ListarProducto.feature`*

#### **CP13: Listar producto completo**
**Objetivo:** Validar que se muestren todos los productos
**Pasos:**
1. **Given** el usuario accede a la página como administrador
2. **When** accede a productos
3. **Then** el sistema muestra los productos correspondientes

#### **CP14: Listar producto con filtro categoría**
**Objetivo:** Validar el filtrado de productos por categoría
**Pasos:**
1. **Given** el usuario accede a la página como administrador
2. **When** accede a productos
3. **And** selecciona categoría "Herramientas Eléctricas"
4. **And** Click en Filtrar
5. **Then** el sistema muestra los productos correspondientes

#### **CP15: Listar producto con filtro sucursal**
**Objetivo:** Validar el filtrado de productos por sucursal
**Pasos:**
1. **Given** el usuario accede a la página como administrador
2. **When** accede a productos
3. **And** selecciona sucursal "Sucursal Santiago Centro"
4. **And** Click en Filtrar
5. **Then** el sistema muestra los productos correspondientes

---

### **F10 - Búsqueda Producto**
*Archivo: `10_BusquedaProducto.feature`*

#### **CP36: Búsqueda producto existente**
**Objetivo:** Validar la búsqueda de productos existentes
**Pasos:**
1. **Given** el usuario accede a la página como cliente
2. **When** accede a productos
3. **And** escribe "Taladro X200" en la barra de búsqueda
4. **And** presiona enter o hace clic en el botón de filtrar
5. **Then** el sistema muestra los productos que coinciden con la búsqueda

#### **CP37: Búsqueda producto vacío**
**Objetivo:** Validar la búsqueda con términos vacíos
**Pasos:**
1. **Given** el usuario accede a la página como cliente
2. **When** accede a productos
3. **And** escribe "" en la barra de búsqueda *(vacío)*
4. **And** presiona enter o hace clic en el botón de filtrar
5. **Then** el sistema muestra todos los productos

#### **CP38: Búsqueda por categoría**
**Objetivo:** Validar la búsqueda por categoría específica
**Pasos:**
1. **Given** el usuario accede a la página como cliente
2. **When** accede a productos
3. **And** selecciona categoría "Herramientas Eléctricas"
4. **And** presiona enter o hace clic en el botón de filtrar
5. **Then** el sistema muestra los productos que coinciden con la búsqueda

---

### **F11 - Carrito Compras**
*Archivo: `11_CarritoCompras.feature`*

#### **CP18: Agregar al carrito**
**Objetivo:** Validar que se puedan agregar productos al carrito
**Pasos:**
1. **Given** el usuario accede a la página como cliente
2. **When** accede a productos
3. **And** selecciona un producto "Taladro X200"
4. **And** lo agrega al carrito
5. **Then** el sistema actualiza el carrito con el producto

#### **CP19: Calcular total carrito**
**Objetivo:** Validar el cálculo automático del total del carrito
**Pasos:**
1. **Given** el usuario accede a la página como cliente
2. **When** accede a productos
3. **And** selecciona un producto "Taladro X200"
4. **And** lo agrega al carrito
5. **And** accede a mi pedido
6. **Then** el sistema actualiza el carrito con el producto y subtotal

#### **CP20: Seleccionar método pago**
**Objetivo:** Validar la selección de método de pago
**Pasos:**
1. **Given** el usuario accede a la página como cliente
2. **When** accede a productos
3. **And** selecciona un producto "Taladro X200"
4. **And** lo agrega al carrito
5. **And** accede a mi pedido
6. **And** selecciona método de pago "Crédito"
7. **Then** el sistema actualiza el carrito con el producto y subtotal

#### **CP21: Seleccionar sucursal entrega**
**Objetivo:** Validar la selección de sucursal de entrega
**Pasos:**
1. **Given** el usuario accede a la página como cliente
2. **When** accede a productos
3. **And** selecciona un producto "Taladro X200"
4. **And** lo agrega al carrito
5. **And** accede a mi pedido
6. **And** selecciona sucursal "Sucursal Santiago centro2"
7. **Then** el sistema actualiza el carrito con el producto y subtotal

---

### **F12 - Modificar Stock**
*Archivo: `12_ModificarStock.feature`*

#### **CP39: Bodeguero actualiza stock correcto**
**Objetivo:** Validar que el bodeguero pueda actualizar stock correctamente
**Pasos:**
1. **Given** el usuario accede a la página como bodeguero
2. **When** accede a Stock General
3. **And** selecciona actualizar en el producto "Taladro X200"
4. **And** cambia cantidad a "500"
5. **And** presiona enter o hace clic en el botón de actualizar
6. **Then** aparece mensaje de stock actualizado
7. **And** se actualiza el valor del stock en la lista de stock general

#### **CP40: Bodeguero actualiza stock con valor negativo**
**Objetivo:** Validar que el sistema no permita stock negativo
**Pasos:**
1. **Given** el usuario accede a la página como bodeguero
2. **When** accede a Stock General
3. **And** selecciona actualizar en el producto "Taladro X200"
4. **And** cambia cantidad a "-1" *(negativo)*
5. **And** presiona enter o hace clic en el botón de actualizar
6. **Then** aparece mensaje de que el valor debe ser igual o mayor a 0

#### **CP41: Bodeguero actualiza stock con valor 0**
**Objetivo:** Validar que el sistema permita stock en 0
**Pasos:**
1. **Given** el usuario accede a la página como bodeguero
2. **When** accede a Stock General
3. **And** selecciona actualizar en el producto "Taladro X200"
4. **And** cambia cantidad a "0" *(cero)*
5. **And** presiona enter o hace clic en el botón de actualizar
6. **Then** aparece mensaje de stock actualizado
7. **And** se actualiza el valor del stock en la lista de stock general

---

### **F13 - Reportes**
*Archivo: `13_Reportes.feature`*

#### **CP35: Generar informe ventas mensual**
**Objetivo:** Validar la generación de reportes de ventas mensuales
**Pasos:**
1. **Given** el usuario accede a la página como administrador
2. **When** accede a Informe Ventas Mensual
3. **And** selecciona sucursal "Sucursal Santiago Centro"
4. **And** click en crear
5. **Then** muestra informe de ventas del mes

---

## 🚀 Cómo Ejecutar las Pruebas

### **Prerequisitos:**
```bash
# Instalar dependencias
npm install

# Instalar ChromeDriver (si es necesario)
npm run install-chromedriver
```

### **Comandos de Ejecución:**

#### **🆕 Ejecución con Informes Automáticos (Recomendado):**
```powershell
# PowerShell - Ejecutar todas las pruebas con informe completo
.\run-tests.ps1

# PowerShell - Ejecutar feature específica con informe
.\run-tests.ps1 -Feature "01_RegistrarUsuario.feature"

# PowerShell - Ejecutar y abrir informe automáticamente
.\run-tests.ps1 -AbrirInforme

# Batch - Alternativa para ejecutar con informes
run-tests.bat
```

#### **Ejecución tradicional:**
```bash
# Ejecutar todas las pruebas
npm run features

# Ejecutar una feature específica
npm run features -- features/01_RegistrarUsuario.feature
npm run features -- features/02_Login.feature
npm run features -- features/03_RegistrarProducto.feature
# ... etc

# Ejecutar un escenario específico
npm run features -- --name "CP22 Registrar usuario correcto"
npm run features -- --name "CP01 Login correcto"

# Modo dry-run (verificar sintaxis)
npm run features -- --dry-run
```

## 📸 Sistema de Evidencias Automáticas

### **Funcionalidades:**
- ✅ **Captura automática** de pantalla en cada paso
- ✅ **Código fuente HTML** de cada página visitada
- ✅ **Reportes detallados** por escenario
- ✅ **Nomenclatura clara** con timestamps
- ✅ **Organización automática** por feature

### **Ubicación de Evidencias:**
```
_evidencias/
├── F01_Registrar_Usuario_Step01_[descripcion]_[timestamp].png
├── F01_Registrar_Usuario_Step01_[descripcion]_[timestamp].html
├── F01_Registrar_Usuario_Step02_[descripcion]_[timestamp].png
└── ...

_informes/
├── terminal_output_[timestamp].txt           # Captura completa de terminal
├── execution_log_[timestamp].log             # Log detallado de ejecución
├── informe_pruebas_[timestamp].html          # Informe visual interactivo
└── informe_pruebas_[timestamp].md            # Informe en formato Markdown

_debug/
├── F01_Registrar_Usuario_CP22_[timestamp].png  # Screenshots finales
└── ...
```

## 📊 Sistema de Informes Automáticos

### **Características del Sistema:**
- 📹 **Captura completa de terminal** durante la ejecución
- 🌐 **Informes HTML interactivos** con métricas visuales
- 📝 **Informes Markdown** para documentación
- 📊 **Análisis automático** de resultados y errores
- ⏱️ **Métricas de tiempo** y rendimiento
- 🎨 **Diseño profesional** con código de colores

### **Tipos de Informes Generados:**

#### **1. Informe HTML Visual** 🌐
- Dashboard interactivo con métricas
- Gráficos de estado de escenarios y pasos
- Salida de terminal embebida con scroll
- Diseño responsive y profesional
- Lista detallada de errores (si los hay)

#### **2. Captura de Terminal** 📄
- Salida completa de consola preservada
- Timestamps de inicio y fin
- Duración total de ejecución
- Código de salida y estado final

#### **3. Informe Markdown** 📝
- Formato compatible con GitHub/GitLab
- Tablas de métricas organizadas
- Recomendaciones automáticas
- Análisis de cobertura de pruebas

#### **4. Log de Ejecución** 📋
- Información detallada del proceso
- Errores y warnings específicos
- Metadata completa de la ejecución

## 🎯 Tipos de Validaciones

### **Validaciones de Entrada:**
- Campos obligatorios (email, RUT, nombre)
- Formatos válidos (email, RUT)
- Valores únicos (email y RUT no duplicados)
- Rangos de valores (precios > 0, stock >= 0)

### **Validaciones de Proceso:**
- Autenticación correcta
- Autorización por roles
- Flujos de navegación
- Estados de la aplicación

### **Validaciones de Salida:**
- Mensajes de éxito/error apropiados
- Actualización correcta de datos
- Visualización de información
- Generación de reportes

## 🔧 Configuración Técnica

### **Configuración del Navegador:**
- **Chrome** con ventana visible (no headless)
- **Resolución:** 1920x1080
- **Timeouts:** 60 segundos por paso, 10 segundos implícitos
- **Opciones:** `--no-sandbox`, `--disable-dev-shm-usage`, `--disable-gpu`

### **URL Base:**
- **Desarrollo:** `http://127.0.0.1:8000`
- **Limpieza automática** de datos de prueba antes de cada escenario

### **Estructura de Archivos:**
- **Features:** Archivos `.feature` con casos de prueba en Gherkin
- **Step Definitions:** Implementación de los pasos en JavaScript
- **Support:** Configuración, hooks y utilidades
- **Evidencias:** Capturas automáticas organizadas por timestamp

## 📊 Métricas y Reportes

### **Información Capturada:**
- ✅ Total de escenarios ejecutados
- ✅ Escenarios exitosos vs fallidos
- ✅ Tiempo de ejecución por escenario
- ✅ Evidencias visuales de cada paso
- ✅ Código fuente de páginas visitadas
- ✅ Logs detallados de ejecución

### **Formato de Salida:**
```
42 scenarios (28 failed, 12 undefined, 2 passed)
281 steps (28 failed, 19 undefined, 126 skipped, 108 passed)
14m48.679s (executing steps: 14m48.252s)
```

## 🛠️ Mantenimiento y Desarrollo

### **Agregar Nuevos Casos de Prueba:**
1. Crear/modificar archivo `.feature` con sintaxis Gherkin
2. Implementar steps correspondientes en `step_definitions/`
3. Probar cambios con ejecución individual
4. Actualizar documentación si es necesario

### **Debugging de Pruebas Fallidas:**
1. Revisar screenshots en `_evidencias/` del paso fallido
2. Analizar código HTML capturado
3. Analizar logs de consola durante ejecución
4. Verificar selectores CSS/XPath en step definitions

## 🔧 Solución de Problemas Comunes

### **Error: "ChromeDriver not found"**
```bash
# Solución 1: Instalar ChromeDriver
npm run install-chromedriver

# Solución 2: Verificar PATH de sistema
which chromedriver   # Linux/Mac
where chromedriver   # Windows

# Solución 3: Variable de entorno
export CHROME_BIN=/path/to/chrome  # Linux/Mac
set CHROME_BIN=<ruta-a-chrome>   # Windows
```

### **Error: "Connection refused to localhost:8000"**
```bash
# Verificar que el servidor esté corriendo
curl http://127.0.0.1:8000/api/health

# Iniciar el servidor backend
cd ../Frontend_Ferremas
python manage.py runserver 8000

# Verificar puertos en uso
netstat -ano | findstr :8000    # Windows
lsof -i :8000                   # Linux/Mac
```

### **Error: "Element not found" o timeouts**
```javascript
// En step definitions, aumentar esperas explícitas:
await driver.wait(until.elementLocated(By.id('elemento')), 20000);

// Verificar que el elemento esté visible:
await driver.wait(until.elementIsVisible(element), 10000);

// Scroll hasta el elemento:
await driver.executeScript("arguments[0].scrollIntoView();", element);
```

### **Evidencias no se generan correctamente**
```bash
# Verificar permisos de escritura
ls -la _evidencias/     # Linux/Mac  
dir _evidencias\        # Windows

# Limpiar evidencias manualmente
rm -rf _evidencias/*    # Linux/Mac
del /Q _evidencias\*    # Windows

# Verificar espacio en disco
df -h .                 # Linux/Mac
dir /-c                 # Windows
```

### **Pruebas muy lentas**
```javascript
// En hooks.js, reducir esperas innecesarias:
await this.driver.sleep(500); // En lugar de 1000

// Optimizar selectores:
By.id('elemento')              // Más rápido
By.className('clase')          // Medio
By.xpath('//div[@class="x"]')  // Más lento
```

### **Problemas de memoria con Chrome**
```javascript
// En hooks.js, añadir opciones de Chrome:
options.addArguments(
  '--memory-pressure-off',
  '--no-first-run',
  '--disable-extensions',
  '--disable-plugins'
);
```

### **Base de datos en estado inconsistente**
```bash
# Reiniciar base de datos de pruebas
cd ../Frontend_Ferremas
python manage.py migrate --run-syncdb
python manage.py loaddata fixtures/initial_data.json
```
