# Ferremas Backend

## Endpoints principales

- **/api/auth/**: Login, registro, perfil
- **/api/productos/**: CRUD productos
- **/api/stock/**: Actualización y consulta de stock
- **/api/usuarios/**: CRUD usuarios
- **/api/sucursales/**: CRUD sucursales
- **/api/categorias/**: CRUD categorías
- **/api/marcas/**: CRUD marcas
- **/api/roles/**: CRUD roles (solo admin)
- **/api/ventas/**: Consulta y gestión de ventas
- **/api/pedidos/**: Gestión de pedidos
- **/api/pagos/**: Procesar y confirmar pagos
- **/api/inicio**: Info general
- **/api/logout**: Dummy logout

## Arquitectura
- Node.js + Express + Sequelize
- JWT para autenticación
- Middlewares para validación, roles y logs
- Integración con Transbank y API Dólar

## Pruebas
- Ejecuta `npm test` para correr pruebas (estructura lista, debes agregar tests)

## Variables de entorno
Ver archivo `.env` para configuración de base de datos, JWT, email, Transbank, etc.

## Notas
- El backend está listo para consumir desde un frontend (por ejemplo, Vue, React, Angular).
- Agrega más pruebas y documentación según lo requiera tu entrega.
